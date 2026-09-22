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
    ASSESSMENT_CREATE = "ASSESSMENT_CREATE", "Avaliação criada"
    ASSESSMENT_UPDATE = "ASSESSMENT_UPDATE", "Avaliação atualizada"
    ASSESSMENT_CANCEL = "ASSESSMENT_CANCEL", "Avaliação cancelada"
    ASSESSMENT_RESULT_FINALIZE = (
        "ASSESSMENT_RESULT_FINALIZE",
        "Resultado de avaliação finalizado",
    )
    ASSESSMENT_RESULT_VOID = "ASSESSMENT_RESULT_VOID", "Resultado de avaliação anulado"
    ASSESSMENT_PLAN_CREATE = "ASSESSMENT_PLAN_CREATE", "Planejamento criado"
    ASSESSMENT_PLAN_UPDATE = "ASSESSMENT_PLAN_UPDATE", "Planejamento atualizado"
    ASSESSMENT_SESSION_CREATE = (
        "ASSESSMENT_SESSION_CREATE",
        "Sessão de avaliação criada",
    )
    ASSESSMENT_SESSION_UPDATE = (
        "ASSESSMENT_SESSION_UPDATE",
        "Sessão de avaliação atualizada",
    )
    ASSESSMENT_SESSION_DELETE = (
        "ASSESSMENT_SESSION_DELETE",
        "Sessão de avaliação removida",
    )
    ASSESSMENT_INSTRUMENT_CREATE = (
        "ASSESSMENT_INSTRUMENT_CREATE",
        "Instrumento de avaliação criado",
    )
    ASSESSMENT_INSTRUMENT_UPDATE = (
        "ASSESSMENT_INSTRUMENT_UPDATE",
        "Instrumento de avaliação atualizado",
    )
    ASSESSMENT_INSTRUMENT_DELETE = (
        "ASSESSMENT_INSTRUMENT_DELETE",
        "Instrumento de avaliação removido",
    )
    ASSESSMENT_DOCUMENT_LINK = (
        "ASSESSMENT_DOCUMENT_LINK",
        "Documento vinculado à avaliação",
    )
    ASSESSMENT_DOCUMENT_UNLINK = (
        "ASSESSMENT_DOCUMENT_UNLINK",
        "Documento desvinculado da avaliação",
    )


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
