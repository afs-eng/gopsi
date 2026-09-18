from django.db.models import Q, QuerySet

from apps.accounts.models import UserRole, has_explicit_platform_role
from apps.privacy.models import DataSubjectRequest


def privacy_clinic_ids_for_user(user) -> list[str]:
    if has_explicit_platform_role(user):
        return []
    return list(
        user.clinic_memberships.filter(
            role__in=[UserRole.CLINIC_ADMIN, UserRole.RECEPTIONIST],
            is_active=True,
        ).values_list("clinic_id", flat=True)
    )


def data_subject_requests_visible_to_user(user) -> QuerySet[DataSubjectRequest]:
    if not user.is_authenticated:
        return DataSubjectRequest.objects.none()
    if has_explicit_platform_role(user):
        return DataSubjectRequest.objects.none()
    return DataSubjectRequest.objects.filter(
        Q(clinic_id__in=privacy_clinic_ids_for_user(user)) | Q(subject_user=user)
    ).distinct()
