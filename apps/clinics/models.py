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
