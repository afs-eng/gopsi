from uuid import uuid4

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.appointments.models import Appointment
from apps.clinics.models import Clinic
from apps.professionals.models import CareModality


class TelehealthSessionStatus(models.TextChoices):
    WAITING_ROOM = "WAITING_ROOM", "Sala de espera"
    IN_PROGRESS = "IN_PROGRESS", "Em atendimento"
    FINISHED = "FINISHED", "Finalizada"
    CANCELLED = "CANCELLED", "Cancelada"


class TelehealthParticipantRole(models.TextChoices):
    PROFESSIONAL = "PROFESSIONAL", "Profissional"
    PATIENT = "PATIENT", "Paciente"
    GUARDIAN = "GUARDIAN", "Responsável"
    STAFF = "STAFF", "Equipe"


class TelehealthAccessToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    session = models.ForeignKey(
        "TelehealthSession",
        on_delete=models.CASCADE,
        related_name="access_tokens",
    )
    token = models.UUIDField(default=uuid4, unique=True, editable=False)
    role = models.CharField(
        max_length=16,
        choices=TelehealthParticipantRole.choices,
        default=TelehealthParticipantRole.PATIENT,
    )
    display_name = models.CharField(max_length=255, blank=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["token", "expires_at"])]

    def __str__(self) -> str:
        return f"Acesso {self.role} para {self.session_id}"

    @property
    def is_valid(self) -> bool:
        return self.revoked_at is None and self.expires_at > timezone.now()


class TelehealthSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="telehealth_sessions",
    )
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.PROTECT,
        related_name="telehealth_session",
    )
    status = models.CharField(
        max_length=16,
        choices=TelehealthSessionStatus.choices,
        default=TelehealthSessionStatus.WAITING_ROOM,
    )
    provider = models.CharField(max_length=64, default="internal", blank=True)
    external_room_id = models.CharField(max_length=120, unique=True)
    join_url = models.URLField(blank=True)
    expires_at = models.DateTimeField()
    waiting_room_open = models.BooleanField(default=True)
    started_at = models.DateTimeField(blank=True, null=True)
    ended_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_telehealth_sessions",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["appointment__date", "appointment__start_time"]
        indexes = [models.Index(fields=["clinic", "status", "is_active"])]

    def __str__(self) -> str:
        return f"Teleatendimento {self.appointment_id}"

    def clean(self):
        if self.appointment_id and self.appointment.clinic_id != self.clinic_id:
            raise ValidationError("Consulta não pertence à clínica da sessão online.")

        if self.appointment_id and self.appointment.modality == CareModality.IN_PERSON:
            raise ValidationError("Consulta presencial não permite teleatendimento.")

        if self.ended_at and self.started_at and self.ended_at < self.started_at:
            raise ValidationError("Encerramento não pode ocorrer antes do início.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class TelehealthParticipantEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    session = models.ForeignKey(
        TelehealthSession,
        on_delete=models.CASCADE,
        related_name="participant_events",
    )
    role = models.CharField(max_length=16, choices=TelehealthParticipantRole.choices)
    display_name = models.CharField(max_length=255)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="telehealth_participant_events",
        blank=True,
        null=True,
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["joined_at"]
        indexes = [models.Index(fields=["session", "role", "joined_at"])]

    def __str__(self) -> str:
        return f"{self.display_name} em {self.session_id}"
