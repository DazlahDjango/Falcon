from rest_framework.permissions import BasePermission

class CanExecuteDR(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, 'role', None) == 'super_admin'
    def has_object_permission(self, request, view, obj):
        return getattr(request.user, 'role', None) == 'super_admin'

class CanRunDRDrill(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, 'role', None) == 'super_admin'
    def has_object_permission(self, request, view, obj):
        return getattr(request.user, 'role', None) == 'super_admin'

class CanFailover(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, 'role', None) == 'super_admin'
    def has_object_permission(self, request, view, obj):
        return getattr(request.user, 'role', None) == 'super_admin'

class CanFailback(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, 'role', None) == 'super_admin'
    def has_object_permission(self, request, view, obj):
        return getattr(request.user, 'role', None) == 'super_admin'