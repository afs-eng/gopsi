from uuid import uuid4

from django.conf import settings
from django.db import models

from apps.clinics.models import Clinic


class AuditAction(models.TextChoices):
    LOGIN_SUCCESS = "LOGIN_SUCCESS", "Login realizado"
    LOGIN_FAILED = "LOGIN_FAILED", "Login falhou"
    LOGOUT = "LOGOUT", "Logout"
    MFA_CHALLENGE = "MFA_CHALLENGE", "Desafio MFA"
    MFA_ENABLED = "MFA_ENABLED", "MFA ativado"
    MFA_DISABLED = "MFA_DISABLED", "MFA desativado"
    MEDICAL_RECORD_VIEWED = "MEDICAL_RECORD_VIEWED", "Prontuário visualizado"
    DOCUMENT_DOWNLOADED = "DOCUMENT_DOWNLOADED", "Documento baixado"
    PERMISSION_CHANGED = "PERMISSION_CHANGED", "Permissão alterada"
    ADMIN_ACCESS = "ADMIN_ACCESS", "Acesso administrativo"
    DATA_REQUEST_CREATED = "DATA_REQUEST_CREATED", "Solicitação LGPD criada"
    DATA_REQUEST_UPDATED = "DATA_REQUEST_UPDATED", "Solicitação LGPD atualizada"


class AuditEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="audit_events",
        blank=True,
        null=True,
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="audit_events",
        blank=True,
        null=True,
    )
    action = models.CharField(max_length=32, choices=AuditAction.choices)
    resource_type = models.CharField(max_length=120, blank=True)
    resource_id = models.CharField(max_length=120, blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["clinic", "action", "created_at"]),
            models.Index(fields=["actor", "created_at"]),
            models.Index(fields=["resource_type", "resource_id"]),
        ]

    def __str__(self) -> str:
        return f"{self.action} em {self.created_at}"
