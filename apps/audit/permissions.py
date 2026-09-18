from rest_framework.permissions import BasePermission

from apps.accounts.models import has_explicit_platform_role


class CanViewClinicalAudit(BasePermission):
    def has_permission(self, request, view) -> bool:
        user = request.user
        return user.is_authenticated and not has_explicit_platform_role(user)
