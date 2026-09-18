from django.db.models import Q, QuerySet

from apps.accounts.models import UserRole, has_explicit_platform_role
from apps.audit.models import AuditEvent


def audit_events_visible_to_user(user) -> QuerySet[AuditEvent]:
    if not user.is_authenticated or has_explicit_platform_role(user):
        return AuditEvent.objects.none()
    clinic_ids = list(
        user.clinic_memberships.filter(
            role=UserRole.CLINIC_ADMIN,
            is_active=True,
        ).values_list("clinic_id", flat=True)
    )
    return AuditEvent.objects.filter(Q(clinic_id__in=clinic_ids) | Q(actor=user))
