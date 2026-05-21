from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles


class IsSuperAdminOrReadOnly(BasePermission):
    """Super admin writes; super admin and client admin may read."""

    message = _('Super admin privileges required for this action.')

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return request.user.is_superuser or request.user.role in (
                UserRoles.SUPER_ADMIN,
                UserRoles.CLIENT_ADMIN,
            )
        return request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN


class IsSecurityConsoleAccess(BasePermission):
    """Client admin or super admin for tenant security console."""

    message = _('Security console access requires admin privileges.')

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser or request.user.role in (
            UserRoles.SUPER_ADMIN,
            UserRoles.CLIENT_ADMIN,
        )
