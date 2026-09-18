import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import UserRole
from apps.audit.models import AuditAction, AuditEvent
from apps.clinics.models import Clinic, ClinicMembership


def make_user(username: str, role: str = UserRole.CLINIC_ADMIN):
    return get_user_model().objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password="safe-test-password",
        full_name=username.replace("-", " ").title(),
        global_role=role,
    )


@pytest.mark.django_db
def test_clinic_admin_lists_only_own_audit_events():
    user = make_user("audit-admin")
    clinic = Clinic.objects.create(name="Clínica Audit")
    other_clinic = Clinic.objects.create(name="Outra Audit")
    ClinicMembership.objects.create(
        clinic=clinic, user=user, role=UserRole.CLINIC_ADMIN
    )
    own_event = AuditEvent.objects.create(
        clinic=clinic,
        actor=user,
        action=AuditAction.LOGIN_SUCCESS,
    )
    other_event = AuditEvent.objects.create(
        clinic=other_clinic,
        action=AuditAction.LOGIN_FAILED,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(reverse("audit-event-list"), {"clinic": clinic.id})

    returned_ids = {item["id"] for item in response.json()}
    assert response.status_code == 200
    assert str(own_event.id) in returned_ids
    assert str(other_event.id) not in returned_ids


@pytest.mark.django_db
def test_platform_operator_cannot_list_clinical_audit_events():
    platform_operator = make_user("platform-audit-list", UserRole.SUPERADMIN)
    clinic = Clinic.objects.create(name="Clínica Audit Protegida")
    event = AuditEvent.objects.create(
        clinic=clinic,
        action=AuditAction.MEDICAL_RECORD_VIEWED,
    )
    client = APIClient()
    client.force_authenticate(user=platform_operator)

    response = client.get(reverse("audit-event-list"), {"clinic": clinic.id})

    assert response.status_code == 403
    assert str(event.id) not in response.content.decode()


@pytest.mark.django_db
def test_platform_operator_cannot_retrieve_clinical_audit_event():
    platform_operator = make_user("platform-audit-detail", UserRole.SUPERADMIN)
    clinic = Clinic.objects.create(name="Clínica Audit Protegida")
    event = AuditEvent.objects.create(
        clinic=clinic,
        action=AuditAction.MEDICAL_RECORD_VIEWED,
    )
    client = APIClient()
    client.force_authenticate(user=platform_operator)

    response = client.get(
        reverse("audit-event-detail", kwargs={"pk": event.id})
    )

    assert response.status_code == 403


@pytest.mark.django_db
def test_platform_operator_cannot_write_clinical_audit_events():
    platform_operator = make_user("platform-audit-write", UserRole.SUPERADMIN)
    client = APIClient()
    client.force_authenticate(user=platform_operator)

    response = client.post(
        reverse("audit-event-list"),
        {"action": AuditAction.LOGIN_SUCCESS},
        format="json",
    )

    assert response.status_code == 403
    assert not AuditEvent.objects.exists()
