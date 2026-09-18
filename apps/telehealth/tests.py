import json

import pytest
from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import UserRole
from apps.appointments.models import Appointment
from apps.clinics.models import Clinic, ClinicMembership
from apps.patients.models import Patient
from apps.professionals.models import CareModality, Professional
from apps.telehealth.models import (
    TelehealthAccessToken,
    TelehealthSession,
    TelehealthSessionStatus,
)


def make_user(username: str, role: str = UserRole.PROFESSIONAL):
    return get_user_model().objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password="safe-test-password",
        full_name=username.replace("-", " ").title(),
        global_role=role,
    )


def make_online_context():
    user = make_user("telehealth-admin")
    clinic = Clinic.objects.create(name="Clínica Online")
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
    )
    professional = Professional.objects.create(
        clinic=clinic,
        full_name="Dra. Online",
        profession="Psicóloga",
        crp="06/123456",
        crp_state="SP",
        appointment_modalities=CareModality.ONLINE,
    )
    patient = Patient.objects.create(
        clinic=clinic,
        full_name="Paciente Online",
        created_by=user,
    )
    appointment = Appointment.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        date="2026-10-01",
        start_time="09:00:00",
        end_time="09:50:00",
        modality=CareModality.ONLINE,
    )
    return user, clinic, professional, patient, appointment


@pytest.mark.django_db
def test_clinic_admin_can_create_telehealth_session_for_online_appointment():
    user, clinic, _professional, _patient, appointment = make_online_context()
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("telehealth-session-list"),
        {"appointment": str(appointment.id)},
        format="json",
    )

    assert response.status_code == 201
    session = TelehealthSession.objects.get(appointment=appointment)
    assert session.clinic == clinic
    assert session.status == TelehealthSessionStatus.WAITING_ROOM
    assert session.external_room_id
    assert session.join_url
    assert session.expires_at is not None


@pytest.mark.django_db
def test_clinic_admin_can_create_manual_google_meet_session():
    user, _clinic, _professional, _patient, appointment = make_online_context()
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("telehealth-session-list"),
        {
            "appointment": str(appointment.id),
            "manual_join_url": "https://meet.google.com/abc-defg-hij",
        },
        format="json",
    )

    assert response.status_code == 201
    session = TelehealthSession.objects.get(appointment=appointment)
    assert session.provider == "google_meet_manual"
    assert session.join_url == "https://meet.google.com/abc-defg-hij"
    assert session.external_room_id
    assert session.access_tokens.filter(
        display_name=appointment.patient.full_name
    ).exists()


@pytest.mark.django_db
def test_in_person_appointment_cannot_create_telehealth_session():
    user, clinic, professional, patient, _appointment = make_online_context()
    in_person = Appointment.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        date="2026-10-02",
        start_time="09:00:00",
        end_time="09:50:00",
        modality=CareModality.IN_PERSON,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("telehealth-session-list"),
        {"appointment": str(in_person.id)},
        format="json",
    )

    assert response.status_code == 400
    assert not TelehealthSession.objects.filter(appointment=in_person).exists()


@pytest.mark.django_db
def test_waiting_room_records_patient_without_revealing_video_before_start():
    user, _clinic, _professional, _patient, appointment = make_online_context()
    session = TelehealthSession.objects.create(
        clinic=appointment.clinic,
        appointment=appointment,
        external_room_id="room-before-start",
        join_url="https://telehealth.local/rooms/room-before-start",
        expires_at="2026-10-01T15:00:00Z",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("telehealth-session-waiting-room", kwargs={"pk": session.id}),
        {"role": "PATIENT", "display_name": "Paciente Online"},
        format="json",
    )

    assert response.status_code == 201
    assert response.json()["can_join_video"] is False
    assert response.json()["join_url"] == ""
    assert session.participant_events.filter(display_name="Paciente Online").exists()


