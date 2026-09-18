from uuid import uuid4

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.clinics.models import Clinic
from apps.patients.models import Patient
from apps.professionals.models import Professional


class DocumentTemplateType(models.TextChoices):
    DECLARATION = "DECLARATION", "Declaração"
    CONSENT = "CONSENT", "Consentimento"
    REPORT = "REPORT", "Relatório"
    RECEIPT = "RECEIPT", "Recibo"
    OTHER = "OTHER", "Outro"


class GeneratedDocumentStatus(models.TextChoices):
    DRAFT = "DRAFT", "Rascunho"
    FINAL = "FINAL", "Finalizado"
    SIGNED = "SIGNED", "Assinado"
    VOIDED = "VOIDED", "Anulado"


class DocumentTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="document_templates",
    )
    name = models.CharField(max_length=180)
    template_type = models.CharField(
        max_length=24,
        choices=DocumentTemplateType.choices,
        default=DocumentTemplateType.DECLARATION,
    )
    body = models.TextField()
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_document_templates",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["clinic", "name"],
                name="unique_document_template_name_per_clinic",
            )
        ]
        indexes = [models.Index(fields=["clinic", "is_active"])]

    def __str__(self) -> str:
        return self.name


class GeneratedDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="generated_documents",
    )
    template = models.ForeignKey(
        DocumentTemplate,
        on_delete=models.PROTECT,
        related_name="generated_documents",
        blank=True,
        null=True,
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="generated_documents",
        blank=True,
        null=True,
    )
    professional = models.ForeignKey(
        Professional,
        on_delete=models.PROTECT,
        related_name="generated_documents",
        blank=True,
        null=True,
    )
    title = models.CharField(max_length=180)
    content = models.TextField()
    status = models.CharField(
        max_length=16,
        choices=GeneratedDocumentStatus.choices,
        default=GeneratedDocumentStatus.DRAFT,
    )
    signed_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_generated_documents",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="updated_generated_documents",
        blank=True,
        null=True,
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["clinic", "status", "is_active"]),
            models.Index(fields=["patient", "created_at"]),
        ]

    def __str__(self) -> str:
        return self.title

    def clean(self):
        if self.template_id and self.template.clinic_id != self.clinic_id:
            raise ValidationError("Modelo não pertence à clínica do documento.")
        if self.patient_id and self.patient.clinic_id != self.clinic_id:
            raise ValidationError("Paciente não pertence à clínica do documento.")
        if self.professional_id and self.professional.clinic_id != self.clinic_id:
            raise ValidationError("Profissional não pertence à clínica do documento.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
