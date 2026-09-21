import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import UserRole
from apps.appointments.models import Appointment, AppointmentStatus, ScheduleBlock
from apps.clinics.models import Clinic, ClinicMembership
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
    user = make_user("clinic-admin")
    clinic = Clinic.objects.create(name="Clínica A")
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
    )
    professional = Professional.objects.create(
        clinic=clinic,
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
    return user, clinic, professional, patient


@pytest.mark.django_db
def test_clinic_admin_can_create_appointment_for_own_clinic():
    user, clinic, professional, patient = make_clinic_context()
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("appointment-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(patient.id),
            "professional": str(professional.id),
            "date": "2026-10-01",
            "start_time": "09:00:00",
            "end_time": "09:50:00",
            "modality": "IN_PERSON",
            "value": "250.00",
        },
        format="json",
    )

    assert response.status_code == 201
    assert Appointment.objects.filter(
        clinic=clinic,
        patient=patient,
        professional=professional,
    ).exists()


@pytest.mark.django_db
def test_appointment_conflict_for_same_professional_is_rejected():
    user, clinic, professional, patient = make_clinic_context()
    other_patient = Patient.objects.create(
        clinic=clinic,
        full_name="Paciente B",
        created_by=user,
    )
    Appointment.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        date="2026-10-01",
        start_time="09:00:00",
        end_time="09:50:00",
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("appointment-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(other_patient.id),
            "professional": str(professional.id),
            "date": "2026-10-01",
            "start_time": "09:30:00",
            "end_time": "10:20:00",
        },
        format="json",
    )

    assert response.status_code == 400
    assert Appointment.objects.count() == 1


@pytest.mark.django_db
def test_appointment_inside_schedule_block_is_rejected():
    user, clinic, professional, patient = make_clinic_context()
    ScheduleBlock.objects.create(
        clinic=clinic,
        professional=professional,
        date="2026-10-01",
        start_time="08:00:00",
        end_time="12:00:00",
        reason="Férias",
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("appointment-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(patient.id),
            "professional": str(professional.id),
            "date": "2026-10-01",
            "start_time": "09:00:00",
            "end_time": "09:50:00",
        },
        format="json",
    )

    assert response.status_code == 400
    assert not Appointment.objects.exists()


