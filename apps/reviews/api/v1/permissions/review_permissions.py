# apps/reviews/api/v1/permissions/review_permissions.py
"""
Permission classes for review-related endpoints
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS
from apps.accounts.constants import UserRoles

class CanViewReview(BasePermission):
    """
    Users can view reviews:
    - Their own self-assessment
    - Their team's reviews (managers)
    - All reviews (admin/HR)
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Admin/HR can view everything
        if user.role in [UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN, UserRoles.DASHBOARD_CHAMPION]:
            return True
        
        # Employee can view their own assessment
        if hasattr(obj, 'employee') and obj.employee == user:
            return True
        
        if hasattr(obj, 'user') and obj.user == user:
            return True
        
        # Manager can view their team's reviews
        if hasattr(obj, 'employee') and obj.employee and obj.employee.manager == user:
            return True
        
        # For self assessment object
        if hasattr(obj, 'self_assessment') and obj.self_assessment:
            if obj.self_assessment.employee == user:
                return True
        
        return False


class CanEditReview(BasePermission):
    """
    Users can edit reviews:
    - Their own draft self-assessment
    - Their team's draft reviews (managers)
    - All reviews (admin/HR)
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Admin/HR can edit everything
        if user.role in [UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN, UserRoles.DASHBOARD_CHAMPION]:
            return True
        
        # Employee can edit their own draft assessment
        if hasattr(obj, 'employee') and obj.employee == user:
            if obj.status == 'draft':
                return True
        
        if hasattr(obj, 'user') and obj.user == user:
            if obj.status == 'draft':
                return True
        
        # Manager can edit their team's draft reviews
        if hasattr(obj, 'employee') and obj.employee and obj.employee.manager == user:
            if obj.status == 'draft':
                return True
        
        return False


class CanApproveReview(BasePermission):
    """
    Users can approve reviews:
    - Managers can approve their team's reviews
    - HR can approve all reviews
    - Admins can approve all reviews
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # HR/Admin can approve everything
        if user.role in [UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN, UserRoles.DASHBOARD_CHAMPION]:
            return True
        
        # Managers can approve their team's reviews
        if hasattr(obj, 'employee') and obj.employee and obj.employee.manager == user:
            if obj.status == 'submitted':
                return True
        
        return False


class CanSubmitSelfAssessment(BasePermission):
    """
    Employees can submit their own self-assessment.
    """
    def has_permission(self, request, view):
        user = request.user
        
        # Only staff and managers can submit self-assessments
        return user.role in [UserRoles.STAFF, UserRoles.SUPERVISOR, UserRoles.EXECUTIVE]
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Can only submit their own assessment
        if hasattr(obj, 'employee') and obj.employee == user:
            return True
        
        return False


class CanConductSupervisorReview(BasePermission):
    """
    Managers can conduct supervisor reviews for their direct reports.
    """
    def has_permission(self, request, view):
        user = request.user
        
        # Only managers and above can conduct reviews
        return user.role in [UserRoles.SUPERVISOR, UserRoles.EXECUTIVE, UserRoles.CLIENT_ADMIN, UserRoles.DASHBOARD_CHAMPION]
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Can review their direct reports
        if hasattr(obj, 'employee') and obj.employee:
            return obj.employee.manager == user
        
        return False


class CanViewFinalRating(BasePermission):
    """
    Users can view final ratings:
    - Employees can view their own
    - Managers can view their team's
    - Executives can view department's
    - HR/Admin can view all
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # HR/Admin can view everything
        if user.role in [UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN, UserRoles.DASHBOARD_CHAMPION]:
            return True
        
        # Employee can view their own
        if hasattr(obj, 'employee') and obj.employee == user:
            return True
        
        # Manager can view their team's
        if hasattr(obj, 'employee') and obj.employee and obj.employee.manager == user:
            return True
        
        # Executive can view department's
        if user.role == UserRoles.EXECUTIVE and hasattr(obj, 'employee') and obj.employee:
            if hasattr(user, 'department') and obj.employee.department == user.department:
                return True
        
        return False


class CanViewTeamReviews(BasePermission):
    """
    Managers can view reviews of their entire team.
    """
    def has_permission(self, request, view):
        user = request.user
        return user.role in [UserRoles.SUPERVISOR, UserRoles.EXECUTIVE, UserRoles.CLIENT_ADMIN, UserRoles.DASHBOARD_CHAMPION]
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Manager can view their team's reviews
        if hasattr(obj, 'employee') and obj.employee:
            return obj.employee.manager == user
        
        return False