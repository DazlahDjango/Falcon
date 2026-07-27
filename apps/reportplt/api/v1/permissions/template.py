# apps/reportplt/api/v1/permissions/template.py
from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles

class TemplatePermission(BasePermission):
    message = _("You do not have permission to access this template")
    
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
        if obj.is_published:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False

class TemplateViewPermission(TemplatePermission):
    message = _("You do not have permission to view this template")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.DASHBOARD_CHAMPION]:
            return True
        if obj.is_published:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False

class TemplateCreatePermission(BasePermission):
    message = _("You do not have permission to create templates")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.DASHBOARD_CHAMPION]:
            return True
        if request.user.role in [UserRoles.EXECUTIVE, UserRoles.SUPERVISOR]:
            return True
        return False

class TemplateEditPermission(TemplatePermission):
    message = _("You do not have permission to edit this template")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if obj.is_system:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False

class TemplateDeletePermission(TemplatePermission):
    message = _("You do not have permission to delete this template")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if obj.is_system:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False

class TemplatePublishPermission(TemplatePermission):
    message = _("You do not have permission to publish this template")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.DASHBOARD_CHAMPION]:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False