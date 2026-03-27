from rest_framework.permissions import BasePermission
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles

class HasPermission(BasePermission):
    message = _('You do not have the required permission.')
    def __init__(self, permission_codename):
        self.permission_codename = permission_codename
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        from apps.accounts.services.authorization.permissions import PermissionService
        perm_service = PermissionService()
        return perm_service.check_permission(request.user, self.permission_codename)
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class HasObjectPermission(BasePermission):
    message = _('You do not have permission for this object.')
    def __init__(self, permission_codename):
        self.permission_codename = permission_codename
    
    def has_permission(self, request, view):
        return True
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        from apps.accounts.services.authorization.permissions import PermissionService
        perm_service = PermissionService()
        return perm_service.check_permission(request.user, self.permission_codename, obj)

class CanViewKPIDashboard(HasPermission):
    def __init__(self):
        super().__init__('view_kpi')

class CanValidateKPIs(HasPermission):
    def __init__(self):
        super().__init__('validate_kpi_entry')

class CanManageTeam(HasPermission):
    def __init__(self):
        super().__init__('manage_team')

class CanExportReports(HasPermission):
    def __init__(self):
        super().__init__('export_report')