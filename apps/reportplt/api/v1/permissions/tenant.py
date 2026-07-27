# apps/reportplt/api/v1/permissions/tenant.py
from rest_framework.permissions import BasePermission
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles
from apps.tenant.context import get_current_tenant_id

class TenantIsolationPermission(BasePermission):
    message = _("Tenant isolation violation")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN]:
            return True
        return True
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN]:
            return True
        if request.user.role in [UserRoles.CLIENT_ADMIN]:
            return True
        tenant_id = get_current_tenant_id()
        if not tenant_id and request.user.tenant_id:
            tenant_id = str(request.user.tenant_id)
        if hasattr(obj, 'tenant_id') and obj.tenant_id:
            return str(obj.tenant_id) == str(tenant_id)
        return True

class TenantAccessPermission(BasePermission):
    message = _("You do not have access to this tenant's resources")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN]:
            return True
        tenant_id = get_current_tenant_id()
        if tenant_id and request.user.tenant_id:
            return str(tenant_id) == str(request.user.tenant_id)
        return True

class TenantAdminPermission(BasePermission):
    message = _("Tenant admin privileges required")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        return False

class TenantResourcePermission(BasePermission):
    message = _("You do not have permission to access this tenant resource")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN]:
            return True
        tenant_id = get_current_tenant_id()
        if tenant_id and request.user.tenant_id:
            return str(tenant_id) == str(request.user.tenant_id)
        return False
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if hasattr(obj, 'tenant_id') and obj.tenant_id:
            return str(obj.tenant_id) == str(request.user.tenant_id)
        return True