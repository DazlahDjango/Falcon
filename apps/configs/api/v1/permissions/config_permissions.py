from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == 'super_admin'
    def has_object_permission(self, request, view, obj):
        return request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == 'super_admin'

class IsClientAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == 'client_admin'
    def has_object_permission(self, request, view, obj):
        return request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == 'client_admin'

class IsConfigAccess(BasePermission):
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
            if hasattr(obj, 'created_by'):
                return str(obj.created_by) == str(request.user.id)
            if hasattr(obj, 'tenant_id') and hasattr(request.user, 'tenant_id'):
                return str(obj.tenant_id) == str(request.user.tenant_id)
            return True
        return False

class IsSuperAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated and getattr(request.user, 'role', None) in ['super_admin', 'client_admin']
        return request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == 'super_admin'
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == 'super_admin'

class IsClientAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated and getattr(request.user, 'role', None) in ['super_admin', 'client_admin']
        return request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == 'client_admin'
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if getattr(request.user, 'role', None) == 'super_admin':
            return True
        if hasattr(obj, 'created_by'):
            return str(obj.created_by) == str(request.user.id)
        return False