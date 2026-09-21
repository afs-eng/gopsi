from uuid import uuid4

from django.conf import settings
from django.db import models

from apps.clinics.models import Clinic
from apps.professionals.models import Professional


class Sex(models.TextChoices):
    FEMALE = "FEMALE", "Feminino"
    MALE = "MALE", "Masculino"
    OTHER = "OTHER", "Outro"
    NOT_INFORMED = "NOT_INFORMED", "Não informado"


class PatientStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Ativo"
    INACTIVE = "INACTIVE", "Inativo"
    ARCHIVED = "ARCHIVED", "Arquivado"


class Patient(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="patients",
    )
    full_name = models.CharField(max_length=255)
    social_name = models.CharField(max_length=255, blank=True)
    cpf = models.CharField(max_length=14, blank=True)
    birth_date = models.DateField(blank=True, null=True)
    sex = models.CharField(max_length=16, choices=Sex.choices, default=Sex.NOT_INFORMED)
    gender_identity = models.CharField(max_length=80, blank=True)
    photo = models.ImageField(upload_to="patients/photos/", blank=True, null=True)
    record_number = models.CharField(max_length=64, blank=True)
    marital_status = models.CharField(max_length=80, blank=True)
    education = models.CharField(max_length=120, blank=True)
    profession = models.CharField(max_length=120, blank=True)
    occupation = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    zip_code = models.CharField(max_length=16, blank=True)
    address_number = models.CharField(max_length=32, blank=True)
    address_complement = models.CharField(max_length=120, blank=True)
    district = models.CharField(max_length=120, blank=True)
    city = models.CharField(max_length=120, blank=True)
    state = models.CharField(max_length=2, blank=True)
    has_health_plan = models.BooleanField(default=False)
    health_plan = models.CharField(max_length=120, blank=True)
    health_plan_card = models.CharField(max_length=120, blank=True)
    referral_source = models.CharField(max_length=120, blank=True)
    emergency_contact_name = models.CharField(max_length=255, blank=True)
    emergency_contact_phone = models.CharField(max_length=32, blank=True)
    status = models.CharField(
        max_length=16,
        choices=PatientStatus.choices,
        default=PatientStatus.ACTIVE,
    )
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_patients",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["full_name"]
        indexes = [
            models.Index(fields=["clinic", "is_active"]),
            models.Index(fields=["clinic", "status"]),
        ]

    def __str__(self) -> str:
        return self.full_name


class Guardian(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="guardians",
    )
    full_name = models.CharField(max_length=255)
    relationship = models.CharField(max_length=80)
    cpf = models.CharField(max_length=14, blank=True)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    has_authorization = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["full_name"]

    def __str__(self) -> str:
        return f"{self.full_name} ({self.relationship})"


class ProfessionalPatient(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="professional_links",
    )
    professional = models.ForeignKey(
        Professional,
        on_delete=models.PROTECT,
        related_name="patient_links",
    )
    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["patient", "professional"],
                name="unique_patient_professional_link",
            )
        ]
        indexes = [models.Index(fields=["patient", "professional", "is_active"])]

    def __str__(self) -> str:
        return f"{self.patient} - {self.professional}"


# Create your models here.
