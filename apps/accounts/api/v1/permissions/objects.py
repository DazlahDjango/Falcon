from rest_framework.permissions import BasePermission
from django.utils.translation import gettext_lazy as _ 
from apps.accounts.constants import UserRoles

class IsOwner(BasePermission):
    message = _("You do not own this object")
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        if hasattr(obj, 'user'):
            return obj.user.id == request.user.id 
        if hasattr(obj, 'owner'):
            return obj.owner.id == request.user.id 
        return False

class IsManagerOf(BasePermission):
    message = _("You are not the manager of this user")
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        if request.user.role == UserRoles.CLIENT_ADMIN:
            return True
        if hasattr(obj, 'manager') and obj.manager:
            return obj.manager.id == request.user.id
        return False
    
class CanAccessUser(BasePermission):
    message = _("You do not have permissions to access this user")
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        target_user = obj if hasattr(obj, 'email') else getattr(obj, 'user', obj)
        if request.user.role == UserRoles.CLIENT_ADMIN:
            return str(request.user.tenant_id) == str(target_user.tenant_id)
        if request.user.role == UserRoles.CLIENT_ADMIN:
            return str(request.user.tenant_id) == str(target_user.tenant_id)
        if request.user.role == UserRoles.EXECUTIVE:
            return str(request.user.tenant_id) == str(target_user.tenant_id)
        if request.user.role == UserRoles.SUPERVISOR:
            return target_user.id in request.user.get_team_ids()
        if request.user.role == UserRoles.STAFF:
            return target_user.id == request.user.id
        if request.user.role == UserRoles.READ_ONLY:
            return True
        return False

class CanAccessProfile(BasePermission):
    message = _("You do not have permission to access this profile")
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        return CanAccessUser().has_object_permission(request, view, obj.user)
    
class CanManageUser(BasePermission):
    message = _('You do not have permission to manage this user.')
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in ['POST']:
            return request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]
        return True
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        target_user = obj if hasattr(obj, 'email') else getattr(obj, 'user', obj)
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        if request.user.role == UserRoles.CLIENT_ADMIN:
            return str(request.user.tenant_id) == str(target_user.tenant_id)
        if request.user.role == UserRoles.EXECUTIVE:
            if target_user.role in [UserRoles.EXECUTIVE, UserRoles.SUPERVISOR, UserRoles.STAFF, UserRoles.READ_ONLY]:
                return True
        if request.user.role == UserRoles.SUPERVISOR:
            if target_user.role in [UserRoles.STAFF, UserRoles.READ_ONLY]:
                return target_user.id in request.user.get_team_ids()
        return False

class CanAssignRole(BasePermission):
    message = _('You do not have permission to assign this role.')
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = request.data.get('role')
        if not role:
            return True
        return self._can_assign_role(request.user, role)
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        role = request.data.get('role')
        if not role:
            return True
        return self._can_assign_role(request.user, role)
    
    def _can_assign_role(self, user, target_role):
        if user.role == UserRoles.SUPER_ADMIN:
            return True
        if user.role == UserRoles.CLIENT_ADMIN:
            return target_role != UserRoles.SUPER_ADMIN
        if user.role == UserRoles.EXECUTIVE:
            return target_role in [UserRoles.EXECUTIVE, UserRoles.SUPERVISOR, UserRoles.STAFF, UserRoles.READ_ONLY]
        if user.role == UserRoles.SUPERVISOR:
            return target_role in [UserRoles.STAFF, UserRoles.READ_ONLY]
        return False
