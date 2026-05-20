# apps/dashboard/api/v1/permissions.py
from rest_framework.permissions import BasePermission
from django.core.exceptions import PermissionDenied

class DashboardBasePermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        tenant_id = getattr(request.user, 'tenant_id', None)
        if not tenant_id:
            return False
        return True
    
    def has_object_permission(self, request, view, obj):
        tenant_id = getattr(request.user, 'tenant_id', None)
        if hasattr(obj, 'tenant_id') and str(obj.tenant_id) != str(tenant_id):
            return False
        return True


class ExecutiveDashboardPermission(DashboardBasePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        allowed_roles = ['executive', 'client_admin', 'super_admin']
        if request.user.role not in allowed_roles:
            raise PermissionDenied(f"Role {request.user.role} cannot access Executive Dashboard")
        if request.user.role == 'executive':
            return True
        if request.user.role == 'client_admin':
            target_user_id = request.query_params.get('user_id') or request.data.get('user_id')
            if target_user_id and str(target_user_id) != str(request.user.id):
                raise PermissionDenied("Client Admin can only view their own executive view")
        return True
    
    def has_object_permission(self, request, view, obj):
        if not super().has_object_permission(request, view, obj):
            return False
        if hasattr(obj, 'user_id') and request.user.role == 'executive':
            return str(obj.user_id) == str(request.user.id)
        return True

class ClientAdminDashboardPermission(DashboardBasePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        allowed_roles = ['client_admin', 'super_admin']
        if request.user.role not in allowed_roles:
            raise PermissionDenied(f"Role {request.user.role} cannot access Client Admin Dashboard")
        return True
    
    def has_object_permission(self, request, view, obj):
        if not super().has_object_permission(request, view, obj):
            return False
        return True


class SuperAdminDashboardPermission(DashboardBasePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        if request.user.role != 'super_admin':
            raise PermissionDenied("Only Super Admin can access this dashboard")
        return True
    
    def has_object_permission(self, request, view, obj):
        if request.user.role != 'super_admin':
            return False
        return True

class DashboardExportPermission(DashboardBasePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        dashboard_type = view.kwargs.get('dashboard_type', '')
        allowed_for_role = {
            'executive': ['executive', 'client_admin', 'super_admin'],
            'client_admin': ['client_admin', 'super_admin'],
            'super_admin': ['super_admin']
        }
        allowed = allowed_for_role.get(dashboard_type, [])
        if request.user.role not in allowed:
            raise PermissionDenied(f"Cannot export {dashboard_type} dashboard")
        return True

class DashboardAlertPermission(DashboardBasePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return True
    
    def has_object_permission(self, request, view, obj):
        if not super().has_object_permission(request, view, obj):
            return False
        if hasattr(obj, 'user_id') and str(obj.user_id) != str(request.user.id):
            if request.user.role not in ['client_admin', 'super_admin']:
                return False
        return True

class DashboardConfigPermission(DashboardBasePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False        
        return True
    
    def has_object_permission(self, request, view, obj):
        if not super().has_object_permission(request, view, obj):
            return False
        if hasattr(obj, 'user_id') and str(obj.user_id) != str(request.user.id):
            if request.user.role not in ['client_admin', 'super_admin']:
                return False
        return True