# apps/reviews/api/v1/permissions/analytics_permissions.py
"""
Permission classes for analytics endpoints
"""

from rest_framework.permissions import BasePermission
from apps.accounts.constants import UserRoles


class CanViewCompanyAnalytics(BasePermission):
    """
    Allow access to company analytics for:
    - Super Admin
    - Client Admin
    - Executive
    - HR
    - HR Admin
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        allowed_roles = [
            UserRoles.SUPER_ADMIN,
            UserRoles.CLIENT_ADMIN,
            UserRoles.EXECUTIVE,
            UserRoles.HR_ADMIN,
            'admin', 'hr', 'hr_admin'
        ]
        return request.user.role in allowed_roles


class CanViewDepartmentAnalytics(BasePermission):
    """
    Allow access to department analytics for:
    - Super Admin
    - Client Admin
    - Executive
    - HR / HR Admin
    - Managers (their own department only)
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        allowed_roles = [
            UserRoles.SUPER_ADMIN,
            UserRoles.CLIENT_ADMIN,
            UserRoles.EXECUTIVE,
            UserRoles.HR_ADMIN,
            'admin', 'hr', 'hr_admin', 'manager'
        ]
        return request.user.role in allowed_roles
    
    def has_object_permission(self, request, view, obj):
        # Managers can only view their own department
        if request.user.role == 'manager':
            if hasattr(request.user, 'department_id') and hasattr(obj, 'get'):
                dept_id = obj.get('id') if isinstance(obj, dict) else getattr(obj, 'id', None)
                return str(dept_id) == str(request.user.department_id)
            return False
        return True


class CanViewManagerAnalytics(BasePermission):
    """
    Allow access to manager analytics for:
    - Super Admin
    - Client Admin
    - Executive
    - HR / HR Admin
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        allowed_roles = [
            UserRoles.SUPER_ADMIN,
            UserRoles.CLIENT_ADMIN,
            UserRoles.EXECUTIVE,
            UserRoles.HR_ADMIN,
            'admin', 'hr', 'hr_admin'
        ]
        return request.user.role in allowed_roles


class CanViewInsights(BasePermission):
    """
    Allow access to insights for:
    - Super Admin
    - Client Admin
    - Executive
    - HR / HR Admin
    - Managers
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        allowed_roles = [
            UserRoles.SUPER_ADMIN,
            UserRoles.CLIENT_ADMIN,
            UserRoles.EXECUTIVE,
            UserRoles.HR_ADMIN,
            'admin', 'hr', 'hr_admin', 'manager'
        ]
        return request.user.role in allowed_roles


class CanViewPredictions(BasePermission):
    """
    Allow access to predictions (flight risk) for:
    - Super Admin
    - Client Admin
    - HR / HR Admin only (sensitive data)
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        allowed_roles = [
            UserRoles.SUPER_ADMIN,
            UserRoles.CLIENT_ADMIN,
            UserRoles.HR_ADMIN,
            'admin', 'hr', 'hr_admin'
        ]
        return request.user.role in allowed_roles