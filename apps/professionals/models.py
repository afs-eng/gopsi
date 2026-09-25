from uuid import uuid4

from django.conf import settings
from django.db import models

from apps.clinics.models import Clinic


class ProfessionalStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Ativo"
    INACTIVE = "INACTIVE", "Inativo"
    BLOCKED = "BLOCKED", "Bloqueado"


class CareModality(models.TextChoices):
    IN_PERSON = "IN_PERSON", "Presencial"
    ONLINE = "ONLINE", "Online"
    HYBRID = "HYBRID", "Híbrido"


class Specialty(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=120, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Especialidade"
        verbose_name_plural = "Especialidades"

    def __str__(self) -> str:
        return self.name


class Professional(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="professionals",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="professional_profiles",
        blank=True,
        null=True,
    )
    full_name = models.CharField(max_length=255)
    cpf = models.CharField(max_length=14, blank=True)
    birth_date = models.DateField(blank=True, null=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=32, blank=True)
    profession = models.CharField(max_length=120)
    crp = models.CharField(max_length=32, blank=True)
    crp_state = models.CharField(max_length=2, blank=True)
    registration_number = models.CharField(max_length=64, blank=True)
    status = models.CharField(
        max_length=16,
        choices=ProfessionalStatus.choices,
        default=ProfessionalStatus.ACTIVE,
    )
    biography = models.TextField(blank=True)
    appointment_modalities = models.CharField(
        max_length=16,
        choices=CareModality.choices,
        default=CareModality.IN_PERSON,
    )
    appointment_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    default_appointment_duration = models.PositiveSmallIntegerField(default=50)
    specialties = models.ManyToManyField(
        Specialty, blank=True, related_name="professionals"
    )
    is_active = models.BooleanField(default=True)
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


# Create your models here.
