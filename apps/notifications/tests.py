import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import UserRole
from apps.appointments.models import Appointment
from apps.clinics.models import Clinic, ClinicMembership
from apps.notifications.models import (
    Notification,
    NotificationStatus,
    NotificationTemplate,
)
from apps.notifications.tasks import send_due_notifications, send_notification
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


def make_context(username="notifications-admin", clinic_name="Clínica Notificações"):
    user = make_user(username)
    clinic = Clinic.objects.create(name=clinic_name)
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
    )
    professional = Professional.objects.create(
        clinic=clinic,
        full_name="Dra. Notificações",
        profession="Psicóloga",
        crp="06/123456",
        crp_state="SP",
    )
    patient = Patient.objects.create(
        clinic=clinic,
        full_name="Paciente Notificações",
        email="paciente@example.com",
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
def test_clinic_admin_can_create_notification_template():
    user, clinic, _professional, _patient, _appointment = make_context()
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("notification-template-list"),
        {
            "clinic": str(clinic.id),
            "name": "Lembrete de consulta",
            "event_type": "APPOINTMENT_REMINDER",
            "channel": "EMAIL",
            "subject": "Sua consulta está chegando",
            "body": "Lembrete de consulta agendada.",
        },
        format="json",
    )

    template = NotificationTemplate.objects.get(name="Lembrete de consulta")
    assert response.status_code == 201
    assert template.clinic == clinic
    assert template.created_by == user


@pytest.mark.django_db
def test_clinic_admin_can_queue_notification():
    user, clinic, _professional, patient, appointment = make_context()
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("notification-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(patient.id),
            "appointment": str(appointment.id),
            "event_type": "APPOINTMENT_REMINDER",
            "channel": "EMAIL",
            "recipient": patient.email,
            "subject": "Consulta amanhã",
            "body": "Você possui consulta agendada.",
            "status": "QUEUED",
        },
        format="json",
    )

    notification = Notification.objects.get(patient=patient)
    assert response.status_code == 201
    assert notification.status == NotificationStatus.QUEUED
    assert notification.created_by == user


@pytest.mark.django_db
def test_user_cannot_list_notifications_from_other_tenant():
    user, clinic, _professional, patient, _appointment = make_context()
    (
        other_user,
        other_clinic,
        _other_professional,
        _other_patient,
        _other_appointment,
    ) = make_context("other-notifications-admin", "Outra Clínica Notificações")
    Notification.objects.create(
        clinic=clinic,
        patient=patient,
        event_type="CUSTOM",
        channel="EMAIL",
        recipient="paciente@example.com",
        subject="Interno",
        body="Mensagem interna.",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=other_user)

    response = client.get(reverse("notification-list"), {"clinic": other_clinic.id})

    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.django_db
def test_notification_rejects_patient_from_another_clinic():
    user, clinic, _professional, _patient, _appointment = make_context()
    (
        _other_user,
        _other_clinic,
        _other_professional,
        other_patient,
        _other_appointment,
    ) = make_context("other-notification-patient", "Clínica Paciente Externo")
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("notification-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(other_patient.id),
            "event_type": "CUSTOM",
            "channel": "EMAIL",
            "recipient": "externo@example.com",
            "subject": "Inválida",
            "body": "Não deve salvar.",
        },
        format="json",
    )

    assert response.status_code == 400
    assert not Notification.objects.filter(subject="Inválida").exists()


@pytest.mark.django_db
def test_send_notification_task_marks_notification_sent():
    user, clinic, _professional, patient, _appointment = make_context()
    notification = Notification.objects.create(
        clinic=clinic,
        patient=patient,
        event_type="DOCUMENT_AVAILABLE",
        channel="EMAIL",
        recipient=patient.email,
        subject="Documento disponível",
        body="Seu documento está disponível.",
        status=NotificationStatus.QUEUED,
        created_by=user,
    )

    send_notification(str(notification.id))
    notification.refresh_from_db()

    assert notification.status == NotificationStatus.SENT
    assert notification.sent_at is not None
    assert notification.provider == "internal"
    assert notification.provider_message_id.startswith("internal-")


@pytest.mark.django_db
def test_send_due_notifications_enqueues_due_items(monkeypatch):
    user, clinic, _professional, patient, _appointment = make_context()
    due_notification = Notification.objects.create(
        clinic=clinic,
        patient=patient,
        event_type="APPOINTMENT_REMINDER",
        channel="EMAIL",
        recipient=patient.email,
        subject="Lembrete vencido",
        body="Enviar agora.",
        status=NotificationStatus.QUEUED,
        scheduled_at=timezone.now() - timezone.timedelta(minutes=5),
        created_by=user,
    )
    Notification.objects.create(
        clinic=clinic,
        patient=patient,
        event_type="APPOINTMENT_REMINDER",
        channel="EMAIL",
        recipient=patient.email,
        subject="Lembrete futuro",
        body="Enviar depois.",
        status=NotificationStatus.QUEUED,
        scheduled_at=timezone.now() + timezone.timedelta(hours=1),
        created_by=user,
    )
    delayed_ids = []

    def fake_delay(notification_id):
        delayed_ids.append(notification_id)

    monkeypatch.setattr(send_notification, "delay", fake_delay)

    total = send_due_notifications()

    assert total == 1
    assert delayed_ids == [str(due_notification.id)]


@pytest.mark.django_db
def test_platform_operator_is_denied_notification_list_detail_write_and_actions():
    user, clinic, _professional, patient, appointment = make_context()
    template = NotificationTemplate.objects.create(
        clinic=clinic,
        name="Modelo protegido",
        event_type="CUSTOM",
        channel="EMAIL",
        subject="Assunto protegido",
        body="Conteúdo protegido.",
        created_by=user,
    )
    notification = Notification.objects.create(
        clinic=clinic,
        template=template,
        patient=patient,
        appointment=appointment,
        event_type="CUSTOM",
        channel="EMAIL",
        recipient=patient.email,
        subject="Assunto protegido",
        body="Conteúdo protegido.",
        created_by=user,
    )
    platform_operator = make_user(
        "platform-notifications-operator", UserRole.SUPERADMIN
    )
    ClinicMembership.objects.create(
        clinic=clinic,
        user=platform_operator,
        role=UserRole.CLINIC_ADMIN,
    )
    Professional.objects.create(
        clinic=clinic,
        user=platform_operator,
        full_name="Operador Notificações",
        profession="Psicólogo",
        crp="06/654321",
        crp_state="SP",
    )
    client = APIClient()
    client.force_authenticate(user=platform_operator)

    assert client.get(
        reverse("notification-template-list"), {"clinic": str(clinic.id)}
    ).status_code == 403
    assert client.get(
        reverse("notification-list"), {"clinic": str(clinic.id)}
    ).status_code == 403
    assert client.get(
        reverse("notification-detail", kwargs={"pk": notification.id})
    ).status_code == 403
    assert client.post(
        reverse("notification-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(patient.id),
            "event_type": "CUSTOM",
            "channel": "EMAIL",
            "recipient": patient.email,
            "subject": "Tentativa do operador",
            "body": "Não deve enviar.",
        },
        format="json",
    ).status_code == 403
    assert client.post(
        reverse("notification-queue", kwargs={"pk": notification.id})
    ).status_code == 403
    assert client.post(
        reverse("notification-send", kwargs={"pk": notification.id})
    ).status_code == 403
