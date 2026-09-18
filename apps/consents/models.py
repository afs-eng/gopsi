from uuid import uuid4

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.clinics.models import Clinic
from apps.patients.models import Patient


class ConsentTemplateType(models.TextChoices):
    INFORMED_CONSENT = "INFORMED_CONSENT", "Termo de consentimento"
    PRIVACY_POLICY = "PRIVACY_POLICY", "Política de privacidade"
    TELEHEALTH = "TELEHEALTH", "Teleatendimento"
    DATA_PROCESSING = "DATA_PROCESSING", "Tratamento de dados"
    SPECIFIC_AUTHORIZATION = "SPECIFIC_AUTHORIZATION", "Autorização específica"
    OTHER = "OTHER", "Outro"


class ConsentStatus(models.TextChoices):
    ACCEPTED = "ACCEPTED", "Aceito"
    REJECTED = "REJECTED", "Recusado"
    REVOKED = "REVOKED", "Revogado"


class ConsentTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="consent_templates",
    )
    title = models.CharField(max_length=180)
    template_type = models.CharField(
        max_length=32,
        choices=ConsentTemplateType.choices,
        default=ConsentTemplateType.INFORMED_CONSENT,
    )
    version = models.CharField(max_length=32)
    body = models.TextField()
    is_required = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_consent_templates",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title", "version"]
        constraints = [
            models.UniqueConstraint(
                fields=["clinic", "title", "version"],
                name="unique_consent_template_version_per_clinic",
            )
        ]
        indexes = [models.Index(fields=["clinic", "template_type", "is_active"])]

    def __str__(self) -> str:
        return f"{self.title} v{self.version}"


class ConsentRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="consent_records",
    )
    template = models.ForeignKey(
        ConsentTemplate,
        on_delete=models.PROTECT,
        related_name="records",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="consent_records",
        blank=True,
        null=True,
    )
    subject_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="subject_consent_records",
        blank=True,
        null=True,
    )
    status = models.CharField(
        max_length=16,
        choices=ConsentStatus.choices,
        default=ConsentStatus.ACCEPTED,
    )
    accepted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="accepted_consent_records",
    )
    accepted_at = models.DateTimeField(default=timezone.now)
    revoked_at = models.DateTimeField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    document_title = models.CharField(max_length=180)
    document_type = models.CharField(max_length=32, choices=ConsentTemplateType.choices)
    document_version = models.CharField(max_length=32)
    document_body = models.TextField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-accepted_at"]
        indexes = [
            models.Index(fields=["clinic", "status", "accepted_at"]),
            models.Index(fields=["patient", "template", "accepted_at"]),
            models.Index(fields=["subject_user", "template", "accepted_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.document_title} v{self.document_version} - {self.status}"

    def clean(self):
        if self.template_id and self.template.clinic_id != self.clinic_id:
            raise ValidationError("Termo não pertence à clínica do aceite.")
        if self.patient_id and self.patient.clinic_id != self.clinic_id:
            raise ValidationError("Paciente não pertence à clínica do aceite.")
        if not self.patient_id and not self.subject_user_id:
            raise ValidationError("Informe paciente ou usuário relacionado ao aceite.")
        if self.revoked_at and self.revoked_at < self.accepted_at:
            raise ValidationError("Revogação não pode ocorrer antes do aceite.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
