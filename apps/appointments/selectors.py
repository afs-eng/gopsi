from django.db.models import Q, QuerySet

from apps.accounts.models import UserRole, has_explicit_platform_role
from apps.appointments.models import Appointment, ScheduleBlock


def appointment_clinic_ids_for_user(user) -> list[str]:
    if has_explicit_platform_role(user):
        return []

    allowed_roles = [UserRole.CLINIC_ADMIN, UserRole.RECEPTIONIST]
    membership_ids = list(
        user.clinic_memberships.filter(
            role__in=allowed_roles,
            is_active=True,
        ).values_list("clinic_id", flat=True)
    )
    professional_ids = list(
        user.professional_profiles.filter(is_active=True).values_list(
            "clinic_id", flat=True
        )
    )
    return membership_ids + professional_ids


def appointments_visible_to_user(user) -> QuerySet[Appointment]:
    if not user.is_authenticated:
        return Appointment.objects.none()

    return Appointment.objects.filter(
        Q(clinic_id__in=appointment_clinic_ids_for_user(user)),
        is_active=True,
    ).distinct()


def blocks_visible_to_user(user) -> QuerySet[ScheduleBlock]:
    if not user.is_authenticated:
        return ScheduleBlock.objects.none()

    return ScheduleBlock.objects.filter(
        Q(clinic_id__in=appointment_clinic_ids_for_user(user)),
        is_active=True,
    ).distinct()
