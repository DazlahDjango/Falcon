from rest_framework.permissions import BasePermission
from django.utils.translation import gettext_lazy as _ 
from apps.accounts.constants import UserRoles

class IsTenantMember(BasePermission):
    message = _("You do not belong to this tenant")
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        tenant_id = view.kwargs.get('tenant_id')
        if tenant_id:
            return str(request.user.tenant_id) == str(tenant_id)
        return True
    
    def has_object_permission(self, request, view, obj):
        if not request.user or request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        if hasattr(obj, 'tenant_id'):
            return str(request.user.tenant_id) == str(obj.tenant_id)
        return True
    
class IsTenantAdmin(BasePermission):
    message = _('Tenant admin privileges required')
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        if request.user.role == UserRoles.CLIENT_ADMIN:
            return True
        return False
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)
    
class IsSameTenant(BasePermission):
    message = _("Tenant mismatch")
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        tenant_id = view.kwargs.get('tenant_id')
        if tenant_id:
            return str(request.user.tenant_id) == str(tenant_id)
        return True
    
class CanAccessTenantData(BasePermission):
    message = _("You do not have access to this tenant's data")
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        tenant_id = view.kwargs.get('tenant_id')
        if not tenant_id:
            return True
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        return str(request.user.tenant_id) == str(tenant_id)
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        if hasattr(obj, 'tenant_id'):
            return str(request.user.tenant_id) == str(obj.tenant_id)
        return True