@pytest.mark.django_db
def test_user_cannot_list_appointments_from_other_tenant():
    user, clinic, professional, patient = make_clinic_context()
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
    own_appointment = Appointment.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        date="2026-10-01",
        start_time="09:00:00",
        end_time="09:50:00",
    )
    other_appointment = Appointment.objects.create(
        clinic=other_clinic,
        patient=other_patient,
        professional=other_professional,
        date="2026-10-01",
        start_time="09:00:00",
        end_time="09:50:00",
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(reverse("appointment-list"), {"clinic": clinic.id})

    assert response.status_code == 200
    returned_ids = {item["id"] for item in response.json()}
    assert str(own_appointment.id) in returned_ids
    assert str(other_appointment.id) not in returned_ids


@pytest.mark.django_db
def test_user_cannot_retrieve_appointment_from_other_tenant():
    user, _clinic, _professional, _patient = make_clinic_context()
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
    other_appointment = Appointment.objects.create(
        clinic=other_clinic,
        patient=other_patient,
        professional=other_professional,
        date="2026-10-01",
        start_time="09:00:00",
        end_time="09:50:00",
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(
        reverse("appointment-detail", kwargs={"pk": other_appointment.id})
    )

    assert response.status_code == 404
    assert other_patient.full_name not in response.content.decode()


@pytest.mark.django_db
def test_platform_operator_denied_schedule_with_accidental_access():
    platform_operator = make_user("platform-schedule-denial", UserRole.SUPERADMIN)
    clinic = Clinic.objects.create(name="Clínica agenda protegida")
    ClinicMembership.objects.create(
        clinic=clinic,
        user=platform_operator,
        role=UserRole.CLINIC_ADMIN,
        is_active=True,
    )
    professional = Professional.objects.create(
        clinic=clinic,
        user=platform_operator,
        full_name="Operador com perfil de agenda",
        profession="Psicólogo",
        is_active=True,
    )
    patient = Patient.objects.create(
        clinic=clinic,
        full_name="Paciente de agenda protegida",
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
    block = ScheduleBlock.objects.create(
        clinic=clinic,
        professional=professional,
        date="2026-10-01",
        start_time="13:00:00",
        end_time="14:00:00",
    )

    client = APIClient()
    client.force_authenticate(user=platform_operator)

    appointment_list = client.get(
        reverse("appointment-list"), {"clinic": clinic.id}
    )
    appointment_detail = client.get(
        reverse("appointment-detail", kwargs={"pk": appointment.id})
    )
    appointment_write = client.post(
        reverse("appointment-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(patient.id),
            "professional": str(professional.id),
            "date": "2026-10-02",
            "start_time": "09:00:00",
            "end_time": "09:50:00",
        },
        format="json",
    )
    block_list = client.get(reverse("schedule-block-list"), {"clinic": clinic.id})
    block_detail = client.get(
        reverse("schedule-block-detail", kwargs={"pk": block.id})
    )
    block_write = client.post(
        reverse("schedule-block-list"),
        {
            "clinic": str(clinic.id),
            "professional": str(professional.id),
            "date": "2026-10-02",
            "start_time": "13:00:00",
            "end_time": "14:00:00",
        },
        format="json",
    )

    assert appointment_list.status_code == 403
    assert appointment_detail.status_code == 403
    assert appointment_write.status_code == 403
    assert block_list.status_code == 403
    assert block_detail.status_code == 403
    assert block_write.status_code == 403
    assert Appointment.objects.count() == 1
    assert ScheduleBlock.objects.count() == 1


@pytest.mark.django_db
def test_destroy_appointment_cancels_and_soft_deletes():
    user, clinic, professional, patient = make_clinic_context()
    appointment = Appointment.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        date="2026-10-01",
        start_time="09:00:00",
        end_time="09:50:00",
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.delete(
        reverse("appointment-detail", kwargs={"pk": appointment.id})
    )
    appointment.refresh_from_db()

    assert response.status_code == 204
    assert appointment.is_active is False
    assert appointment.status == AppointmentStatus.CANCELLED


@pytest.mark.django_db
def test_clinic_admin_can_create_schedule_block_for_own_clinic():
    user, clinic, professional, _patient = make_clinic_context()
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("schedule-block-list"),
        {
            "clinic": str(clinic.id),
            "professional": str(professional.id),
            "date": "2026-10-02",
            "start_time": "13:00:00",
            "end_time": "15:00:00",
            "reason": "Supervisão clínica",
        },
        format="json",
    )

    assert response.status_code == 201
    assert ScheduleBlock.objects.filter(
        clinic=clinic,
        professional=professional,
        reason="Supervisão clínica",
    ).exists()


@pytest.mark.django_db
def test_user_cannot_list_schedule_blocks_from_other_tenant():
    user, clinic, professional, _patient = make_clinic_context()
    other_clinic = Clinic.objects.create(name="Clínica B")
    other_professional = Professional.objects.create(
        clinic=other_clinic,
        full_name="Dra. B",
        profession="Psicóloga",
        crp="06/999999",
        crp_state="SP",
    )
    own_block = ScheduleBlock.objects.create(
        clinic=clinic,
        professional=professional,
        date="2026-10-02",
        start_time="13:00:00",
        end_time="15:00:00",
    )
    other_block = ScheduleBlock.objects.create(
        clinic=other_clinic,
        professional=other_professional,
        date="2026-10-02",
        start_time="13:00:00",
        end_time="15:00:00",
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(reverse("schedule-block-list"), {"clinic": clinic.id})

    assert response.status_code == 200
    returned_ids = {item["id"] for item in response.json()}
    assert str(own_block.id) in returned_ids
    assert str(other_block.id) not in returned_ids


@pytest.mark.django_db
def test_destroy_schedule_block_uses_soft_delete():
    user, clinic, professional, _patient = make_clinic_context()
    block = ScheduleBlock.objects.create(
        clinic=clinic,
        professional=professional,
        date="2026-10-02",
        start_time="13:00:00",
        end_time="15:00:00",
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.delete(reverse("schedule-block-detail", kwargs={"pk": block.id}))
    block.refresh_from_db()

    assert response.status_code == 204
    assert block.is_active is False
