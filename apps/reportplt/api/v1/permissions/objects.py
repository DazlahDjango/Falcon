# apps/reportplt/api/v1/permissions/objects.py
from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles

class ObjectPermission(BasePermission):
    message = _("You do not have permission to access this object")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        return True

class ObjectOwnerPermission(BasePermission):
    message = _("You must be the owner of this object")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        owner_attr = getattr(obj, 'owner_id', None)
        if owner_attr:
            return str(owner_attr) == str(request.user.id)
        user_attr = getattr(obj, 'user_id', None)
        if user_attr:
            return str(user_attr) == str(request.user.id)
        created_by = getattr(obj, 'created_by_id', None)
        if created_by:
            return str(created_by) == str(request.user.id)
        return False

class ObjectTenantPermission(BasePermission):
    message = _("This object does not belong to your tenant")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN]:
            return True
        if hasattr(obj, 'tenant_id') and obj.tenant_id:
            return str(obj.tenant_id) == str(request.user.tenant_id)
        return True

class ObjectRolePermission(BasePermission):
    message = _("You do not have the required role")
    
    def __init__(self, required_roles=None):
        self.required_roles = required_roles or []
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if self.required_roles and request.user.role in self.required_roles:
            return True
        return False
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)

class ObjectHierarchyPermission(BasePermission):
    message = _("You do not have permission to access this object in the hierarchy")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
            return True
        if hasattr(obj, 'owner_id') and obj.owner_id:
            if str(obj.owner_id) == str(request.user.id):
                return True
        if hasattr(request.user, 'get_team_ids') and hasattr(obj, 'owner_id'):
            team_ids = request.user.get_team_ids()
            if str(obj.owner_id) in [str(tid) for tid in team_ids]:
                return True
        if hasattr(obj, 'department') and hasattr(request.user, 'department'):
            if obj.department == request.user.department:
                return True
        return False

class ObjectManagerPermission(BasePermission):
    message = _("You must be a manager to access this object")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
            return True
        if hasattr(request.user, 'is_manager') and request.user.is_manager:
            return True
        if hasattr(obj, 'owner_id') and obj.owner_id:
            if str(obj.owner_id) == str(request.user.id):
                return True
        return False

class ObjectM2MPermission(BasePermission):
    message = _("You do not have permission to modify this relationship")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        return True
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if hasattr(obj, 'owner_id') and obj.owner_id:
            return str(obj.owner_id) == str(request.user.id)
        return False