# apps/reportplt/api/v1/permissions/share.py
from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles

class SharePermission(BasePermission):
    message = _("You do not have permission to access this share")
    
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
        if obj.shared_by_id == request.user.id:
            return True
        if obj.shared_with_id == request.user.id:
            return True
        return False

class ShareViewPermission(SharePermission):
    message = _("You do not have permission to view this share")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
            return True
        if obj.shared_by_id == request.user.id:
            return True
        if obj.shared_with_id == request.user.id:
            return True
        return False

class ShareCreatePermission(BasePermission):
    message = _("You do not have permission to share reports")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if request.user.role in [UserRoles.EXECUTIVE, UserRoles.DASHBOARD_CHAMPION]:
            return True
        return False

class ShareDeletePermission(SharePermission):
    message = _("You do not have permission to delete this share")
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if obj.shared_by_id == request.user.id:
            return True
        return False

class ShareAccessPermission(BasePermission):
    message = _("You do not have access to this shared resource")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        if obj.shared_with_id == request.user.id and obj.is_active:
            return True
        if obj.share_type == 'public' and obj.is_active:
            return True
        return False