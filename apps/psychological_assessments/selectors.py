from django.db.models import QuerySet

from apps.accounts.models import has_explicit_platform_role
from apps.psychological_assessments.models import Assessment


def assessment_clinic_ids_for_user(user) -> list[str]:
    if has_explicit_platform_role(user):
        return []

    return list(
        user.professional_profiles.filter(is_active=True).values_list(
            "clinic_id",
            flat=True,
        )
    )


def assessments_visible_to_user(user) -> QuerySet[Assessment]:
    if not user.is_authenticated:
        return Assessment.objects.none()

    return Assessment.objects.filter(
        clinic_id__in=assessment_clinic_ids_for_user(user),
        is_active=True,
    ).distinct()