@pytest.mark.django_db
def test_start_session_releases_video_url_to_waiting_room():
    user, _clinic, _professional, _patient, appointment = make_online_context()
    session = TelehealthSession.objects.create(
        clinic=appointment.clinic,
        appointment=appointment,
        external_room_id="room-started",
        join_url="https://telehealth.local/rooms/room-started",
        expires_at="2026-10-01T15:00:00Z",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    start_response = client.post(
        reverse("telehealth-session-start", kwargs={"pk": session.id})
    )
    waiting_response = client.post(
        reverse("telehealth-session-waiting-room", kwargs={"pk": session.id}),
        {"role": "PATIENT", "display_name": "Paciente Online"},
        format="json",
    )

    assert start_response.status_code == 200
    assert waiting_response.status_code == 201
    assert waiting_response.json()["can_join_video"] is True
    assert waiting_response.json()["join_url"] == session.join_url


@pytest.mark.django_db
def test_public_patient_link_shows_session_without_authentication():
    user, _clinic, _professional, patient, appointment = make_online_context()
    session = TelehealthSession.objects.create(
        clinic=appointment.clinic,
        appointment=appointment,
        external_room_id="public-room",
        join_url="https://meet.google.com/public-room",
        expires_at="2026-10-01T15:00:00Z",
        created_by=user,
    )
    access_token = TelehealthAccessToken.objects.create(
        session=session,
        display_name=patient.full_name,
        expires_at=session.expires_at,
    )
    client = APIClient()

    response = client.get(
        reverse("public-telehealth-join", kwargs={"token": access_token.token})
    )

    assert response.status_code == 200
    assert response.json()["display_name"] == patient.full_name
    assert response.json()["session"]["patient_name"] == patient.full_name
    assert "join_url" not in response.json()["session"]


@pytest.mark.django_db
def test_public_patient_waiting_room_does_not_reveal_video_before_start():
    user, _clinic, _professional, patient, appointment = make_online_context()
    session = TelehealthSession.objects.create(
        clinic=appointment.clinic,
        appointment=appointment,
        external_room_id="public-before-start",
        join_url="https://meet.google.com/public-before-start",
        expires_at="2026-10-01T15:00:00Z",
        created_by=user,
    )
    access_token = TelehealthAccessToken.objects.create(
        session=session,
        display_name=patient.full_name,
        expires_at=session.expires_at,
    )
    client = APIClient()

    response = client.post(
        reverse("public-telehealth-join", kwargs={"token": access_token.token}),
        {"role": "PATIENT", "display_name": patient.full_name},
        format="json",
    )

    assert response.status_code == 201
    assert response.json()["can_join_video"] is False
    assert response.json()["join_url"] == ""
    assert session.participant_events.filter(display_name=patient.full_name).exists()


@pytest.mark.django_db
def test_public_patient_waiting_room_releases_video_after_start():
    user, _clinic, _professional, patient, appointment = make_online_context()
    session = TelehealthSession.objects.create(
        clinic=appointment.clinic,
        appointment=appointment,
        external_room_id="public-started",
        join_url="https://meet.google.com/public-started",
        expires_at="2026-10-01T15:00:00Z",
        created_by=user,
    )
    access_token = TelehealthAccessToken.objects.create(
        session=session,
        display_name=patient.full_name,
        expires_at=session.expires_at,
    )
    client = APIClient()
    client.force_authenticate(user=user)
    client.post(reverse("telehealth-session-start", kwargs={"pk": session.id}))
    client.force_authenticate(user=None)

    response = client.post(
        reverse("public-telehealth-join", kwargs={"token": access_token.token}),
        {"role": "PATIENT", "display_name": patient.full_name},
        format="json",
    )

    assert response.status_code == 201
    assert response.json()["can_join_video"] is True
    assert response.json()["join_url"] == session.join_url


@pytest.mark.django_db
def test_user_cannot_retrieve_telehealth_session_from_other_tenant():
    user, _clinic, _professional, _patient, _appointment = make_online_context()
    other_user = make_user("other-admin")
    other_clinic = Clinic.objects.create(name="Outra Clínica")
    ClinicMembership.objects.create(
        clinic=other_clinic,
        user=other_user,
        role=UserRole.CLINIC_ADMIN,
    )
    other_professional = Professional.objects.create(
        clinic=other_clinic,
        full_name="Dra. Outra",
        profession="Psicóloga",
        crp="06/999999",
        crp_state="SP",
    )
    other_patient = Patient.objects.create(
        clinic=other_clinic,
        full_name="Paciente Outra Clínica",
        created_by=other_user,
    )
    other_appointment = Appointment.objects.create(
        clinic=other_clinic,
        patient=other_patient,
        professional=other_professional,
        date="2026-10-01",
        start_time="09:00:00",
        end_time="09:50:00",
        modality=CareModality.ONLINE,
    )
    other_session = TelehealthSession.objects.create(
        clinic=other_clinic,
        appointment=other_appointment,
        external_room_id="other-room",
        join_url="https://telehealth.local/rooms/other-room",
        expires_at="2026-10-01T15:00:00Z",
        created_by=other_user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(
        reverse("telehealth-session-detail", kwargs={"pk": other_session.id})
    )

    assert response.status_code == 404
    assert other_patient.full_name not in response.content.decode()


@pytest.mark.django_db
@override_settings(
    DAILY_API_KEY="test-daily-key",
    DAILY_API_BASE_URL="https://api.daily.co/v1",
    DAILY_ROOM_DURATION_MINUTES=180,
    DAILY_API_TIMEOUT_SECONDS=10,
)
def test_create_telehealth_session_uses_daily_provider(monkeypatch):
    user, _clinic, _professional, _patient, appointment = make_online_context()
    calls = []

    class FakeDailyResponse:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_value, traceback):
            return False

        def read(self):
            return json.dumps(
                {
                    "id": "daily-room-id",
                    "name": "daily-room-name",
                    "url": "https://example.daily.co/daily-room-name",
                }
            ).encode("utf-8")

    def fake_urlopen(request, timeout):
        calls.append((request, timeout))
        return FakeDailyResponse()

    monkeypatch.setattr("apps.telehealth.services.urlopen", fake_urlopen)
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("telehealth-session-list"),
        {"appointment": str(appointment.id)},
        format="json",
    )

    assert response.status_code == 201
    session = TelehealthSession.objects.get(appointment=appointment)
    assert session.provider == "daily"
    assert session.external_room_id == "daily-room-id"
    assert session.join_url == "https://example.daily.co/daily-room-name"
    assert len(calls) == 1
    request, timeout = calls[0]
    assert request.full_url == "https://api.daily.co/v1/rooms"
    assert request.get_method() == "POST"
    assert request.headers["Authorization"] == "Bearer test-daily-key"
    assert timeout == 10


