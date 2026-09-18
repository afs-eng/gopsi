import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import UserRole
from apps.appointments.models import Appointment
from apps.clinics.models import Clinic, ClinicMembership
from apps.medical_records.models import (
    MedicalRecordAuditAction,
    MedicalRecordAuditEvent,
    MedicalRecordEntry,
    MedicalRecordEntryStatus,
    MedicalRecordEntryVersion,
)
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


def make_clinic_context():
    user = make_user("psychologist", UserRole.PSYCHOLOGIST)
    clinic = Clinic.objects.create(name="Clínica A")
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.PSYCHOLOGIST,
    )
    professional = Professional.objects.create(
        clinic=clinic,
        user=user,
        full_name="Dra. Ana",
        profession="Psicóloga",
        crp="06/123456",
        crp_state="SP",
    )
    patient = Patient.objects.create(
        clinic=clinic,
        full_name="Paciente A",
        created_by=user,
    )
    appointment = Appointment.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        date="2026-10-01",
        start_time="09:00:00",
        end_time="09:50:00",
    )
    return user, clinic, professional, patient, appointment


@pytest.mark.django_db
def test_professional_can_create_medical_record_with_history_and_audit():
    user, clinic, professional, patient, appointment = make_clinic_context()
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("medical-record-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(patient.id),
            "professional": str(professional.id),
            "appointment": str(appointment.id),
            "entry_type": "EVOLUTION",
            "status": "FINAL",
            "content": "Paciente orientado e estável na sessão.",
        },
        format="json",
    )

    entry = MedicalRecordEntry.objects.get(patient=patient)
    assert response.status_code == 201
    assert entry.created_by == user
    assert MedicalRecordEntryVersion.objects.filter(entry=entry, version=1).exists()
    assert MedicalRecordAuditEvent.objects.filter(
        entry=entry,
        action=MedicalRecordAuditAction.CREATED,
        actor=user,
    ).exists()


@pytest.mark.django_db
def test_receptionist_cannot_create_medical_record():
    receptionist = make_user("receptionist", UserRole.RECEPTIONIST)
    _user, clinic, professional, patient, appointment = make_clinic_context()
    ClinicMembership.objects.create(
        clinic=clinic,
        user=receptionist,
        role=UserRole.RECEPTIONIST,
    )
    client = APIClient()
    client.force_authenticate(user=receptionist)

    response = client.post(
        reverse("medical-record-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(patient.id),
            "professional": str(professional.id),
            "appointment": str(appointment.id),
            "content": "Conteúdo clínico restrito.",
        },
        format="json",
    )

    assert response.status_code == 403
    assert not MedicalRecordEntry.objects.exists()


@pytest.mark.django_db
def test_user_cannot_list_medical_records_from_other_tenant():
    user, clinic, professional, patient, _appointment = make_clinic_context()
    other_clinic = Clinic.objects.create(name="Clínica B")
    other_professional = Professional.objects.create(
        clinic=other_clinic,
        full_name="Dra. B",
        profession="Psicóloga",
        crp="06/999999",
        crp_state="SP",
    )
    other_patient = Patient.objects.create(
        clinic=other_clinic,
        full_name="Paciente B",
        created_by=user,
    )
    own_entry = MedicalRecordEntry.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        content="Registro da clínica A.",
        created_by=user,
    )
    other_entry = MedicalRecordEntry.objects.create(
        clinic=other_clinic,
        patient=other_patient,
        professional=other_professional,
        content="Registro da clínica B.",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(reverse("medical-record-list"), {"clinic": clinic.id})

    assert response.status_code == 200
    returned_ids = {item["id"] for item in response.json()}
    assert str(own_entry.id) in returned_ids
    assert str(other_entry.id) not in returned_ids


@pytest.mark.django_db
def test_platform_operator_cannot_access_records_or_audit_with_accidental_access():
    platform_operator = make_user("platform-record-denial", UserRole.SUPERADMIN)
    clinic = Clinic.objects.create(name="Clínica prontuário protegida")
    ClinicMembership.objects.create(
        clinic=clinic,
        user=platform_operator,
        role=UserRole.CLINIC_ADMIN,
        is_active=True,
    )
    professional = Professional.objects.create(
        clinic=clinic,
        user=platform_operator,
        full_name="Operador com perfil clínico",
        profession="Psicólogo",
        is_active=True,
    )
    patient = Patient.objects.create(
        clinic=clinic,
        full_name="Paciente de prontuário protegido",
        created_by=platform_operator,
    )
    appointment = Appointment.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        date="2026-10-01",
        start_time="09:00:00",
        end_time="09:50:00",
    )
    entry = MedicalRecordEntry.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        appointment=appointment,
        content="Conteúdo clínico protegido.",
        created_by=platform_operator,
    )
    audit_event = MedicalRecordAuditEvent.objects.create(
        clinic=clinic,
        entry=entry,
        action=MedicalRecordAuditAction.CREATED,
        actor=platform_operator,
    )

    client = APIClient()
    client.force_authenticate(user=platform_operator)

    record_list = client.get(reverse("medical-record-list"), {"clinic": clinic.id})
    record_detail = client.get(
        reverse("medical-record-detail", kwargs={"pk": entry.id})
    )
    record_write = client.post(
        reverse("medical-record-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(patient.id),
            "professional": str(professional.id),
            "appointment": str(appointment.id),
            "content": "Tentativa de conteúdo clínico.",
        },
        format="json",
    )
    void_response = client.post(
        reverse("medical-record-void", kwargs={"pk": entry.id}),
        format="json",
    )
    audit_list = client.get(
        reverse("medical-record-audit-list"), {"clinic": clinic.id}
    )
    audit_detail = client.get(
        reverse("medical-record-audit-detail", kwargs={"pk": audit_event.id})
    )

    assert record_list.status_code == 403
    assert record_detail.status_code == 403
    assert record_write.status_code == 403
    assert void_response.status_code == 403
    assert audit_list.status_code == 403
    assert audit_detail.status_code == 403
    entry.refresh_from_db()
    assert entry.is_active is True


@pytest.mark.django_db
def test_update_medical_record_creates_new_version_and_audit_event():
    user, clinic, professional, patient, _appointment = make_clinic_context()
    entry = MedicalRecordEntry.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        content="Primeira versão.",
        created_by=user,
    )
    MedicalRecordEntryVersion.objects.create(
        entry=entry,
        version=1,
        entry_type=entry.entry_type,
        status=entry.status,
        content=entry.content,
        changed_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.patch(
        reverse("medical-record-detail", kwargs={"pk": entry.id}),
        {"content": "Segunda versão.", "status": "FINAL"},
        format="json",
    )
    entry.refresh_from_db()

    assert response.status_code == 200
    assert entry.updated_by == user
    assert entry.versions.count() == 2
    assert MedicalRecordAuditEvent.objects.filter(
        entry=entry,
        action=MedicalRecordAuditAction.UPDATED,
    ).exists()


@pytest.mark.django_db
def test_destroy_medical_record_voids_entry_and_audits():
    user, clinic, professional, patient, _appointment = make_clinic_context()
    entry = MedicalRecordEntry.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        content="Registro a anular.",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.delete(reverse("medical-record-detail", kwargs={"pk": entry.id}))
    entry.refresh_from_db()

    assert response.status_code == 204
    assert entry.is_active is False
    assert entry.status == MedicalRecordEntryStatus.VOIDED
    assert MedicalRecordAuditEvent.objects.filter(
        entry=entry,
        action=MedicalRecordAuditAction.VOIDED,
    ).exists()
