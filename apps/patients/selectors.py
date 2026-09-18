from django.db.models import Q, QuerySet

from apps.accounts.models import UserRole, has_explicit_platform_role
from apps.patients.models import Patient


def patients_visible_to_user(user) -> QuerySet[Patient]:
    if not user.is_authenticated:
        return Patient.objects.none()

    if has_explicit_platform_role(user):
        return Patient.objects.none()

    admin_or_reception = [UserRole.CLINIC_ADMIN, UserRole.RECEPTIONIST]
    admin_clinic_ids = list(
        user.clinic_memberships.filter(
            role__in=admin_or_reception,
            is_active=True,
        ).values_list("clinic_id", flat=True)
    )
    professional_clinic_ids = list(
        user.professional_profiles.filter(
            is_active=True,
        ).values_list("clinic_id", flat=True)
    )

    return Patient.objects.filter(
        Q(clinic_id__in=admin_clinic_ids) | Q(clinic_id__in=professional_clinic_ids),
        is_active=True,
    ).distinct()
