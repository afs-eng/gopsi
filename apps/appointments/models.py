from uuid import uuid4

from django.core.exceptions import ValidationError
from django.db import models

from apps.clinics.models import Clinic
from apps.patients.models import Patient
from apps.professionals.models import CareModality, Professional


class AppointmentStatus(models.TextChoices):
    SCHEDULED = "SCHEDULED", "Agendada"
    CONFIRMED = "CONFIRMED", "Confirmada"
    IN_PROGRESS = "IN_PROGRESS", "Em atendimento"
    COMPLETED = "COMPLETED", "Concluída"
    CANCELLED = "CANCELLED", "Cancelada"
    NO_SHOW = "NO_SHOW", "Faltou"


class Appointment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="appointments",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="appointments",
    )
    professional = models.ForeignKey(
        Professional,
        on_delete=models.PROTECT,
        related_name="appointments",
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    modality = models.CharField(
        max_length=16,
        choices=CareModality.choices,
        default=CareModality.IN_PERSON,
    )
    status = models.CharField(
        max_length=16,
        choices=AppointmentStatus.choices,
        default=AppointmentStatus.SCHEDULED,
    )
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    administrative_notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "start_time"]
        indexes = [
            models.Index(fields=["clinic", "date"]),
            models.Index(fields=["professional", "date", "start_time"]),
            models.Index(fields=["patient", "date"]),
        ]

    def __str__(self) -> str:
        return f"{self.patient} com {self.professional} em {self.date}"

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError(
                "O horário inicial deve ser anterior ao horário final."
            )

        if self.patient_id and self.patient.clinic_id != self.clinic_id:
            raise ValidationError("Paciente não pertence à clínica da consulta.")

        if self.professional_id and self.professional.clinic_id != self.clinic_id:
            raise ValidationError("Profissional não pertence à clínica da consulta.")

        conflict = Appointment.objects.filter(
            professional=self.professional,
            date=self.date,
            is_active=True,
        ).exclude(status=AppointmentStatus.CANCELLED)

        if self.pk:
            conflict = conflict.exclude(pk=self.pk)

        if conflict.filter(
            start_time__lt=self.end_time, end_time__gt=self.start_time
        ).exists():
            raise ValidationError(
                "Já existe consulta para este profissional no horário."
            )

        block_conflict = ScheduleBlock.objects.filter(
            professional=self.professional,
            date=self.date,
            is_active=True,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time,
        ).exists()

        if block_conflict:
            raise ValidationError("Existe bloqueio de agenda para este horário.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class ScheduleBlock(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="schedule_blocks",
    )
    professional = models.ForeignKey(
        Professional,
        on_delete=models.PROTECT,
        related_name="schedule_blocks",
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    reason = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "start_time"]
        indexes = [models.Index(fields=["professional", "date", "is_active"])]

    def __str__(self) -> str:
        return f"Bloqueio de {self.professional} em {self.date}"

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError(
                "O horário inicial deve ser anterior ao horário final."
            )

        if self.professional_id and self.professional.clinic_id != self.clinic_id:
            raise ValidationError("Profissional não pertence à clínica do bloqueio.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


# Create your models here.
