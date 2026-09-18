from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.accounts.models import has_explicit_platform_role

class CanAccessMedicalRecords(BasePermission):
    def has_permission(self, request, view) -> bool:
        user = request.user

        if not user.is_authenticated:
            return False

        if has_explicit_platform_role(user):
            return False

        if request.method in SAFE_METHODS:
            return True

        if view.kwargs.get("pk"):
            return True

        clinic_id = request.data.get("clinic") or request.query_params.get("clinic")
        return user.professional_profiles.filter(
            clinic_id=clinic_id,
            is_active=True,
        ).exists()

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user

        if not user.is_authenticated:
            return False

        if has_explicit_platform_role(user):
            return False

        return user.professional_profiles.filter(
            clinic=obj.clinic,
            is_active=True,
        ).exists()
