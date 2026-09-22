from django.db.models import QuerySet

from apps.accounts.models import UserRole, has_explicit_platform_role
from apps.psychological_assessments.models import Assessment


def assessment_clinic_ids_for_user(user) -> list[str]:
    if has_explicit_platform_role(user):
        return []

    professional_clinic_ids = list(
        user.professional_profiles.filter(is_active=True).values_list(
            "clinic_id",
            flat=True,
        )
    )
    admin_clinic_ids = list(
        user.clinic_memberships.filter(
            role=UserRole.CLINIC_ADMIN,
            is_active=True,
        ).values_list("clinic_id", flat=True)
    )
    return list({*professional_clinic_ids, *admin_clinic_ids})


def assessments_visible_to_user(user) -> QuerySet[Assessment]:
    if not user.is_authenticated:
        return Assessment.objects.none()

    return Assessment.objects.filter(
        clinic_id__in=assessment_clinic_ids_for_user(user),
        is_active=True,
    ).distinct()
