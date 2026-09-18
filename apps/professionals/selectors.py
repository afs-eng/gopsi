from django.db.models import QuerySet

from apps.accounts.models import has_explicit_platform_role
from apps.professionals.models import Professional


def professionals_visible_to_user(user) -> QuerySet[Professional]:
    if not user.is_authenticated or has_explicit_platform_role(user):
        return Professional.objects.none()

    return Professional.objects.filter(
        clinic__memberships__user=user,
        clinic__memberships__is_active=True,
        is_active=True,
    ).distinct()
