from django.db.models import Q, QuerySet

from apps.accounts.models import UserRole, has_explicit_platform_role
from apps.documents.models import DocumentTemplate, GeneratedDocument


def _document_clinic_filter(user) -> Q:
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


def document_templates_visible_to_user(user) -> QuerySet[DocumentTemplate]:
    if not user.is_authenticated:
        return DocumentTemplate.objects.none()
    if has_explicit_platform_role(user):
        return DocumentTemplate.objects.none()
    return DocumentTemplate.objects.filter(
        _document_clinic_filter(user),
        is_active=True,
    )


def generated_documents_visible_to_user(user) -> QuerySet[GeneratedDocument]:
    if not user.is_authenticated:
        return GeneratedDocument.objects.none()
    if has_explicit_platform_role(user):
        return GeneratedDocument.objects.none()
    return GeneratedDocument.objects.filter(
        _document_clinic_filter(user),
        is_active=True,
    )
