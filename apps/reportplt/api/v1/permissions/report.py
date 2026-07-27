# apps/reportplt/api/v1/permissions/report.py
from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles

class ReportPermission(BasePermission):
    message = _("You do not have permission to access this report")
    
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
        if obj.owner_id == request.user.id:
            return True
        if obj.is_public:
            return True
        if request.user.role in obj.allowed_roles:
            return True
        if request.user.department and request.user.department in obj.allowed_departments:
            return True
        if request.method in SAFE_METHODS and getattr(obj, 'is_shared', False):
            return True
        return False

class ReportViewPermission(ReportPermission):
    message = _("You do not have permission to view this report")
    
    def has_permission(self, request, view):
        return super().has_permission(request, view)
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
            return True
        if obj.owner_id == request.user.id:
            return True
        if obj.is_public:
            return True
        if request.user.role in obj.allowed_roles:
            return True
        if request.user.department and request.user.department in obj.allowed_departments:
            return True
        return False

class ReportCreatePermission(BasePermission):
    message = _("You do not have permission to create reports")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.DASHBOARD_CHAMPION]:
            return True
        if request.user.role in [UserRoles.EXECUTIVE, UserRoles.SUPERVISOR]:
            return True
        return False

class ReportEditPermission(ReportPermission):
    message = _("You do not have permission to edit this report")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False

class ReportDeletePermission(ReportPermission):
    message = _("You do not have permission to delete this report")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False

class ReportExportPermission(ReportPermission):
    message = _("You do not have permission to export this report")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
            return True
        if obj.owner_id == request.user.id:
            return True
        if request.user.role in obj.allowed_roles:
            return True
        return False

class ReportSchedulePermission(ReportPermission):
    message = _("You do not have permission to schedule this report")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.DASHBOARD_CHAMPION]:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False

class ReportGeneratePermission(ReportPermission):
    message = _("You do not have permission to generate this report")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
            return True
        if obj.owner_id == request.user.id:
            return True
        if request.user.role in obj.allowed_roles:
            return True
        return False
