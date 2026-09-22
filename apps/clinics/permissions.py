from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.accounts.models import has_explicit_platform_role
from apps.clinics.models import Clinic
from apps.clinics.policies import is_clinic_admin


class IsClinicWorkspaceUser(BasePermission):
    def has_permission(self, request, view) -> bool:
        user = request.user

        if not user.is_authenticated:
            return False

        if has_explicit_platform_role(user):
            return False

        if request.method in SAFE_METHODS:
            return True

        clinic_id = view.kwargs.get("pk")
        return bool(
            clinic_id
            and Clinic.objects.filter(id=clinic_id, is_active=True).exists()
            and is_clinic_admin(user, clinic_id)
        )


class IsClinicAdminForStaff(BasePermission):
    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user.is_authenticated or has_explicit_platform_role(user):
            return False

        clinic_id = request.data.get("clinic") or request.query_params.get("clinic")
        if not clinic_id and view.kwargs.get("pk"):
            return True
        return bool(clinic_id and is_clinic_admin(user, clinic_id))

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user
        if not user.is_authenticated or has_explicit_platform_role(user):
            return False
        return is_clinic_admin(user, obj.clinic_id)
