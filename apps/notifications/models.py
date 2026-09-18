from uuid import uuid4

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.appointments.models import Appointment
from apps.clinics.models import Clinic
from apps.patients.models import Patient


class NotificationChannel(models.TextChoices):
    EMAIL = "EMAIL", "E-mail"
    SMS = "SMS", "SMS"
    WHATSAPP = "WHATSAPP", "WhatsApp"
    PUSH = "PUSH", "Push"
    INTERNAL = "INTERNAL", "Interna"


class NotificationEventType(models.TextChoices):
    APPOINTMENT_SCHEDULED = "APPOINTMENT_SCHEDULED", "Consulta agendada"
    APPOINTMENT_CONFIRMED = "APPOINTMENT_CONFIRMED", "Consulta confirmada"
    APPOINTMENT_CANCELLED = "APPOINTMENT_CANCELLED", "Consulta cancelada"
    APPOINTMENT_REMINDER = "APPOINTMENT_REMINDER", "Lembrete de consulta"
    PAYMENT = "PAYMENT", "Pagamento"
    DOCUMENT_AVAILABLE = "DOCUMENT_AVAILABLE", "Documento disponível"
    CUSTOM = "CUSTOM", "Personalizada"


class NotificationStatus(models.TextChoices):
    DRAFT = "DRAFT", "Rascunho"
    QUEUED = "QUEUED", "Na fila"
    SENT = "SENT", "Enviada"
    FAILED = "FAILED", "Falhou"
    CANCELLED = "CANCELLED", "Cancelada"


class NotificationTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="notification_templates",
    )
    name = models.CharField(max_length=180)
    event_type = models.CharField(
        max_length=32,
        choices=NotificationEventType.choices,
        default=NotificationEventType.CUSTOM,
    )
    channel = models.CharField(
        max_length=16,
        choices=NotificationChannel.choices,
        default=NotificationChannel.EMAIL,
    )
    subject = models.CharField(max_length=180, blank=True)
    body = models.TextField()
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_notification_templates",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["clinic", "name", "channel"],
                name="unique_notification_template_name_channel_per_clinic",
            )
        ]
        indexes = [models.Index(fields=["clinic", "event_type", "is_active"])]

    def __str__(self) -> str:
        return self.name


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="notifications",
    )
    template = models.ForeignKey(
        NotificationTemplate,
        on_delete=models.PROTECT,
        related_name="notifications",
        blank=True,
        null=True,
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="notifications",
        blank=True,
        null=True,
    )
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.PROTECT,
        related_name="notifications",
        blank=True,
        null=True,
    )
    recipient_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="received_notifications",
        blank=True,
        null=True,
    )
    event_type = models.CharField(
        max_length=32,
        choices=NotificationEventType.choices,
        default=NotificationEventType.CUSTOM,
    )
    channel = models.CharField(
        max_length=16,
        choices=NotificationChannel.choices,
        default=NotificationChannel.EMAIL,
    )
    recipient = models.CharField(max_length=255)
    subject = models.CharField(max_length=180, blank=True)
    body = models.TextField()
    status = models.CharField(
        max_length=16,
        choices=NotificationStatus.choices,
        default=NotificationStatus.DRAFT,
    )
    scheduled_at = models.DateTimeField(blank=True, null=True)
    sent_at = models.DateTimeField(blank=True, null=True)
    failed_at = models.DateTimeField(blank=True, null=True)
    failure_reason = models.TextField(blank=True)
    provider = models.CharField(max_length=80, blank=True)
    provider_message_id = models.CharField(max_length=120, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_notifications",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["clinic", "status", "scheduled_at"]),
            models.Index(fields=["patient", "event_type", "created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.channel} para {self.recipient}"

    def clean(self):
        if self.template_id and self.template.clinic_id != self.clinic_id:
            raise ValidationError("Modelo não pertence à clínica da notificação.")
        if self.patient_id and self.patient.clinic_id != self.clinic_id:
            raise ValidationError("Paciente não pertence à clínica da notificação.")
        if self.appointment_id and self.appointment.clinic_id != self.clinic_id:
            raise ValidationError("Consulta não pertence à clínica da notificação.")
        if self.appointment_id and self.patient_id:
            if self.appointment.patient_id != self.patient_id:
                raise ValidationError("Consulta não pertence ao paciente informado.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
