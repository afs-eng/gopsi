from uuid import uuid4

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.accounts.models import UserRole, has_explicit_platform_role


class Clinic(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=255)
    legal_name = models.CharField(max_length=255, blank=True)
    document = models.CharField(max_length=18, blank=True)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class ClinicStaffRole(models.TextChoices):
    RECEPTIONIST = "RECEPTIONIST", "Recepção/Secretaria"
    FINANCE = "FINANCE", "Financeiro"
    ADMINISTRATIVE = "ADMINISTRATIVE", "Administrativo"
    OPERATIONAL = "OPERATIONAL", "Operacional"
    ACCOUNTANT = "ACCOUNTANT", "Contador"
    CLEANING = "CLEANING", "Limpeza"
    OTHER = "OTHER", "Outro"


class ClinicStaffStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Ativo"
    INACTIVE = "INACTIVE", "Inativo"
    BLOCKED = "BLOCKED", "Bloqueado"


class ClinicStaff(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.CASCADE,
        related_name="staff_members",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="clinic_staff_profiles",
        blank=True,
        null=True,
    )
    full_name = models.CharField(max_length=255)
    role = models.CharField(
        max_length=32,
        choices=ClinicStaffRole.choices,
        default=ClinicStaffRole.ADMINISTRATIVE,
    )
    cpf = models.CharField(max_length=14, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=32, blank=True)
    position = models.CharField(max_length=120, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=16,
        choices=ClinicStaffStatus.choices,
        default=ClinicStaffStatus.ACTIVE,
    )
    access_enabled = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["full_name"]
        indexes = [
            models.Index(fields=["clinic", "status", "is_active"]),
            models.Index(fields=["clinic", "role"]),
        ]

    def __str__(self) -> str:
        return f"{self.full_name} - {self.clinic}"


class ClinicMembership(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="clinic_memberships",
    )
    role = models.CharField(max_length=32, choices=UserRole.choices)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["clinic", "user"],
                name="unique_user_per_clinic",
            )
        ]
        indexes = [
            models.Index(fields=["clinic", "user", "is_active"]),
            models.Index(fields=["user", "is_active"]),
        ]

    def __str__(self) -> str:
        return f"{self.user} em {self.clinic} ({self.role})"

    def clean(self):
        super().clean()
        if self.role == UserRole.SUPERADMIN:
            raise ValidationError(
                {"role": "O papel da plataforma não pode ser usado em uma clínica."}
            )
        if self.user_id and has_explicit_platform_role(self.user):
            raise ValidationError(
                {"user": "Contas da plataforma não podem ter vínculo com clínicas."}
            )


# Create your models here.
