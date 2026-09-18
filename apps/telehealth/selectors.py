from django.db.models import QuerySet

from apps.accounts.models import has_explicit_platform_role
from apps.appointments.selectors import appointment_clinic_ids_for_user
from apps.telehealth.models import TelehealthParticipantEvent, TelehealthSession


def telehealth_sessions_visible_to_user(user) -> QuerySet[TelehealthSession]:
    if not user.is_authenticated:
        return TelehealthSession.objects.none()

    if has_explicit_platform_role(user):
        return TelehealthSession.objects.none()

    return TelehealthSession.objects.filter(
        clinic_id__in=appointment_clinic_ids_for_user(user),
        is_active=True,
    ).distinct()


def telehealth_events_visible_to_user(user) -> QuerySet[TelehealthParticipantEvent]:
    if not user.is_authenticated:
        return TelehealthParticipantEvent.objects.none()

    if has_explicit_platform_role(user):
        return TelehealthParticipantEvent.objects.none()

    return TelehealthParticipantEvent.objects.filter(
        session__clinic_id__in=appointment_clinic_ids_for_user(user),
    ).distinct()
