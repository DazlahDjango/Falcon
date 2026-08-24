from rest_framework.permissions import BasePermission
from apps.accounts.constants import UserRoles

class CanRequestFeedback(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN, UserRoles.SUPERVISOR]

class CanProvideFeedback(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if hasattr(obj, 'reviewer') and obj.reviewer_id == user.id:
            return True
        return user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]

class CanViewFeedbackSummary(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]:
            return True
        if user.role == UserRoles.EXECUTIVE:
            return True
        if hasattr(obj, 'subject') and obj.subject_id == user.id:
            return True
        if hasattr(obj, 'subject') and obj.subject and obj.subject.manager_id == user.id:
            return True
        return False

class CanManageFeedbackRequests(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]