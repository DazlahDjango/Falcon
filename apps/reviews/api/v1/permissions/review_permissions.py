from rest_framework.permissions import BasePermission, SAFE_METHODS
from apps.accounts.constants import UserRoles

class CanViewReview(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_superuser or user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]:
            return True
        if user.role == UserRoles.EXECUTIVE:
            return True
        if hasattr(obj, 'employee') and obj.employee_id == user.id:
            return True
        if hasattr(obj, 'supervisor') and obj.supervisor_id == user.id:
            return True
        return False

class CanEditReview(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if request.method in SAFE_METHODS:
            return True
        if user.is_superuser or user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]:
            return True
        if hasattr(obj, 'employee') and obj.employee_id == user.id and getattr(obj, 'status', '') in ['draft', 'rejected']:
            return True
        if hasattr(obj, 'supervisor') and obj.supervisor_id == user.id and getattr(obj, 'status', '') in ['draft', 'rejected']:
            return True
        return False

class CanApproveReview(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_superuser or user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]

class CanSubmitSelfAssessment(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_superuser or user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]:
            return True
        return obj.employee_id == user.id

class CanConductSupervisorReview(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_superuser or user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]:
            return True
        return hasattr(obj, 'supervisor') and obj.supervisor_id == user.id

class CanViewFinalRating(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_superuser or user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]:
            return True
        if user.role == UserRoles.EXECUTIVE:
            return True
        if hasattr(obj, 'employee') and obj.employee_id == user.id:
            return True
        if hasattr(obj, 'supervisor_review') and obj.supervisor_review and obj.supervisor_review.supervisor_id == user.id:
            return True
        return False

class CanViewTeamReviews(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user.is_superuser or user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
            return True
        return user.role == UserRoles.SUPERVISOR