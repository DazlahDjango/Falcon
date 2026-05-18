from rest_framework.permissions import BasePermission

class CanCreateMaintenance(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user, 'role', None)
        maintenance_type = request.data.get('maintenance_type', 'partial')
        if maintenance_type == 'full':
            return role == 'super_admin'
        return role in ['super_admin', 'client_admin']

class CanStartMaintenance(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, 'role', None) in ['super_admin', 'client_admin']
    def has_object_permission(self, request, view, obj):
        role = getattr(request.user, 'role', None)
        if role == 'super_admin':
            return True
        if role == 'client_admin' and obj.maintenance_type != 'full':
            return True
        return False

class CanStopMaintenance(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, 'role', None) in ['super_admin', 'client_admin']
    def has_object_permission(self, request, view, obj):
        role = getattr(request.user, 'role', None)
        if role == 'super_admin':
            return True
        if role == 'client_admin' and obj.maintenance_type != 'full':
            return str(obj.triggered_by) == str(request.user.id)
        return False

class CanCancelMaintenance(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, 'role', None) in ['super_admin', 'client_admin']
    def has_object_permission(self, request, view, obj):
        role = getattr(request.user, 'role', None)
        if role == 'super_admin':
            return True
        if role == 'client_admin' and obj.maintenance_type != 'full':
            return str(obj.triggered_by) == str(request.user.id)
        return False