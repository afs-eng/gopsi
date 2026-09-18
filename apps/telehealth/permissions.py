from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.accounts.models import UserRole, has_explicit_platform_role
from apps.appointments.selectors import appointments_visible_to_user


class CanManageTelehealth(BasePermission):
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

        appointment_id = request.data.get("appointment") or request.query_params.get(
            "appointment"
        )
        if appointment_id:
            return appointments_visible_to_user(user).filter(id=appointment_id).exists()

        clinic_id = request.data.get("clinic") or request.query_params.get("clinic")
        return (
            user.clinic_memberships.filter(
                clinic_id=clinic_id,
                role__in=[UserRole.CLINIC_ADMIN, UserRole.RECEPTIONIST],
                is_active=True,
            ).exists()
            or user.professional_profiles.filter(
                clinic_id=clinic_id,
                is_active=True,
            ).exists()
        )

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user

        if not user.is_authenticated:
            return False

        if has_explicit_platform_role(user):
            return False

        clinic = getattr(obj, "clinic", None) or getattr(obj.session, "clinic", None)

        return (
            user.clinic_memberships.filter(
                clinic=clinic,
                role__in=[UserRole.CLINIC_ADMIN, UserRole.RECEPTIONIST],
                is_active=True,
            ).exists()
            or user.professional_profiles.filter(
                clinic=clinic,
                is_active=True,
            ).exists()
        )
