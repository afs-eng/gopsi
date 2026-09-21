from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.accounts.models import has_explicit_platform_role


class CanAccessPsychologicalAssessments(BasePermission):
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
        if not clinic_id and request.data.get("assessment"):
            return True
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

        clinic = getattr(obj, "clinic", None) or getattr(obj.assessment, "clinic", None)
        return user.professional_profiles.filter(
            clinic=clinic,
            is_active=True,
        ).exists()
