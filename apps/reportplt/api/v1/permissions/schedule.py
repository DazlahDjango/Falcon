# apps/reportplt/api/v1/permissions/schedule.py
from rest_framework.permissions import BasePermission
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles

class SchedulePermission(BasePermission):
    message = _("You do not have permission to access this schedule")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        return True
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False

class ScheduleViewPermission(SchedulePermission):
    message = _("You do not have permission to view this schedule")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN, UserRoles.EXECUTIVE]:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False

class ScheduleCreatePermission(BasePermission):
    message = _("You do not have permission to create schedules")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]:
            return True
        if request.user.role in [UserRoles.EXECUTIVE, UserRoles.SUPERVISOR]:
            return True
        return False

class ScheduleEditPermission(SchedulePermission):
    message = _("You do not have permission to edit this schedule")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False

class ScheduleDeletePermission(SchedulePermission):
    message = _("You do not have permission to delete this schedule")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False

class SchedulePausePermission(SchedulePermission):
    message = _("You do not have permission to pause this schedule")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False

class ScheduleResumePermission(SchedulePermission):
    message = _("You do not have permission to resume this schedule")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]:
            return True
        if obj.owner_id == request.user.id:
            return True
        return False