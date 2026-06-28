from rest_framework.permissions import BasePermission
from apps.accounts.constants import UserRoles

class CanViewCalibrationSession(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.DASHBOARD_CHAMPION]:
            return True
        if hasattr(obj, 'facilitator') and obj.facilitator_id == user.id:
            return True
        if hasattr(obj, 'participants') and obj.participants.filter(id=user.id).exists():
            return True
        return False

class CanParticipateInCalibration(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if hasattr(obj, 'participants') and obj.participants.filter(id=user.id).exists():
            return True
        if hasattr(obj, 'facilitator') and obj.facilitator_id == user.id:
            return True
        return user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]

class CanFacilitateCalibration(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        return hasattr(obj, 'facilitator') and obj.facilitator_id == user.id

class CanAdjustRating(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        session_id = view.kwargs.get('session_id') or view.kwargs.get('pk')
        if session_id:
            from apps.reviews.models import CalibrationSession
            try:
                session = CalibrationSession.objects.get(id=session_id)
                return session.facilitator_id == user.id
            except CalibrationSession.DoesNotExist:
                pass
        return False