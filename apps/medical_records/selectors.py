from django.db.models import QuerySet

from apps.accounts.models import has_explicit_platform_role
from apps.medical_records.models import MedicalRecordAuditEvent, MedicalRecordEntry


def medical_record_clinic_ids_for_user(user) -> list[str]:
    if has_explicit_platform_role(user):
        return []

    return list(
        user.professional_profiles.filter(is_active=True).values_list(
            "clinic_id",
            flat=True,
        )
    )


def medical_records_visible_to_user(user) -> QuerySet[MedicalRecordEntry]:
    if not user.is_authenticated:
        return MedicalRecordEntry.objects.none()

    return MedicalRecordEntry.objects.filter(
        clinic_id__in=medical_record_clinic_ids_for_user(user),
        is_active=True,
    ).distinct()


def medical_record_audit_visible_to_user(user) -> QuerySet[MedicalRecordAuditEvent]:
    if not user.is_authenticated:
        return MedicalRecordAuditEvent.objects.none()

    return MedicalRecordAuditEvent.objects.filter(
        clinic_id__in=medical_record_clinic_ids_for_user(user),
    ).distinct()
