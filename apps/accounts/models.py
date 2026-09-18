from uuid import uuid4

from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
    SUPERADMIN = "SUPERADMIN", "Superadmin"
    CLINIC_ADMIN = "CLINIC_ADMIN", "Administrador da clínica"
    PSYCHOLOGIST = "PSYCHOLOGIST", "Psicólogo"
    PROFESSIONAL = "PROFESSIONAL", "Outro profissional"
    RECEPTIONIST = "RECEPTIONIST", "Secretária/Recepção"


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    cpf = models.CharField(max_length=14, blank=True)
    global_role = models.CharField(
        max_length=32,
        choices=UserRole.choices,
        default=UserRole.PROFESSIONAL,
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.full_name or self.username

    @property
    def is_platform_operator(self) -> bool:
        return is_platform_operator(self)

    @property
    def is_platform_admin(self) -> bool:
        """Backward-compatible name for the explicit platform role."""
        return self.is_platform_operator


class UserMFADevice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="mfa_device",
    )
    secret = models.CharField(max_length=64)
    is_confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(blank=True, null=True)
    last_used_at = models.DateTimeField(blank=True, null=True)

    def __str__(self) -> str:
        return f"MFA de {self.user}"


def has_explicit_platform_role(user) -> bool:
    """Return whether the application role identifies a platform account."""
    return getattr(user, "global_role", None) == UserRole.SUPERADMIN


def is_platform_operator(user) -> bool:
    """Allow platform authority only for a valid, separate platform identity."""
    if not getattr(user, "is_active", False) or not has_explicit_platform_role(user):
        return False
    if getattr(getattr(user, "_state", None), "adding", True):
        return False
    return not user.clinic_memberships.exists()
