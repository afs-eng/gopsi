from uuid import uuid4

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.clinics.models import Clinic
from apps.documents.models import GeneratedDocument
from apps.patients.models import Patient
from apps.professionals.models import Professional


class AssessmentStatus(models.TextChoices):
    DRAFT = "DRAFT", "Rascunho"
    IN_PROGRESS = "IN_PROGRESS", "Em andamento"
    COMPLETED = "COMPLETED", "Concluída"
    CANCELLED = "CANCELLED", "Cancelada"


class AssessmentSessionStatus(models.TextChoices):
    SCHEDULED = "SCHEDULED", "Agendada"
    COMPLETED = "COMPLETED", "Concluída"
    CANCELLED = "CANCELLED", "Cancelada"


class InstrumentApplicationStatus(models.TextChoices):
    PLANNED = "PLANNED", "Planejada"
    APPLIED = "APPLIED", "Aplicada"
    CANCELLED = "CANCELLED", "Cancelada"


class AssessmentResultStatus(models.TextChoices):
    DRAFT = "DRAFT", "Rascunho"
    FINAL = "FINAL", "Finalizado"
    VOIDED = "VOIDED", "Anulado"


class AssessmentDocumentType(models.TextChoices):
    REPORT = "REPORT", "Relatório"
    DECLARATION = "DECLARATION", "Declaração"
    FEEDBACK = "FEEDBACK", "Devolutiva"
    OTHER = "OTHER", "Outro"


class AssessmentInstrument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True)
    version = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"


class Assessment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="psychological_assessments",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="psychological_assessments",
    )
    professional = models.ForeignKey(
        Professional,
        on_delete=models.PROTECT,
        related_name="psychological_assessments",
    )
    title = models.CharField(max_length=180)
    reason = models.TextField(blank=True)
    status = models.CharField(
        max_length=16,
        choices=AssessmentStatus.choices,
        default=AssessmentStatus.DRAFT,
    )
    started_at = models.DateField(blank=True, null=True)
    completed_at = models.DateField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_psychological_assessments",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="updated_psychological_assessments",
        blank=True,
        null=True,
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["clinic", "patient", "is_active"]),
            models.Index(fields=["professional", "status"]),
        ]

    def __str__(self) -> str:
        return f"{self.title} - {self.patient}"

    def clean(self):
        if self.patient_id and self.patient.clinic_id != self.clinic_id:
            raise ValidationError("Paciente não pertence à clínica da avaliação.")
        if self.professional_id and self.professional.clinic_id != self.clinic_id:
            raise ValidationError("Profissional não pertence à clínica da avaliação.")
        if (
            self.completed_at
            and self.started_at
            and self.completed_at < self.started_at
        ):
            raise ValidationError("Conclusão não pode ocorrer antes do início.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class AssessmentSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="sessions",
    )
    session_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(
        max_length=16,
        choices=AssessmentSessionStatus.choices,
        default=AssessmentSessionStatus.SCHEDULED,
    )
    administrative_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["session_date", "start_time"]
        indexes = [models.Index(fields=["assessment", "session_date"])]

    def __str__(self) -> str:
        return f"Sessão de avaliação em {self.session_date}"

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError(
                "O horário inicial deve ser anterior ao horário final."
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class InstrumentApplication(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="instrument_applications",
    )
    session = models.ForeignKey(
        AssessmentSession,
        on_delete=models.SET_NULL,
        related_name="instrument_applications",
        blank=True,
        null=True,
    )
    instrument = models.ForeignKey(
        AssessmentInstrument,
        on_delete=models.PROTECT,
        related_name="applications",
        blank=True,
        null=True,
    )
    instrument_name = models.CharField(max_length=180)
    application_date = models.DateField(blank=True, null=True)
    status = models.CharField(
        max_length=16,
        choices=InstrumentApplicationStatus.choices,
        default=InstrumentApplicationStatus.PLANNED,
    )
    notes = models.TextField(blank=True)
    raw_payload = models.JSONField(default=dict, blank=True)
    computed_payload = models.JSONField(default=dict, blank=True)
    classified_payload = models.JSONField(default=dict, blank=True)
    reviewed_payload = models.JSONField(default=dict, blank=True)
    interpretation_text = models.TextField(blank=True)
    is_validated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["instrument_name"]
        indexes = [models.Index(fields=["assessment", "status"])]

    def __str__(self) -> str:
        return self.instrument_name

    def clean(self):
        if self.session_id and self.session.assessment_id != self.assessment_id:
            raise ValidationError("Sessão não pertence à avaliação informada.")
        if self.instrument_id and not self.instrument_name:
            self.instrument_name = self.instrument.name

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class AssessmentResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    assessment = models.OneToOneField(
        Assessment,
        on_delete=models.CASCADE,
        related_name="result",
    )
    status = models.CharField(
        max_length=16,
        choices=AssessmentResultStatus.choices,
        default=AssessmentResultStatus.DRAFT,
    )
    summary = models.TextField()
    recommendations = models.TextField(blank=True)
    finalized_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_assessment_results",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="updated_assessment_results",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Resultado de {self.assessment}"


class AssessmentDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="assessment_documents",
    )
    document = models.ForeignKey(
        GeneratedDocument,
        on_delete=models.PROTECT,
        related_name="assessment_links",
    )
    document_type = models.CharField(
        max_length=16,
        choices=AssessmentDocumentType.choices,
        default=AssessmentDocumentType.REPORT,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["assessment", "document"],
                name="unique_document_per_assessment",
            )
        ]

    def __str__(self) -> str:
        return f"{self.document} em {self.assessment}"

    def clean(self):
        if self.document_id and self.document.clinic_id != self.assessment.clinic_id:
            raise ValidationError("Documento não pertence à clínica da avaliação.")
        if self.document_id and self.document.patient_id != self.assessment.patient_id:
            raise ValidationError("Documento não pertence ao paciente da avaliação.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
