from datetime import timedelta
from uuid import uuid4

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.clinics.models import Clinic
from apps.patients.models import Patient


class DataSubjectRequestType(models.TextChoices):
    ACCESS = "ACCESS", "Acesso"
    CORRECTION = "CORRECTION", "Correção"
    PORTABILITY = "PORTABILITY", "Portabilidade"
    ANONYMIZATION = "ANONYMIZATION", "Anonimização"
    DELETION = "DELETION", "Exclusão"
    CONSENT_REVIEW = "CONSENT_REVIEW", "Revisão de consentimento"
    OTHER = "OTHER", "Outro"


class DataSubjectRequestStatus(models.TextChoices):
    OPEN = "OPEN", "Aberta"
    IN_REVIEW = "IN_REVIEW", "Em análise"
    FULFILLED = "FULFILLED", "Atendida"
    REJECTED = "REJECTED", "Rejeitada"
    CANCELLED = "CANCELLED", "Cancelada"


def default_due_date():
    return timezone.localdate() + timedelta(days=15)


class DataSubjectRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="data_subject_requests",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="data_subject_requests",
        blank=True,
        null=True,
    )
    subject_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="data_subject_requests",
        blank=True,
        null=True,
    )
    request_type = models.CharField(
        max_length=24,
        choices=DataSubjectRequestType.choices,
    )
    status = models.CharField(
        max_length=16,
        choices=DataSubjectRequestStatus.choices,
        default=DataSubjectRequestStatus.OPEN,
    )
    description = models.TextField()
    requester_name = models.CharField(max_length=255)
    requester_email = models.EmailField(blank=True)
    due_date = models.DateField(default=default_due_date)
    response_summary = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_data_subject_requests",
    )
    handled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="handled_data_subject_requests",
        blank=True,
        null=True,
    )
    completed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["due_date", "-created_at"]
        indexes = [
            models.Index(fields=["clinic", "status", "due_date"]),
            models.Index(fields=["patient", "request_type", "created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.request_type} - {self.requester_name}"

    def clean(self):
        if self.patient_id and self.patient.clinic_id != self.clinic_id:
            raise ValidationError("Paciente não pertence à clínica da solicitação.")
        if not self.patient_id and not self.subject_user_id:
            raise ValidationError("Informe paciente ou usuário titular dos dados.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
