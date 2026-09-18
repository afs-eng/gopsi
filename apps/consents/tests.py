import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import UserRole
from apps.clinics.models import Clinic, ClinicMembership
from apps.consents.models import ConsentRecord, ConsentStatus, ConsentTemplate
from apps.patients.models import Patient
from apps.professionals.models import Professional


def make_user(username: str, role: str = UserRole.PROFESSIONAL):
    return get_user_model().objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password="safe-test-password",
        full_name=username.replace("-", " ").title(),
        global_role=role,
    )


def make_context(username="consents-admin", clinic_name="Clínica Consentimentos"):
    user = make_user(username)
    clinic = Clinic.objects.create(name=clinic_name)
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
    )
    Professional.objects.create(
        clinic=clinic,
        full_name="Dra. Consentimentos",
        profession="Psicóloga",
        crp="06/123456",
        crp_state="SP",
    )
    patient = Patient.objects.create(
        clinic=clinic,
        full_name="Paciente Consentimentos",
        created_by=user,
    )
    return user, clinic, patient


@pytest.mark.django_db
def test_clinic_admin_can_create_consent_template():
    user, clinic, _patient = make_context()
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("consent-template-list"),
        {
            "clinic": str(clinic.id),
            "title": "Termo de teleatendimento",
            "template_type": "TELEHEALTH",
            "version": "1.0",
            "body": "Declaro ciência sobre atendimento online.",
            "is_required": True,
        },
        format="json",
    )

    template = ConsentTemplate.objects.get(title="Termo de teleatendimento")
    assert response.status_code == 201
    assert template.clinic == clinic
    assert template.created_by == user


@pytest.mark.django_db
def test_consent_record_stores_accepted_template_snapshot():
    user, clinic, patient = make_context()
    template = ConsentTemplate.objects.create(
        clinic=clinic,
        title="Política de privacidade",
        template_type="PRIVACY_POLICY",
        version="1.0",
        body="Texto aceito na versão um.",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("consent-record-list"),
        {
            "clinic": str(clinic.id),
            "template": str(template.id),
            "patient": str(patient.id),
            "status": "ACCEPTED",
            "ip_address": "192.0.2.10",
            "user_agent": "pytest",
        },
        format="json",
    )
    template.body = "Texto alterado depois do aceite."
    template.version = "1.1"
    template.save()

    record = ConsentRecord.objects.get(patient=patient)
    assert response.status_code == 201
    assert record.accepted_by == user
    assert record.document_title == "Política de privacidade"
    assert record.document_type == "PRIVACY_POLICY"
    assert record.document_version == "1.0"
    assert record.document_body == "Texto aceito na versão um."


@pytest.mark.django_db
def test_user_cannot_list_consent_records_from_other_tenant():
    user, clinic, patient = make_context()
    other_user, other_clinic, _other_patient = make_context(
        "other-consents-admin",
        "Outra Clínica Consentimentos",
    )
    template = ConsentTemplate.objects.create(
        clinic=clinic,
        title="Termo interno",
        template_type="INFORMED_CONSENT",
        version="1.0",
        body="Conteúdo interno.",
        created_by=user,
    )
    ConsentRecord.objects.create(
        clinic=clinic,
        template=template,
        patient=patient,
        accepted_by=user,
        document_title=template.title,
        document_type=template.template_type,
        document_version=template.version,
        document_body=template.body,
    )
    client = APIClient()
    client.force_authenticate(user=other_user)

    response = client.get(reverse("consent-record-list"), {"clinic": other_clinic.id})

    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.django_db
def test_consent_record_rejects_patient_from_another_clinic():
    user, clinic, _patient = make_context()
    _other_user, _other_clinic, other_patient = make_context(
        "other-consent-patient",
        "Clínica Paciente Externo",
    )
    template = ConsentTemplate.objects.create(
        clinic=clinic,
        title="Termo LGPD",
        template_type="DATA_PROCESSING",
        version="1.0",
        body="Autorizo tratamento de dados.",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("consent-record-list"),
        {
            "clinic": str(clinic.id),
            "template": str(template.id),
            "patient": str(other_patient.id),
            "status": "ACCEPTED",
        },
        format="json",
    )

    assert response.status_code == 400
    assert not ConsentRecord.objects.exists()


@pytest.mark.django_db
def test_clinic_admin_can_revoke_consent_record():
    user, clinic, patient = make_context()
    template = ConsentTemplate.objects.create(
        clinic=clinic,
        title="Autorização específica",
        template_type="SPECIFIC_AUTHORIZATION",
        version="1.0",
        body="Autorização para finalidade específica.",
        created_by=user,
    )
    record = ConsentRecord.objects.create(
        clinic=clinic,
        template=template,
        patient=patient,
        accepted_by=user,
        document_title=template.title,
        document_type=template.template_type,
        document_version=template.version,
        document_body=template.body,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(reverse("consent-record-revoke", kwargs={"pk": record.id}))
    record.refresh_from_db()

    assert response.status_code == 200
    assert record.status == ConsentStatus.REVOKED
    assert record.revoked_at is not None


@pytest.mark.django_db
def test_consent_record_requires_patient_or_subject_user():
    user, clinic, _patient = make_context()
    template = ConsentTemplate.objects.create(
        clinic=clinic,
        title="Termo sem titular",
        template_type="OTHER",
        version="1.0",
        body="Texto.",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("consent-record-list"),
        {
            "clinic": str(clinic.id),
            "template": str(template.id),
            "status": "ACCEPTED",
        },
        format="json",
    )

    assert response.status_code == 400
    assert not ConsentRecord.objects.exists()


@pytest.mark.django_db
def test_platform_operator_is_denied_consent_list_detail_write_and_revoke():
    user, clinic, patient = make_context()
    template = ConsentTemplate.objects.create(
        clinic=clinic,
        title="Termo protegido",
        template_type="INFORMED_CONSENT",
        version="1.0",
        body="Conteúdo protegido.",
        created_by=user,
    )
    record = ConsentRecord.objects.create(
        clinic=clinic,
        template=template,
        patient=patient,
        accepted_by=user,
        document_title=template.title,
        document_type=template.template_type,
        document_version=template.version,
        document_body=template.body,
    )
    platform_operator = make_user("platform-consents-operator", UserRole.SUPERADMIN)
    ClinicMembership.objects.create(
        clinic=clinic,
        user=platform_operator,
        role=UserRole.CLINIC_ADMIN,
    )
    Professional.objects.create(
        clinic=clinic,
        user=platform_operator,
        full_name="Operador Consentimentos",
        profession="Psicólogo",
        crp="06/654321",
        crp_state="SP",
    )
    client = APIClient()
    client.force_authenticate(user=platform_operator)

    assert client.get(
        reverse("consent-template-list"), {"clinic": str(clinic.id)}
    ).status_code == 403
    assert client.get(
        reverse("consent-record-list"), {"clinic": str(clinic.id)}
    ).status_code == 403
    assert client.get(
        reverse("consent-record-detail", kwargs={"pk": record.id})
    ).status_code == 403
    assert client.post(
        reverse("consent-template-list"),
        {
            "clinic": str(clinic.id),
            "title": "Tentativa do operador",
            "template_type": "OTHER",
            "version": "1.0",
            "body": "Não deve salvar.",
        },
        format="json",
    ).status_code == 403
    assert client.post(
        reverse("consent-record-revoke", kwargs={"pk": record.id})
    ).status_code == 403
