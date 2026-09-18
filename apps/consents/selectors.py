from django.db.models import Q, QuerySet

from apps.accounts.models import UserRole, has_explicit_platform_role
from apps.consents.models import ConsentRecord, ConsentTemplate


def _consent_clinic_filter(user) -> Q:
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


def consent_templates_visible_to_user(user) -> QuerySet[ConsentTemplate]:
    if not user.is_authenticated:
        return ConsentTemplate.objects.none()
    if has_explicit_platform_role(user):
        return ConsentTemplate.objects.none()
    return ConsentTemplate.objects.filter(
        _consent_clinic_filter(user),
        is_active=True,
    ).distinct()


def consent_records_visible_to_user(user) -> QuerySet[ConsentRecord]:
    if not user.is_authenticated:
        return ConsentRecord.objects.none()
    if has_explicit_platform_role(user):
        return ConsentRecord.objects.none()
    return ConsentRecord.objects.filter(_consent_clinic_filter(user)).distinct()
