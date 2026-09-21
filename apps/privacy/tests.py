import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import UserRole
from apps.audit.models import AuditAction, AuditEvent
from apps.clinics.models import Clinic, ClinicMembership
from apps.patients.models import Patient
from apps.privacy.models import DataSubjectRequest, DataSubjectRequestStatus
from apps.professionals.models import Professional


def make_user(username: str, role: str = UserRole.CLINIC_ADMIN):
    return get_user_model().objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password="safe-test-password",
        full_name=username.replace("-", " ").title(),
        global_role=role,
    )


def make_context(username="privacy-admin", clinic_name="Clínica Privacy"):
    user = make_user(username)
    clinic = Clinic.objects.create(name=clinic_name)
    ClinicMembership.objects.create(
        clinic=clinic, user=user, role=UserRole.CLINIC_ADMIN
    )
    patient = Patient.objects.create(
        clinic=clinic,
        full_name="Paciente Privacy",
        created_by=user,
    )
    return user, clinic, patient


@pytest.mark.django_db
def test_clinic_admin_can_create_privacy_request_with_audit():
    user, clinic, patient = make_context()
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("privacy-request-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(patient.id),
            "request_type": "ACCESS",
            "description": "Solicitação de acesso aos dados.",
            "requester_name": "Paciente Privacy",
            "requester_email": "paciente@example.com",
        },
        format="json",
    )

    privacy_request = DataSubjectRequest.objects.get(patient=patient)
    assert response.status_code == 201
    assert privacy_request.created_by == user
    assert AuditEvent.objects.filter(
        action=AuditAction.DATA_REQUEST_CREATED,
        resource_id=str(privacy_request.id),
    ).exists()


@pytest.mark.django_db
def test_privacy_request_rejects_patient_from_other_clinic():
    user, clinic, _patient = make_context()
    _other_user, _other_clinic, other_patient = make_context(
        "other-privacy-admin",
        "Outra Privacy",
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("privacy-request-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(other_patient.id),
            "request_type": "ACCESS",
            "description": "Inválida.",
            "requester_name": "Paciente externo",
        },
        format="json",
    )

    assert response.status_code == 400
    assert not DataSubjectRequest.objects.exists()


@pytest.mark.django_db
def test_updating_privacy_request_sets_handler_completion_and_audit():
    user, clinic, patient = make_context()
    privacy_request = DataSubjectRequest.objects.create(
        clinic=clinic,
        patient=patient,
        request_type="PORTABILITY",
        description="Exportar dados.",
        requester_name="Paciente Privacy",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.patch(
        reverse("privacy-request-detail", kwargs={"pk": privacy_request.id}),
        {"status": "FULFILLED", "response_summary": "Dados exportados."},
        format="json",
    )
    privacy_request.refresh_from_db()

    assert response.status_code == 200
    assert privacy_request.status == DataSubjectRequestStatus.FULFILLED
    assert privacy_request.handled_by == user
    assert privacy_request.completed_at is not None
    assert AuditEvent.objects.filter(
        action=AuditAction.DATA_REQUEST_UPDATED,
        resource_id=str(privacy_request.id),
    ).exists()


@pytest.mark.django_db
def test_platform_operator_is_denied_privacy_request_list_detail_and_write():
    user, clinic, patient = make_context()
    privacy_request = DataSubjectRequest.objects.create(
        clinic=clinic,
        patient=patient,
        request_type="ACCESS",
        description="Solicitação protegida.",
        requester_name=patient.full_name,
        created_by=user,
    )
    platform_operator = make_user(
        "platform-privacy-operator", UserRole.SUPERADMIN
    )
    ClinicMembership.objects.create(
        clinic=clinic,
        user=platform_operator,
        role=UserRole.CLINIC_ADMIN,
    )
    Professional.objects.create(
        clinic=clinic,
        user=platform_operator,
        full_name="Operador Privacidade",
        profession="Psicólogo",
        crp="06/654321",
        crp_state="SP",
    )
    client = APIClient()
    client.force_authenticate(user=platform_operator)

    assert client.get(
        reverse("privacy-request-list"), {"clinic": str(clinic.id)}
    ).status_code == 403
    assert client.get(
        reverse("privacy-request-detail", kwargs={"pk": privacy_request.id})
    ).status_code == 403
    assert client.post(
        reverse("privacy-request-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(patient.id),
            "request_type": "DELETION",
            "description": "Tentativa do operador.",
            "requester_name": patient.full_name,
        },
        format="json",
    ).status_code == 403
