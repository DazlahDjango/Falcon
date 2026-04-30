from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.utils.translation import gettext_lazy as _

class BaseStructurePermission(BasePermission):
    message = _("You do not have permission to perform this action on organizational structure.")
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        tenant_id = getattr(request.user, 'tenant_id', None)
        if not tenant_id:
            return False
        return True
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        tenant_id = getattr(request.user, 'tenant_id', None)
        if tenant_id and hasattr(obj, 'tenant_id') and str(obj.tenant_id) != str(tenant_id):
            return False
        return True

class CanViewDepartment(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        if request.user.role in ['super_admin', 'client_admin', 'executive', 'dashboard_champion']:
            return True
        return request.method in SAFE_METHODS

class CanEditDepartment(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        if request.user.role in ['super_admin', 'client_admin']:
            return True
        if request.user.role == 'executive' and request.method in ['PUT', 'PATCH']:
            return True
        return False
    def has_object_permission(self, request, view, obj):
        if not super().has_object_permission(request, view, obj):
            return False
        if request.user.role in ['super_admin', 'client_admin']:
            return True
        from ....services.security.hierarchy_access import HierarchyAccessEnforcer
        enforcer = HierarchyAccessEnforcer()
        if enforcer.can_view(request.user.id, obj.id, request.user.tenant_id):
            return True
        return False

class CanDeleteDepartment(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in ['super_admin', 'client_admin']
    def has_object_permission(self, request, view, obj):
        if not super().has_object_permission(request, view, obj):
            return False
        return request.user.role in ['super_admin', 'client_admin']

class CanViewTeam(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        if request.user.role in ['super_admin', 'client_admin', 'executive', 'dashboard_champion', 'supervisor']:
            return True
        return request.method in SAFE_METHODS

class CanEditTeam(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in ['super_admin', 'client_admin', 'executive']

class CanDeleteTeam(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in ['super_admin', 'client_admin']

class CanViewEmployment(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.method in SAFE_METHODS
    def has_object_permission(self, request, view, obj):
        if not super().has_object_permission(request, view, obj):
            return False
        if request.user.role in ['super_admin', 'client_admin', 'executive', 'dashboard_champion']:
            return True
        if request.user.id == obj.user_id:
            return True
        from ....services.security.hierarchy_access import HierarchyAccessEnforcer
        enforcer = HierarchyAccessEnforcer()
        if enforcer.can_view(request.user.id, obj.user_id, request.user.tenant_id):
            return True
        return False

class CanEditEmployment(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in ['super_admin', 'client_admin', 'executive']
    def has_object_permission(self, request, view, obj):
        if not super().has_object_permission(request, view, obj):
            return False
        return request.user.role in ['super_admin', 'client_admin', 'executive']

class CanDeleteEmployment(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in ['super_admin', 'client_admin']

class CanViewPosition(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.method in SAFE_METHODS

class CanEditPosition(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in ['super_admin', 'client_admin']

class CanDeletePosition(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in ['super_admin', 'client_admin']

class CanViewReportingLine(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.method in SAFE_METHODS
    def has_object_permission(self, request, view, obj):
        if not super().has_object_permission(request, view, obj):
            return False
        if request.user.role in ['super_admin', 'client_admin', 'executive']:
            return True
        from ....services.security.hierarchy_access import HierarchyAccessEnforcer
        enforcer = HierarchyAccessEnforcer()
        employee_id = obj.employee.user_id if obj.employee else None
        manager_id = obj.manager.user_id if obj.manager else None
        if employee_id and enforcer.can_view(request.user.id, employee_id, request.user.tenant_id):
            return True
        if manager_id and enforcer.can_view(request.user.id, manager_id, request.user.tenant_id):
            return True
        return False

class CanEditReportingLine(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in ['super_admin', 'client_admin', 'executive']

class CanDeleteReportingLine(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in ['super_admin', 'client_admin']

class CanViewHierarchy(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return True


class CanEditHierarchy(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in ['super_admin', 'client_admin', 'executive']

class CanExportOrgChart(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in ['super_admin', 'client_admin', 'executive', 'dashboard_champion']

class CanPerformBulkOperations(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in ['super_admin', 'client_admin', 'executive']

class IsStructureManager(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        from ....models.employment import Employment
        employment = Employment.objects.filter(
            user_id=request.user.id,
            tenant_id=request.user.tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        return employment.is_manager if employment else False

class IsStructureAdmin(BaseStructurePermission):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in ['super_admin', 'client_admin']

class CanAccessStructureData(BaseStructurePermission):
    def has_permission(self, request, view):
        return super().has_permission(request, view)
    def has_object_permission(self, request, view, obj):
        if not super().has_object_permission(request, view, obj):
            return False
        if request.user.role in ['super_admin', 'client_admin']:
            return True
        from ....services.security.hierarchy_access import HierarchyAccessEnforcer
        enforcer = HierarchyAccessEnforcer()
        if hasattr(obj, 'user_id'):
            return enforcer.can_view(request.user.id, obj.user_id, request.user.tenant_id)
        elif hasattr(obj, 'employee') and obj.employee:
            return enforcer.can_view(request.user.id, obj.employee.user_id, request.user.tenant_id)
        elif hasattr(obj, 'manager') and obj.manager:
            return enforcer.can_view(request.user.id, obj.manager.user_id, request.user.tenant_id)
        return True