from rest_framework import permissions
from rest_framework.permissions import BasePermission, SAFE_METHODS
from apps.accounts.constants import UserRoles
from apps.accounts.api.v1.permissions import (
    IsAdminOrSupervisor, IsAdminOrExecutive, IsSuperAdmin, IsTenantMember, IsManagement, IsSupervisor, IsDashboardChampion,
    IsExecutive, IsClientAdmin, CanViewKPIDashboard, CanValidateKPIs, CanManageTeam, CanExportReports
)

class IsSuperAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_superuser


class IsAuthenticatedAndActive(BasePermission):
    def has_permission(self, request, view):
        return (request.user and 
                request.user.is_authenticated and 
                request.user.is_active)


class IsOwnerOrSupervisorOrReadOnly(BasePermission):
    """
    Object-level permission to allow owners and supervisors to edit.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        
        # User is the owner
        if hasattr(obj, 'user_id') and obj.user_id == request.user.id:
            return True
        if hasattr(obj, 'owner_id') and obj.owner_id == request.user.id:
            return True
        
        # User is supervisor of the owner
        user_id = getattr(obj, 'user_id', None) or getattr(obj, 'owner_id', None)
        if user_id:
            # Check if request.user is in the management chain of the user
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                target_user = User.objects.get(id=user_id)
                management_chain = target_user.get_management_chain()
                return request.user in management_chain
            except User.DoesNotExist:
                return False

        return False


class IsDashboardChampion(BasePermission):
    """
    Permission for Dashboard Champion role.
    """
    def has_permission(self, request, view):
        return (request.user and
                request.user.is_authenticated and
                request.user.role == UserRoles.DASHBOARD_CHAMPION)


class IsExecutive(BasePermission):
    """
    Permission for executive/C-level access.
    """
    def has_permission(self, request, view):
        return (request.user and
                request.user.is_authenticated and
                (request.user.is_superuser or
                 request.user.role == UserRoles.EXECUTIVE))
    
    def has_object_permission(self, request, view, obj):
        # Super admin can validate anything
        if request.user.is_superuser:
            return True

        # Check if the user to validate is a direct report
        user_id = getattr(obj, 'user_id', None)
        if user_id:
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                target_user = User.objects.get(id=user_id)
                return request.user.is_manager_of(target_user)
            except User.DoesNotExist:
                return False

        return False


class IsManager(BasePermission):
    """
    Permission for manager-level access (users who have direct reports).
    """
    def has_permission(self, request, view):
        return (request.user and
                request.user.is_authenticated and
                request.user.get_direct_reports().exists())


class CanCascadeTargets(BasePermission):
    """
    Permission to cascade targets (Dashboard Champion or Admin).
    """
    def has_permission(self, request, view):
        return (request.user and 
                request.user.is_authenticated and 
                (request.user.is_superuser or 
                 request.user.role == UserRoles.DASHBOARD_CHAMPION or 
                 request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]))
        
        if request.user.is_superuser:
            return True
        
        # Check if user is a manager (has direct reports)
        has_reports = request.user.get_direct_reports().exists()
        
        return has_reports or request.user.role == UserRoles.EXECUTIVE


class IsOwnerOrReadOnly(BasePermission):
    """
    Object-level permission to allow owners to edit.
    """
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
    """
    Permission to create/update KPIs (must be Dashboard Champion or Admin).
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        
        return (request.user and
                request.user.is_authenticated and
                (request.user.is_superuser or
                 request.user.role == UserRoles.DASHBOARD_CHAMPION or
                 request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]))


class CanViewOwnDataOnly(BasePermission):
    """
    Users can only view their own data (for sensitive endpoints).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super admin can view everything
        if request.user.is_superuser:
            return True
        
        # Check if the user is requesting their own data
        user_id = request.query_params.get('user_id')
        if user_id:
            return user_id == str(request.user.id)
        
        return True
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        
        user_id = getattr(obj, 'user_id', None)
        if user_id:
            return user_id == request.user.id
        
        return True


class IsTenantMember(BasePermission):
    """
    User must belong to the tenant they're trying to access.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        tenant_id = getattr(request, 'tenant_id', None)
        if tenant_id:
            return str(request.user.tenant_id) == str(tenant_id)
        
        return True
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        obj_tenant_id = getattr(obj, 'tenant_id', None)
        if obj_tenant_id:
            return str(request.user.tenant_id) == str(obj_tenant_id)
        
        return True


class CanViewAuditLogs(BasePermission):
    """
    Permission to view audit logs (admin only).
    """
    def has_permission(self, request, view):
        return (request.user and
                request.user.is_authenticated and
                (request.user.is_superuser or
                 request.user.role == UserRoles.SUPER_ADMIN or
                 request.user.role == UserRoles.CLIENT_ADMIN))