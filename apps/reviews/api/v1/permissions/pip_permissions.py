# apps/reviews/api/v1/permissions/pip_permissions.py
"""
Permission classes for PIP (Performance Improvement Plan) endpoints
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS
from apps.accounts.constants import UserRoles

class CanViewPIP(BasePermission):
    """
    Users can view PIPs:
    - Employee can view their own PIP
    - Manager can view their team's PIPs
    - HR/Admin can view all PIPs
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # HR/Admin can view everything
        if user.role in [UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN, UserRoles.DASHBOARD_CHAMPION]:
            return True
        
        # Employee can view their own PIP
        if hasattr(obj, 'employee') and obj.employee == user:
            return True
        
        # Manager can view their team's PIPs
        if hasattr(obj, 'employee') and obj.employee and obj.employee.manager == user:
            return True
        
        # Owner can view
        if hasattr(obj, 'owner') and obj.owner == user:
            return True
        
        return False


class CanCreatePIP(BasePermission):
    """
    Users can create PIPs:
    - Managers can create PIPs for their direct reports
    - HR/Admin can create PIPs for anyone
    """
    def has_permission(self, request, view):
        user = request.user
        
        # HR/Admin can create
        if user.role in [UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN, UserRoles.DASHBOARD_CHAMPION]:
            return True
        
        # Managers can create for their team
        if user.role in ['manager', 'executive']:
            return True
        
        return False
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Check if manager is creating for their direct report
        employee_id = request.data.get('employee_id')
        if employee_id:
            from apps.accounts.models import User
            try:
                employee = User.objects.get(id=employee_id)
                return employee.manager == user
            except User.DoesNotExist:
                pass
        
        return user.role in [UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN, UserRoles.DASHBOARD_CHAMPION]


class CanManagePIP(BasePermission):
    """
    Users can manage PIPs:
    - Owner/Manager can manage their team's PIPs
    - HR/Admin can manage all PIPs
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # HR/Admin can manage everything
        if user.role in ['admin', 'super_admin', 'hr']:
            return True
        
        # Owner can manage
        if hasattr(obj, 'owner') and obj.owner == user:
            return True
        
        # Manager can manage their team's PIPs
        if hasattr(obj, 'employee') and obj.employee and obj.employee.manager == user:
            return True
        
        return False


class CanApprovePIP(BasePermission):
    """
    Users can approve PIPs:
    - HR can approve PIPs
    - Admin can approve PIPs
    """
    def has_permission(self, request, view):
        user = request.user
        return user.role in ['admin', 'super_admin', 'hr']
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        return user.role in ['admin', 'super_admin', 'hr']


class CanCompletePIPAction(BasePermission):
    """
    Users can complete PIP actions:
    - Employee can complete their own actions
    - Manager can mark actions as complete
    - HR/Admin can mark actions as complete
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # HR/Admin can complete anything
        if user.role in ['admin', 'super_admin', 'hr']:
            return True
        
        # Employee can complete their own actions
        if hasattr(obj, 'pip') and obj.pip and obj.pip.employee == user:
            return True
        
        # Manager can complete their team's actions
        if hasattr(obj, 'pip') and obj.pip and obj.pip.employee:
            if obj.pip.employee.manager == user:
                return True
        
        return False