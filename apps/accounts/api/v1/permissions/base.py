from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.utils.translation import gettext_lazy as _

class BasePermission(BasePermission):
    message = _("You do not have permissions to perform this action")
    code = 'permission_denied'
    def get_message(self, request, view, obj=None):
        return self.message
    def has_permission(self, request, view):
        return True
    def has_object_permission(self, request, view, obj):
        return True
    
class AllowAny(BasePermission):
    def has_permission(self, request, view):
        return True
    def has_object_permission(self, request, view, obj):
        return True
    
class IsAuthenticated(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
    def has_object_permission(self, request, view, obj):
        return bool(request.user and request.user.is_authenticated)
    
class IsAuthenticatedOrReadOnly(BasePermission):
    message = _("Authentication required for write operations")
    def has_permission(self, request, view):
        return bool(
            request.method in SAFE_METHODS or (request.user and request.user.is_authenticated)
        )
    def has_object_permission(self, request, view, obj):
        return bool(
            request.method in SAFE_METHODS or (request.user and request.user.is_authenticated)
        )

class IsPasswordChangeCompleted(BasePermission):
    message = _("Password change is required before accessing other resources.")
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return True
        if request.user.password_change_required:
            allowed_paths = [
                '/api/v1/auth/me/change-password/',
                '/api/v1/auth/logout/',
                '/api/v1/auth/refresh/',
                '/api/v1/auth/me/',
            ]
            path = request.path.rstrip('/') + '/'
            if any(path == p or path.startswith(p) for p in allowed_paths):
                return True
            return False
        return True