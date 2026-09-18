from rest_framework.permissions import BasePermission

from apps.accounts.models import is_platform_operator


class IsPlatformOperator(BasePermission):
    def has_permission(self, request, view) -> bool:
        return is_platform_operator(request.user)