@pytest.mark.django_db
def test_platform_operator_is_denied_telehealth_list_detail_write_events_and_actions():
    user, clinic, _professional, _patient, appointment = make_online_context()
    session = TelehealthSession.objects.create(
        clinic=clinic,
        appointment=appointment,
        external_room_id="platform-denied-room",
        join_url="https://telehealth.local/rooms/platform-denied-room",
        expires_at="2026-10-01T15:00:00Z",
        created_by=user,
    )
    platform_operator = make_user("platform-telehealth-operator", UserRole.SUPERADMIN)
    ClinicMembership.objects.create(
        clinic=clinic,
        user=platform_operator,
        role=UserRole.CLINIC_ADMIN,
    )
    Professional.objects.create(
        clinic=clinic,
        user=platform_operator,
        full_name="Operador Teleatendimento",
        profession="Psicólogo",
        crp="06/654321",
        crp_state="SP",
        appointment_modalities=CareModality.ONLINE,
    )
    client = APIClient()
    client.force_authenticate(user=platform_operator)

    assert client.get(
        reverse("telehealth-session-list"), {"clinic": str(clinic.id)}
    ).status_code == 403
    assert client.get(
        reverse("telehealth-session-detail", kwargs={"pk": session.id})
    ).status_code == 403
    assert client.post(
        reverse("telehealth-session-list"),
        {"appointment": str(appointment.id)},
        format="json",
    ).status_code == 403
    assert client.get(reverse("telehealth-event-list")).status_code == 403
    assert client.post(
        reverse("telehealth-session-start", kwargs={"pk": session.id})
    ).status_code == 403
    assert client.post(
        reverse("telehealth-session-waiting-room", kwargs={"pk": session.id}),
        {"role": "PATIENT", "display_name": "Paciente Online"},
        format="json",
    ).status_code == 403
