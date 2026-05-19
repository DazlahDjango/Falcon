from rest_framework.permissions import BasePermission

class CanTriggerBackup(BasePermission):
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
            if hasattr(obj, 'triggered_by'):
                return str(obj.triggered_by) == str(request.user.id)
            if hasattr(obj, 'app') and hasattr(obj.app, 'tenant_id'):
                return str(obj.app.tenant_id) == str(request.user.tenant_id)
            return True
        return False

class CanCancelBackup(BasePermission):
    def has_permission(self, request, view):
        role = getattr(request.user, 'role', None) if request.user and request.user.is_authenticated else None
        return role in ['super_admin', 'client_admin']
    def has_object_permission(self, request, view, obj):
        role = getattr(request.user, 'role', None)
        if role == 'super_admin':
            return True
        if role == 'client_admin':
            return str(obj.triggered_by) == str(request.user.id)
        return False

class CanRestoreBackup(BasePermission):
    def has_permission(self, request, view):
        role = getattr(request.user, 'role', None) if request.user and request.user.is_authenticated else None
        return role in ['super_admin', 'client_admin']
    def has_object_permission(self, request, view, obj):
        role = getattr(request.user, 'role', None)
        if role == 'super_admin':
            return True
        if role == 'client_admin':
            if hasattr(obj, 'app') and hasattr(obj.app, 'tenant_id'):
                return str(obj.app.tenant_id) == str(request.user.tenant_id)
            return True
        return False

class CanDeleteBackup(BasePermission):
    def has_permission(self, request, view):
        role = getattr(request.user, 'role', None) if request.user and request.user.is_authenticated else None
        return role == 'super_admin'
    def has_object_permission(self, request, view, obj):
        return getattr(request.user, 'role', None) == 'super_admin'