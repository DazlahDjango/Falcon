# apps/reportplt/api/v1/permissions/dashboard.py
from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles

class DashboardPermission(BasePermission):
    message = _("You do not have permission to access this dashboard")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]:
            return True
        return True
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if obj.owner_id == request.user.id:
            return True
        if obj.is_shared:
            if request.user.role in obj.allowed_roles:
                return True
            if str(request.user.id) in obj.allowed_users:
                return True
            if request.user.department and request.user.department in obj.allowed_departments:
                return True
        if request.method in SAFE_METHODS and obj.is_shared:
            return True
        return False

class DashboardViewPermission(DashboardPermission):
    message = _("You do not have permission to view this dashboard")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN, UserRoles.EXECUTIVE]:
            return True
        if obj.owner_id == request.user.id:
            return True
        if obj.is_shared:
            if request.user.role in obj.allowed_roles:
                return True
            if str(request.user.id) in obj.allowed_users:
                return True
            if request.user.department and request.user.department in obj.allowed_departments:
                return True
        return False

class DashboardEditPermission(DashboardPermission):
    message = _("You do not have permission to edit this dashboard")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False

class DashboardDeletePermission(DashboardPermission):
    message = _("You do not have permission to delete this dashboard")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False

class DashboardSharePermission(DashboardPermission):
    message = _("You do not have permission to share this dashboard")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False

class DashboardPublishPermission(DashboardPermission):
    message = _("You do not have permission to publish this dashboard")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False