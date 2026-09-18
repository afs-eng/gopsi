from django.db.models import QuerySet

from apps.accounts.models import UserRole, has_explicit_platform_role
from apps.clinics.models import Clinic

PERMITTED_CLINIC_MEMBERSHIP_ROLES = (
    UserRole.CLINIC_ADMIN,
    UserRole.PSYCHOLOGIST,
    UserRole.PROFESSIONAL,
    UserRole.RECEPTIONIST,
)


def clinics_visible_to_user(user) -> QuerySet[Clinic]:
    if not user.is_authenticated:
        return Clinic.objects.none()

    if has_explicit_platform_role(user):
        return Clinic.objects.none()

    return Clinic.objects.filter(
        memberships__user=user,
        memberships__is_active=True,
        memberships__role__in=PERMITTED_CLINIC_MEMBERSHIP_ROLES,
        is_active=True,
    ).distinct()
