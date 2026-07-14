# apps/kpi/api/v1/permissions.py

from rest_framework import permissions
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAuthenticatedAndActive(BasePermission):
    def has_permission(self, request, view):
        return (request.user and 
                request.user.is_authenticated and 
                request.user.is_active)


class IsManager(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Grant access to superusers, administrators, and executives
        role = getattr(request.user, 'role', '')
        if (request.user.is_superuser or 
            role.lower() in ['super_admin', 'client_admin', 'executive', 'ceo', 'director', 'dashboard_champion'] or
            role.upper() in ['SUPER_ADMIN', 'CLIENT_ADMIN', 'EXECUTIVE', 'CEO', 'DIRECTOR', 'DASHBOARD_CHAMPION']):
            return True
            
        return request.user.get_direct_reports().exists()


class IsExecutive(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user, 'role', '')
        return (request.user.is_superuser or 
                role.lower() in ['executive', 'ceo', 'director'] or
                role.upper() in ['EXECUTIVE', 'CEO', 'DIRECTOR'])


class IsDashboardChampion(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user, 'role', '')
        return (request.user.is_superuser or 
                role.lower() in ['dashboard_champion', 'super_admin', 'client_admin'] or
                role.upper() in ['DASHBOARD_CHAMPION', 'SUPER_ADMIN', 'CLIENT_ADMIN'])


class CanCascadeTargets(BasePermission):
    """Permission to cascade targets (Dashboard Champion or Admin)."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        role = getattr(request.user, 'role', '')
        if (role.lower() in ['dashboard_champion', 'super_admin', 'client_admin'] or
            role.upper() in ['DASHBOARD_CHAMPION', 'SUPER_ADMIN', 'CLIENT_ADMIN']):
            return True
        
        return request.user.get_direct_reports().exists()


class CanViewAuditLogs(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user, 'role', '')
        return (request.user.is_superuser or 
                role in ['super_admin', 'client_admin', 'auditor'])


class CanViewKPIAdminOverview(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user, 'role', '')
        return (request.user.is_superuser or 
                role in ['super_admin', 'client_admin', 'executive'])


class IsTenantMember(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        tenant_id = getattr(request, 'tenant_id', None) or getattr(request, 'tenant', None)
        if tenant_id:
            if hasattr(tenant_id, 'id'):
                tenant_id = tenant_id.id
            return str(request.user.tenant_id) == str(tenant_id)
        
        return True


class IsFrameworkAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        role = getattr(request.user, 'role', '')
        return role in ['super_admin', 'client_admin']
    
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'tenant_id') and str(obj.tenant_id) != str(request.user.tenant_id):
            return False
        
        if request.method in SAFE_METHODS:
            return True
        
        role = getattr(request.user, 'role', '')
        return role in ['super_admin', 'client_admin']


class CanManageFramework(IsFrameworkAdmin):
    pass


class CanManageCategory(IsFrameworkAdmin):
    pass


class CanPublishFramework(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        role = getattr(request.user, 'role', '')
        return role in ['super_admin', 'client_admin']


class CanArchiveFramework(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        role = getattr(request.user, 'role', '')
        return role in ['super_admin', 'client_admin']


class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        
        user_id = getattr(obj, 'user_id', None)
        if user_id:
            return user_id == request.user.id
        
        owner_id = getattr(obj, 'owner_id', None)
        if owner_id:
            return owner_id == request.user.id
        
        created_by = getattr(obj, 'created_by_id', None)
        if created_by:
            return created_by == request.user.id
        
        return False


class HasKPIWritePermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        role = getattr(request.user, 'role', '').lower()
        return role in ['executive', 'ceo', 'director', 'super_admin', 'client_admin']


class CanUseTemplate(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_active