from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles

class IsAuthenticated(BasePermission):
    message = _('Authentication required')
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

class IsAdminOrReadOnly(BasePermission):
    message = _('Admin privileges required for write operations')
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]

class IsOwnerOrReadOnly(BasePermission):
    message = _('You must be the owner to modify this resource')
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        owner_id = getattr(obj, 'employee_id', None) or getattr(obj, 'user_id', None) or getattr(obj, 'created_by_id', None)
        return owner_id and str(owner_id) == str(request.user.id)

class IsTenantUser(BasePermission):
    message = _('You must be in the same tenant')
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        tenant_id = getattr(request, 'tenant_id', None) or getattr(request.user, 'tenant_id', None)
        return tenant_id == request.user.tenant_id
    def has_object_permission(self, request, view, obj):
        obj_tenant_id = getattr(obj, 'tenant_id', None)
        return obj_tenant_id == request.user.tenant_id

class IsAdminOrManager(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.MANAGER]

class IsAdminOnly(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]