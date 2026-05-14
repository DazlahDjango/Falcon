# apps/reviews/api/v1/permissions/calibration_permissions.py
"""
Permission classes for calibration session endpoints
"""

from rest_framework.permissions import BasePermission
from apps.accounts.constants import UserRoles


class CanViewCalibrationSession(BasePermission):
    """
    Users can view calibration sessions:
    - Participants in the session
    - Facilitator of the session
    - HR/Admin can view all sessions
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # HR/Admin can view everything
        if user.role in [UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN, UserRoles.DASHBOARD_CHAMPION]:
            return True
        
        # Facilitator can view
        if hasattr(obj, 'facilitator') and obj.facilitator == user:
            return True
        
        # Participant can view
        if hasattr(obj, 'participants') and obj.participants.filter(id=user.id).exists():
            return True
        
        return False


class CanParticipateInCalibration(BasePermission):
    """
    Users can participate in calibration sessions if invited.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Must be a participant
        if hasattr(obj, 'participants') and obj.participants.filter(id=user.id).exists():
            return True
        
        # Facilitator can participate
        if hasattr(obj, 'facilitator') and obj.facilitator == user:
            return True
        
        return False


class CanFacilitateCalibration(BasePermission):
    """
    Only facilitators and HR/Admin can facilitate calibration sessions.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # HR/Admin can facilitate
        if user.role in [UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN]:
            return True
        
        # Assigned facilitator can facilitate
        if hasattr(obj, 'facilitator') and obj.facilitator == user:
            return True
        
        return False


class CanAdjustRating(BasePermission):
    """
    Users can adjust ratings during calibration:
    - Facilitator can adjust
    - HR/Admin can adjust
    - Participants can suggest adjustments (requires facilitator approval)
    """
    def has_permission(self, request, view):
        user = request.user
        
        # HR/Admin can adjust
        if user.role in [UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN, UserRoles.DASHBOARD_CHAMPION]:
            return True
        
        # Check if user is facilitator of the session
        session_id = view.kwargs.get('session_id')
        if session_id:
            from apps.reviews.models import CalibrationSession
            try:
                session = CalibrationSession.objects.get(id=session_id)
                if session.facilitator == user:
                    return True
            except CalibrationSession.DoesNotExist:
                pass
        
        return False