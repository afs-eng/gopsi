from uuid import uuid4

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.appointments.models import Appointment
from apps.clinics.models import Clinic
from apps.patients.models import Patient
from apps.professionals.models import Professional


class MedicalRecordEntryType(models.TextChoices):
    EVOLUTION = "EVOLUTION", "Evolução"
    SESSION_NOTE = "SESSION_NOTE", "Nota de sessão"
    INITIAL_ASSESSMENT = "INITIAL_ASSESSMENT", "Avaliação inicial"


class MedicalRecordEntryStatus(models.TextChoices):
    DRAFT = "DRAFT", "Rascunho"
    FINAL = "FINAL", "Finalizado"
    VOIDED = "VOIDED", "Anulado"


class MedicalRecordAuditAction(models.TextChoices):
    CREATED = "CREATED", "Criado"
    UPDATED = "UPDATED", "Atualizado"
    VOIDED = "VOIDED", "Anulado"


class MedicalRecordEntry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="medical_record_entries",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="medical_record_entries",
    )
    professional = models.ForeignKey(
        Professional,
        on_delete=models.PROTECT,
        related_name="medical_record_entries",
    )
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.PROTECT,
        related_name="medical_record_entries",
        blank=True,
        null=True,
    )
    entry_type = models.CharField(
        max_length=32,
        choices=MedicalRecordEntryType.choices,
        default=MedicalRecordEntryType.EVOLUTION,
    )
    status = models.CharField(
        max_length=16,
        choices=MedicalRecordEntryStatus.choices,
        default=MedicalRecordEntryStatus.DRAFT,
    )
    content = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_medical_record_entries",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="updated_medical_record_entries",
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
            models.Index(fields=["professional", "created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.patient} - {self.get_entry_type_display()}"

    def clean(self):
        if self.patient_id and self.patient.clinic_id != self.clinic_id:
            raise ValidationError("Paciente não pertence à clínica do prontuário.")
        if self.professional_id and self.professional.clinic_id != self.clinic_id:
            raise ValidationError("Profissional não pertence à clínica do prontuário.")
        if self.appointment_id and self.appointment.clinic_id != self.clinic_id:
            raise ValidationError("Consulta não pertence à clínica do prontuário.")
        if self.appointment_id and self.appointment.patient_id != self.patient_id:
            raise ValidationError("Consulta não pertence ao paciente informado.")
        if (
            self.appointment_id
            and self.appointment.professional_id != self.professional_id
        ):
            raise ValidationError("Consulta não pertence ao profissional informado.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class MedicalRecordEntryVersion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    entry = models.ForeignKey(
        MedicalRecordEntry,
        on_delete=models.CASCADE,
        related_name="versions",
    )
    version = models.PositiveIntegerField()
    entry_type = models.CharField(max_length=32, choices=MedicalRecordEntryType.choices)
    status = models.CharField(max_length=16, choices=MedicalRecordEntryStatus.choices)
    content = models.TextField()
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="medical_record_versions",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["version"]
        constraints = [
            models.UniqueConstraint(
                fields=["entry", "version"],
                name="unique_medical_record_entry_version",
            )
        ]

    def __str__(self) -> str:
        return f"{self.entry_id} v{self.version}"


class MedicalRecordAuditEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="medical_record_audit_events",
    )
    entry = models.ForeignKey(
        MedicalRecordEntry,
        on_delete=models.CASCADE,
        related_name="audit_events",
    )
    action = models.CharField(max_length=16, choices=MedicalRecordAuditAction.choices)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="medical_record_audit_events",
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["clinic", "created_at"])]

    def __str__(self) -> str:
        return f"{self.action} por {self.actor}"
