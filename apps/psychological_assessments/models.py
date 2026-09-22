from uuid import uuid4

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils import timezone

from apps.clinics.models import Clinic
from apps.documents.models import GeneratedDocument
from apps.patients.models import Patient
from apps.professionals.models import Professional


class AssessmentStatus(models.TextChoices):
    PLANNING = "PLANNING", "Planejamento"
    IN_PROGRESS = "IN_PROGRESS", "Em andamento"
    WAITING_INFORMATION = "WAITING_INFORMATION", "Aguardando informação"
    WRITING = "WRITING", "Em elaboração"
    WAITING_FEEDBACK = "WAITING_FEEDBACK", "Aguardando devolutiva"
    COMPLETED = "COMPLETED", "Concluída"
    CANCELLED = "CANCELLED", "Cancelada"


class AssessmentType(models.TextChoices):
    PSYCHOLOGICAL = "PSYCHOLOGICAL", "Psicológica"
    NEUROPSYCHOLOGICAL = "NEUROPSYCHOLOGICAL", "Neuropsicológica"
    PSYCHODIAGNOSTIC = "PSYCHODIAGNOSTIC", "Psicodiagnóstica"
    BEHAVIORAL = "BEHAVIORAL", "Comportamental"
    DEVELOPMENT = "DEVELOPMENT", "Desenvolvimento"
    OTHER = "OTHER", "Outra"


class AssessmentCodeCounter(models.Model):
    year = models.PositiveIntegerField(unique=True)
    next_number = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["year"]

    def __str__(self) -> str:
        return f"AV-{self.year} próximo {self.next_number}"


def generate_assessment_code() -> str:
    year = timezone.now().year
    with transaction.atomic():
        counter, _created = (
            AssessmentCodeCounter.objects.select_for_update().get_or_create(
                year=year,
                defaults={"next_number": 1},
            )
        )
        number = counter.next_number
        counter.next_number += 1
        counter.save(update_fields=["next_number"])
    return f"AV-{year}-{number:06d}"


class AssessmentSessionStatus(models.TextChoices):
    SCHEDULED = "SCHEDULED", "Agendada"
    COMPLETED = "COMPLETED", "Concluída"
    CANCELLED = "CANCELLED", "Cancelada"


class AssessmentSessionModality(models.TextChoices):
    IN_PERSON = "IN_PERSON", "Presencial"
    ONLINE = "ONLINE", "Online"
    OTHER = "OTHER", "Outra"


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


class AssessmentTimelineEventType(models.TextChoices):
    CREATED = "CREATED", "Criada"
    UPDATED = "UPDATED", "Atualizada"
    PLANNED = "PLANNED", "Planejamento"
    SESSION_REGISTERED = "SESSION_REGISTERED", "Sessão registrada"
    RESULT_CREATED = "RESULT_CREATED", "Resultado criado"
    RESULT_FINALIZED = "RESULT_FINALIZED", "Resultado finalizado"
    RESULT_VOIDED = "RESULT_VOIDED", "Resultado anulado"
    CANCELLED = "CANCELLED", "Cancelada"


class AssessmentInstrument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=500, blank=True, default="")
    category = models.CharField(max_length=100, blank=True)
    version = models.CharField(max_length=50, blank=True)
    min_age_months = models.PositiveIntegerField(null=True, blank=True, help_text="Idade mínima em meses")
    max_age_months = models.PositiveIntegerField(null=True, blank=True, help_text="Idade máxima em meses")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"


class Assessment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    code = models.CharField(max_length=20, unique=True, blank=True, null=True)
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
    assessment_type = models.CharField(
        max_length=32,
        choices=AssessmentType.choices,
        default=AssessmentType.PSYCHOLOGICAL,
    )
    purpose = models.TextField(blank=True)
    demand_origin = models.CharField(max_length=180, blank=True)
    requester = models.CharField(max_length=180, blank=True)
    reason = models.TextField(blank=True)
    objective = models.TextField(blank=True)
    status = models.CharField(
        max_length=32,
        choices=AssessmentStatus.choices,
        default=AssessmentStatus.PLANNING,
    )
    started_at = models.DateField(blank=True, null=True)
    expected_at = models.DateField(blank=True, null=True)
    completed_at = models.DateField(blank=True, null=True)
    cancellation_reason = models.TextField(blank=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="cancelled_psychological_assessments",
        blank=True,
        null=True,
    )
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
            models.Index(fields=["clinic", "code"]),
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
        if self.expected_at and self.started_at and self.expected_at < self.started_at:
            raise ValidationError("Previsão não pode ocorrer antes do início.")
        if self.status == AssessmentStatus.COMPLETED and not self.completed_at:
            raise ValidationError("Informe a data de conclusão da avaliação concluída.")
        if self.status == AssessmentStatus.CANCELLED and not self.cancellation_reason:
            raise ValidationError("Informe o motivo do cancelamento da avaliação.")

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = generate_assessment_code()
        self.full_clean()
        super().save(*args, **kwargs)

    def cancel(self, *, reason: str, user):
        self.status = AssessmentStatus.CANCELLED
        self.cancellation_reason = reason
        self.cancelled_at = timezone.now()
        self.cancelled_by = user
        self.updated_by = user
        self.save()


class AssessmentPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    assessment = models.OneToOneField(
        Assessment,
        on_delete=models.CASCADE,
        related_name="plan",
    )
    question = models.TextField(blank=True)
    hypotheses = models.TextField(blank=True)
    domains = models.JSONField(default=list, blank=True)
    procedures = models.JSONField(default=list, blank=True)
    planned_instruments = models.ManyToManyField(
        AssessmentInstrument,
        related_name="planned_assessments",
        blank=True,
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_assessment_plans",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="updated_assessment_plans",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Planejamento de {self.assessment}"


class AssessmentSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="sessions",
    )
    professional = models.ForeignKey(
        Professional,
        on_delete=models.PROTECT,
        related_name="assessment_sessions",
        blank=True,
        null=True,
    )
    session_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    modality = models.CharField(
        max_length=16,
        choices=AssessmentSessionModality.choices,
        default=AssessmentSessionModality.IN_PERSON,
    )
    status = models.CharField(
        max_length=16,
        choices=AssessmentSessionStatus.choices,
        default=AssessmentSessionStatus.SCHEDULED,
    )
    objective = models.TextField(blank=True)
    procedures = models.TextField(blank=True)
    administrative_notes = models.TextField(blank=True)
    permitted_observations = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_assessment_sessions",
        blank=True,
        null=True,
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="updated_assessment_sessions",
        blank=True,
        null=True,
    )
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
        if self.professional_id and (
            self.professional.clinic_id != self.assessment.clinic_id
        ):
            raise ValidationError("Profissional não pertence à clínica da avaliação.")

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
    applied_by = models.ForeignKey(
        Professional,
        on_delete=models.PROTECT,
        related_name="applied_assessment_instruments",
        blank=True,
        null=True,
    )
    reviewed_by = models.ForeignKey(
        Professional,
        on_delete=models.PROTECT,
        related_name="reviewed_assessment_instruments",
        blank=True,
        null=True,
    )
    application_date = models.DateField(blank=True, null=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
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
        if (
            self.applied_by_id
            and self.applied_by.clinic_id != self.assessment.clinic_id
        ):
            raise ValidationError("Aplicador não pertence à clínica da avaliação.")
        if (
            self.reviewed_by_id
            and self.reviewed_by.clinic_id != self.assessment.clinic_id
        ):
            raise ValidationError("Revisor não pertence à clínica da avaliação.")
        if self.is_validated and not self.reviewed_by_id:
            raise ValidationError("Informe o profissional revisor para validar.")
        if self.reviewed_at and not self.reviewed_by_id:
            raise ValidationError("Informe o profissional revisor da aplicação.")

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
    void_reason = models.TextField(blank=True)
    voided_at = models.DateTimeField(blank=True, null=True)
    voided_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="voided_assessment_results",
        blank=True,
        null=True,
    )
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

    def finalize(self, *, user):
        if self.status == AssessmentResultStatus.VOIDED:
            raise ValidationError("Resultado anulado não pode ser finalizado.")
        self.status = AssessmentResultStatus.FINAL
        self.finalized_at = timezone.now()
        self.updated_by = user
        self.save()

    def void(self, *, reason: str, user):
        if self.status != AssessmentResultStatus.FINAL:
            raise ValidationError("Apenas resultado finalizado pode ser anulado.")
        self.status = AssessmentResultStatus.VOIDED
        self.void_reason = reason
        self.voided_at = timezone.now()
        self.voided_by = user
        self.updated_by = user
        self.save()


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


class AssessmentTimelineEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="timeline_events",
    )
    event_type = models.CharField(
        max_length=32,
        choices=AssessmentTimelineEventType.choices,
    )
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_assessment_timeline_events",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["assessment", "created_at"])]

    def __str__(self) -> str:
        return f"{self.title} - {self.assessment}"
