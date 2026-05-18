from rest_framework.permissions import BasePermission, SAFE_METHODS

class CanViewQuota(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user, 'role', None)
        return role in ['super_admin', 'client_admin']
    def has_object_permission(self, request, view, obj):
        role = getattr(request.user, 'role', None)
        if role == 'super_admin':
            return True
        if role == 'client_admin':
            if hasattr(obj, 'tenant_id') and hasattr(request.user, 'tenant_id'):
                return str(obj.tenant_id) == str(request.user.tenant_id)
            return True
        return False

class CanModifyQuota(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, 'role', None) == 'super_admin'
    def has_object_permission(self, request, view, obj):
        return getattr(request.user, 'role', None) == 'super_admin'