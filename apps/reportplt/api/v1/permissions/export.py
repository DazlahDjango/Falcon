# apps/reportplt/api/v1/permissions/export.py
from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles

class ExportPermission(BasePermission):
    message = _("You do not have permission to access this export")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        return True
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
            return True
        if obj.exported_by_id == request.user.id:
            return True
        if request.method in SAFE_METHODS:
            return True
        return False

class ExportViewPermission(ExportPermission):
    message = _("You do not have permission to view this export")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
            return True
        if obj.exported_by_id == request.user.id:
            return True
        return False

class ExportCreatePermission(BasePermission):
    message = _("You do not have permission to create exports")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
            return True
        if request.user.role in [UserRoles.DASHBOARD_CHAMPION, UserRoles.SUPERVISOR]:
            return True
        return False

class ExportDownloadPermission(ExportPermission):
    message = _("You do not have permission to download this export")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if obj.exported_by_id == request.user.id:
            return True
        return False

class ExportDeletePermission(ExportPermission):
    message = _("You do not have permission to delete this export")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if obj.exported_by_id == request.user.id:
            return True
        return False