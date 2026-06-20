from rest_framework.permissions import BasePermission as DRFBasePermission, SAFE_METHODS
from django.utils.translation import gettext_lazy as _


class BasePermission(DRFBasePermission):
    """Base permission class for billing."""
    message = _("You do not have permissions to perform this action")
    code = 'permission_denied'

    def get_message(self, request, view, obj=None):
        return self.message

    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        return True


class AllowAny(BasePermission):
    """Allow any access (public endpoints)."""

    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        return True


class IsAuthenticated(BasePermission):
    """Allow only authenticated users."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        return bool(request.user and request.user.is_authenticated)


class IsAuthenticatedOrReadOnly(BasePermission):
    """Allow read-only for unauthenticated, write requires auth."""
    message = _("Authentication required for write operations")

    def has_permission(self, request, view):
        return bool(
            request.method in SAFE_METHODS
            or (request.user and request.user.is_authenticated)
        )

    def has_object_permission(self, request, view, obj):
        return bool(
            request.method in SAFE_METHODS
            or (request.user and request.user.is_authenticated)
        )
