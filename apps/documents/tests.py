import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import UserRole
from apps.clinics.models import Clinic, ClinicMembership
from apps.documents.models import DocumentTemplate, GeneratedDocument
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


def make_context(username="documents-admin", clinic_name="Clínica Documentos"):
    user = make_user(username)
    clinic = Clinic.objects.create(name=clinic_name)
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
    )
    professional = Professional.objects.create(
        clinic=clinic,
        full_name="Dra. Documentos",
        profession="Psicóloga",
        crp="06/123456",
        crp_state="SP",
    )
    patient = Patient.objects.create(
        clinic=clinic,
        full_name="Paciente Documentos",
        created_by=user,
    )
    return user, clinic, professional, patient


@pytest.mark.django_db
def test_clinic_admin_can_create_document_template():
    user, clinic, _professional, _patient = make_context()
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("document-template-list"),
        {
            "clinic": str(clinic.id),
            "name": "Declaração de comparecimento",
            "template_type": "DECLARATION",
            "body": "Declaro comparecimento em atendimento.",
        },
        format="json",
    )

    assert response.status_code == 201
    template = DocumentTemplate.objects.get(name="Declaração de comparecimento")
    assert template.clinic == clinic
    assert template.created_by == user


@pytest.mark.django_db
def test_user_cannot_list_documents_from_other_tenant():
    user, clinic, professional, patient = make_context()
    other_user, other_clinic, _other_professional, _other_patient = make_context(
        "other-documents-admin",
        "Outra Clínica",
    )
    GeneratedDocument.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        title="Documento interno",
        content="Conteúdo protegido.",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=other_user)

    response = client.get(
        reverse("generated-document-list"),
        {"clinic": str(other_clinic.id)},
    )

    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.django_db
def test_document_rejects_patient_from_another_clinic():
    user, clinic, professional, _patient = make_context()
    _other_user, _other_clinic, _other_professional, other_patient = make_context(
        "other-patient-admin",
        "Clínica Paciente Externo",
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("generated-document-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(other_patient.id),
            "professional": str(professional.id),
            "title": "Documento inválido",
            "content": "Não deve salvar.",
            "status": "DRAFT",
        },
        format="json",
    )

    assert response.status_code == 400
    assert not GeneratedDocument.objects.filter(title="Documento inválido").exists()


@pytest.mark.django_db
def test_authenticated_user_can_download_document_pdf():
    user, clinic, professional, patient = make_context()
    document = GeneratedDocument.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        title="Declaração",
        content="Paciente compareceu ao atendimento.",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(reverse("generated-document-pdf", kwargs={"pk": document.id}))

    assert response.status_code == 200
    assert response["Content-Type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")


@pytest.mark.django_db
def test_platform_operator_denied_documents_crud_download_and_finalize():
    user, clinic, professional, patient = make_context()
    template = DocumentTemplate.objects.create(
        clinic=clinic,
        name="Modelo protegido",
        body="Conteúdo protegido.",
        created_by=user,
    )
    document = GeneratedDocument.objects.create(
        clinic=clinic,
        template=template,
        patient=patient,
        professional=professional,
        title="Documento protegido",
        content="Conteúdo protegido.",
        created_by=user,
    )
    platform_operator = make_user("platform-documents-operator", UserRole.SUPERADMIN)
    ClinicMembership.objects.create(
        clinic=clinic,
        user=platform_operator,
        role=UserRole.CLINIC_ADMIN,
    )
    Professional.objects.create(
        clinic=clinic,
        user=platform_operator,
        full_name="Operador Documentos",
        profession="Psicólogo",
        crp="06/654321",
        crp_state="SP",
    )
    client = APIClient()
    client.force_authenticate(user=platform_operator)

    assert client.get(
        reverse("document-template-list"), {"clinic": str(clinic.id)}
    ).status_code == 403
    assert client.get(
        reverse("generated-document-list"), {"clinic": str(clinic.id)}
    ).status_code == 403
    assert client.get(
        reverse("generated-document-detail", kwargs={"pk": document.id})
    ).status_code == 403
    assert client.post(
        reverse("document-template-list"),
        {
            "clinic": str(clinic.id),
            "name": "Tentativa do operador",
            "body": "Não deve salvar.",
        },
        format="json",
    ).status_code == 403
    assert client.get(
        reverse("generated-document-pdf", kwargs={"pk": document.id})
    ).status_code == 403
    assert client.post(
        reverse("generated-document-finalize", kwargs={"pk": document.id})
    ).status_code == 403
