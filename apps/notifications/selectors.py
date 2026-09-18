from django.db.models import Q, QuerySet

from apps.accounts.models import UserRole, has_explicit_platform_role
from apps.notifications.models import Notification, NotificationTemplate


def _notification_clinic_filter(user) -> Q:
    admin_or_reception = [UserRole.CLINIC_ADMIN, UserRole.RECEPTIONIST]
    admin_clinic_ids = list(
        user.clinic_memberships.filter(
            role__in=admin_or_reception,
            is_active=True,
        ).values_list("clinic_id", flat=True)
    )
    professional_clinic_ids = list(
        user.professional_profiles.filter(is_active=True).values_list(
            "clinic_id",
            flat=True,
        )
    )
    return Q(clinic_id__in=admin_clinic_ids) | Q(clinic_id__in=professional_clinic_ids)


def notification_templates_visible_to_user(user) -> QuerySet[NotificationTemplate]:
    if not user.is_authenticated:
        return NotificationTemplate.objects.none()
    if has_explicit_platform_role(user):
        return NotificationTemplate.objects.none()
    return NotificationTemplate.objects.filter(
        _notification_clinic_filter(user),
        is_active=True,
    ).distinct()


def notifications_visible_to_user(user) -> QuerySet[Notification]:
    if not user.is_authenticated:
        return Notification.objects.none()
    if has_explicit_platform_role(user):
        return Notification.objects.none()
    return Notification.objects.filter(_notification_clinic_filter(user)).distinct()
