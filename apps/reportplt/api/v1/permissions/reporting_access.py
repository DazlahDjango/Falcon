from rest_framework.permissions import BasePermission
from apps.reportplt.constants import DataSensitivityLevel

class HasReportingAccess(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == 'super_admin':
            return True
        if hasattr(obj, 'tenant_id') and str(obj.tenant_id) != str(request.user.tenant_id):
            return False
        if hasattr(obj, 'sensitivity_level'):
            if obj.sensitivity_level in [DataSensitivityLevel.CONFIDENTIAL, DataSensitivityLevel.RESTRICTED]:
                return request.user.role in ['client_admin', 'super_admin']
        return True
