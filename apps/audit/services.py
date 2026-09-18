import logging

from django.db import DatabaseError, ProgrammingError

from apps.audit.models import AuditEvent

logger = logging.getLogger(__name__)
SENSITIVE_METADATA_KEYS = {"password", "token", "access_token", "refresh_token"}


def client_ip(request) -> str | None:
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def sanitize_metadata(metadata: dict | None) -> dict:
    if not metadata:
        return {}
    return {
        key: value
        for key, value in metadata.items()
        if key.lower() not in SENSITIVE_METADATA_KEYS
    }


def record_audit_event(
    *,
    action: str,
    request=None,
    actor=None,
    clinic=None,
    resource_type: str = "",
    resource_id: str = "",
    metadata: dict | None = None,
) -> AuditEvent | None:
    if request is not None and actor is None:
        actor = request.user if request.user.is_authenticated else None

    try:
        return AuditEvent.objects.create(
            action=action,
            actor=actor,
            clinic=clinic,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id else "",
            ip_address=client_ip(request) if request is not None else None,
            user_agent=(
                request.META.get("HTTP_USER_AGENT", "") if request is not None else ""
            ),
            metadata=sanitize_metadata(metadata),
        )
    except (DatabaseError, ProgrammingError):
        logger.exception("Falha ao registrar evento de auditoria: %s", action)
        return None
