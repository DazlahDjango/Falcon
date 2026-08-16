# apps/reportplt/api/v1/permissions/analytics.py
from rest_framework.permissions import BasePermission
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles

class AnalyticsPermission(BasePermission):
    message = _("You do not have permission to access analytics")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
            return True
        return False

class AnalyticsViewPermission(AnalyticsPermission):
    message = _("You do not have permission to view analytics")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE, UserRoles.HR_ADMIN]:
            return True
        return False

class AnalyticsCreatePermission(AnalyticsPermission):
    message = _("You do not have permission to create analytics")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
            return True
        return False

class TrendAnalysisPermission(AnalyticsPermission):
    message = _("You do not have permission to perform trend analysis")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE, UserRoles.HR_ADMIN]:
            return True
        if request.user.role == UserRoles.SUPERVISOR:
            return True
        return False

class ComparativeAnalysisPermission(AnalyticsPermission):
    message = _("You do not have permission to perform comparative analysis")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE, UserRoles.HR_ADMIN]:
            return True
        return False

class PredictiveAnalysisPermission(AnalyticsPermission):
    message = _("You do not have permission to perform predictive analysis")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
            return True
        return False