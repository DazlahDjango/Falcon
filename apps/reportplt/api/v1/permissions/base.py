# apps/reportplt/api/v1/permissions/base.py
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
            request.method in SAFE_METHODS or
            (request.user and request.user.is_authenticated)
        )
    
    def has_object_permission(self, request, view, obj):
        return bool(
            request.method in SAFE_METHODS or
            (request.user and request.user.is_authenticated)
        )

class IsOwner(BasePermission):
    message = _("You must be the owner to perform this action")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        owner_attr = getattr(obj, 'owner_id', None)
        if owner_attr:
            return str(owner_attr) == str(request.user.id)
        user_attr = getattr(obj, 'user_id', None)
        if user_attr:
            return str(user_attr) == str(request.user.id)
        created_by = getattr(obj, 'created_by_id', None)
        if created_by:
            return str(created_by) == str(request.user.id)
        return False

class IsOwnerOrReadOnly(BasePermission):
    message = _("Only the owner can modify this resource")
    
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        owner_attr = getattr(obj, 'owner_id', None)
        if owner_attr:
            return str(owner_attr) == str(request.user.id)
        return False

class IsAdminUser(BasePermission):
    message = _("Admin privileges required")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_staff or request.user.is_superuser

class IsAdminOrReadOnly(BasePermission):
    message = _("Admin privileges required for write operations")
    
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_staff or request.user.is_superuser
    
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_staff or request.user.is_superuser