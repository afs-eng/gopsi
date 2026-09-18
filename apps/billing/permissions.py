from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.accounts.models import UserRole, has_explicit_platform_role


class CanManageBilling(BasePermission):
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
        if not clinic_id and request.data.get("invoice"):
            return True

        return user.clinic_memberships.filter(
            clinic_id=clinic_id,
            role__in=[UserRole.CLINIC_ADMIN, UserRole.RECEPTIONIST],
            is_active=True,
        ).exists()

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user

        if not user.is_authenticated:
            return False

        if has_explicit_platform_role(user):
            return False

        clinic = getattr(obj, "clinic", None)
        if clinic is None and hasattr(obj, "invoice"):
            clinic = obj.invoice.clinic
        if clinic is None:
            return False
        return user.clinic_memberships.filter(
            clinic=clinic,
            role__in=[UserRole.CLINIC_ADMIN, UserRole.RECEPTIONIST],
            is_active=True,
        ).exists()
