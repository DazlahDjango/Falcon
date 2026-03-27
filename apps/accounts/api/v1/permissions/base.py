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
        return bool(request.user, request.user.is_authenticated)
    def has_object_permission(self, request, view, obj):
        return bool(request.user, request.user.is_authenticated)
    
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