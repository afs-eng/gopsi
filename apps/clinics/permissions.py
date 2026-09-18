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
