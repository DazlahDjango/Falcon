# apps/dashboard/api/v1/permissions.py

from rest_framework.permissions import BasePermission
from django.core.exceptions import PermissionDenied

# ===================== BASE PERMISSION =====================

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


# ===================== EXECUTIVE DASHBOARD PERMISSIONS =====================

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


# ===================== CLIENT ADMIN DASHBOARD PERMISSIONS =====================

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


# ===================== SUPER ADMIN DASHBOARD PERMISSIONS =====================

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


# ===================== EXPORT PERMISSIONS =====================

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


# ===================== ALERT & CONFIG PERMISSIONS =====================

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


# ===================== MANAGER DASHBOARD PERMISSIONS =====================

class ManagerDashboardPermission(DashboardBasePermission):
    """Permission for Manager Dashboard."""
    
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        
        allowed_roles = ['manager', 'supervisor', 'department_head', 'client_admin', 'super_admin']
        
        if request.user.role not in allowed_roles:
            raise PermissionDenied(f"Role {request.user.role} cannot access Manager Dashboard")
        
        # Check if user has direct reports (is actually a manager)
        if request.user.role in ['manager', 'supervisor', 'department_head']:
            from apps.accounts.models import User
            has_reports = User.objects.filter(
                manager_id=request.user.id,
                is_active=True
            ).exists()
            
            if not has_reports and request.user.role != 'client_admin' and request.user.role != 'super_admin':
                raise PermissionDenied("User has no direct reports. Use Staff Dashboard instead.")
        
        return True
    
    def has_object_permission(self, request, view, obj):
        if not super().has_object_permission(request, view, obj):
            return False
        
        if hasattr(obj, 'user_id') and request.user.role in ['manager', 'supervisor', 'department_head']:
            from apps.dashboard.services.hierarchy_service import HierarchyService
            hierarchy_service = HierarchyService(request.user, getattr(request.user, 'tenant_id', None))
            return hierarchy_service.is_direct_report(str(obj.user_id))
        
        return True


# ===================== STAFF DASHBOARD PERMISSIONS =====================

class StaffDashboardPermission(DashboardBasePermission):
    """Permission for Staff Dashboard."""
    
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        
        allowed_roles = ['staff', 'manager', 'supervisor', 'client_admin', 'super_admin']
        
        if request.user.role not in allowed_roles:
            raise PermissionDenied(f"Role {request.user.role} cannot access Staff Dashboard")
        
        return True
    
    def has_object_permission(self, request, view, obj):
        if not super().has_object_permission(request, view, obj):
            return False
        
        if request.user.role == 'staff':
            if hasattr(obj, 'user_id') and str(obj.user_id) != str(request.user.id):
                return False
            if hasattr(obj, 'owner_id') and str(obj.owner_id) != str(request.user.id):
                return False
        
        return True


# ===================== CHAMPION DASHBOARD PERMISSIONS =====================

class ChampionDashboardPermission(DashboardBasePermission):
    """Permission for Champion Dashboard."""
    
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        
        allowed_roles = ['dashboard_champion', 'client_admin', 'super_admin']
        
        if request.user.role not in allowed_roles:
            raise PermissionDenied(f"Role {request.user.role} cannot access Champion Dashboard")
        
        return True
    
    def has_object_permission(self, request, view, obj):
        if not super().has_object_permission(request, view, obj):
            return False
        
        return True


# ===================== READ-ONLY DASHBOARD PERMISSIONS =====================

class ReadOnlyDashboardPermission(DashboardBasePermission):
    """Permission for Read-Only Dashboard."""
    
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        
        allowed_roles = ['read_only', 'client_admin', 'super_admin', 'executive']
        
        if request.user.role not in allowed_roles:
            raise PermissionDenied(f"Role {request.user.role} cannot access Read-Only Dashboard")
        
        return True
    
    def has_object_permission(self, request, view, obj):
        if not super().has_object_permission(request, view, obj):
            return False
        
        # Read-only users cannot modify
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return False
        
        return True


# ===================== SUBMISSION & APPROVAL PERMISSIONS =====================

class KpiSubmissionPermission(DashboardBasePermission):
    """Permission for KPI data submission."""
    
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        
        allowed_roles = ['staff', 'manager', 'supervisor']
        
        if request.user.role not in allowed_roles:
            raise PermissionDenied(f"Role {request.user.role} cannot submit KPI data")
        
        return True
    
    def has_object_permission(self, request, view, obj):
        if not super().has_object_permission(request, view, obj):
            return False
        
        if hasattr(obj, 'owner_id') and str(obj.owner_id) != str(request.user.id):
            return False
        
        return True


class ApprovalPermission(DashboardBasePermission):
    """Permission for approving/rejecting submissions."""
    
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        
        allowed_roles = ['manager', 'supervisor', 'department_head', 'client_admin', 'super_admin']
        
        if request.user.role not in allowed_roles:
            raise PermissionDenied(f"Role {request.user.role} cannot approve submissions")
        
        return True
    
    def has_object_permission(self, request, view, obj):
        if not super().has_object_permission(request, view, obj):
            return False
        
        if request.user.role in ['manager', 'supervisor', 'department_head']:
            from apps.dashboard.services.hierarchy_service import HierarchyService
            hierarchy_service = HierarchyService(request.user, getattr(request.user, 'tenant_id', None))
            
            if hasattr(obj, 'user_id'):
                return hierarchy_service.is_direct_report(str(obj.user_id))
            if hasattr(obj, 'kpi') and hasattr(obj.kpi, 'owner_id'):
                return hierarchy_service.is_direct_report(str(obj.kpi.owner_id))
        
        return True