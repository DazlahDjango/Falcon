# apps/reviews/api/v1/permissions/feedback_permissions.py
"""
Permission classes for feedback endpoints
"""

from rest_framework.permissions import BasePermission
from apps.accounts.constants import UserRoles


class CanRequestFeedback(BasePermission):
    """
    Users can request feedback:
    - Managers can request feedback for their team members
    - HR/Admin can request feedback for anyone
    """
    def has_permission(self, request, view):
        user = request.user
        return user.role in ['supervisor', 'executive', 'client_admin', 'super_admin', 'dashboard_champion']
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Check if requesting for team member
        if hasattr(obj, 'subject') and obj.subject:
            return obj.subject.manager == user
        
        return user.role in ['client_admin', 'super_admin', 'dashboard_champion']


class CanProvideFeedback(BasePermission):
    """
    Users can provide feedback if requested.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Reviewer can provide feedback
        if hasattr(obj, 'reviewer') and obj.reviewer == user:
            return True
        
        return False


class CanViewFeedbackSummary(BasePermission):
    """
    Users can view feedback summaries:
    - Employee can view their own summary
    - Manager can view their team's summaries
    - HR/Admin can view all summaries
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # HR/Admin can view everything
        if user.role in [UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN, UserRoles.DASHBOARD_CHAMPION]:
            return True
        
        # Employee can view their own summary
        if hasattr(obj, 'subject') and obj.subject == user:
            return True
        
        # Manager can view their team's summaries
        if hasattr(obj, 'subject') and obj.subject and obj.subject.manager == user:
            return True
        
        return False


class CanManageFeedbackRequests(BasePermission):
    """
    Users can manage feedback requests:
    - HR/Admin can manage all requests
    - Managers can manage requests for their team
    """
    def has_permission(self, request, view):
        user = request.user
        return user.role in ['manager', 'executive', 'admin', 'hr']
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # HR/Admin can manage everything
        if user.role in [UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN, UserRoles.DASHBOARD_CHAMPION]:
            return True
        
        # Manager can manage team requests
        if hasattr(obj, 'subject') and obj.subject:
            return obj.subject.manager == user
        
        return False