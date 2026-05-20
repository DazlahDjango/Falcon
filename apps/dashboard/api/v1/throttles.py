# apps/dashboard/api/v1/throttles.py

from rest_framework.throttling import BaseThrottle, SimpleRateThrottle
from django.core.cache import cache
from django.utils import timezone
import re


# ===================== EXECUTIVE DASHBOARD THROTTLES =====================

class ExecutiveDashboardThrottle(SimpleRateThrottle):
    scope = 'executive_dashboard'
    rate = '60/minute'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id
        tenant_id = getattr(request.user, 'tenant_id', '')
        return f"throttle_executive_{tenant_id}_{user_id}"
    
    def allow_request(self, request, view):
        if request.user and request.user.role == 'super_admin':
            return True        
        return super().allow_request(request, view)


# ===================== CLIENT ADMIN DASHBOARD THROTTLES =====================

class ClientAdminDashboardThrottle(SimpleRateThrottle):
    scope = 'client_admin_dashboard'
    rate = '120/minute'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id
        tenant_id = getattr(request.user, 'tenant_id', '')    
        return f"throttle_client_admin_{tenant_id}_{user_id}"
    
    def allow_request(self, request, view):
        if request.user and request.user.role == 'super_admin':
            return True        
        return super().allow_request(request, view)


# ===================== SUPER ADMIN DASHBOARD THROTTLES =====================

class SuperAdminDashboardThrottle(SimpleRateThrottle):
    scope = 'super_admin_dashboard'
    rate = '180/minute'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id
        return f"throttle_super_admin_{user_id}"
    
    def allow_request(self, request, view):
        if request.user and request.user.role == 'super_admin':
            return super().allow_request(request, view)
        return False


# ===================== EXPORT THROTTLES =====================

class DashboardExportThrottle(SimpleRateThrottle):
    scope = 'dashboard_export'
    rate = '20/hour'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id
        dashboard_type = view.kwargs.get('dashboard_type', '')
        return f"throttle_export_{dashboard_type}_{user_id}"
    
    def allow_request(self, request, view):
        if request.user and request.user.role == 'super_admin':
            return True        
        return super().allow_request(request, view)


# ===================== DRILL-DOWN THROTTLES =====================

class DashboardDrillDownThrottle(SimpleRateThrottle):
    scope = 'dashboard_drilldown'
    rate = '30/minute'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id        
        return f"throttle_drilldown_{user_id}"
    
    def allow_request(self, request, view):
        return super().allow_request(request, view)


# ===================== WIDGET CONFIG THROTTLES =====================

class DashboardWidgetConfigThrottle(SimpleRateThrottle):
    scope = 'dashboard_widget_config'
    rate = '30/minute'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id        
        return f"throttle_widget_config_{user_id}"


# ===================== REFRESH THROTTLES =====================

class DashboardRefreshThrottle(SimpleRateThrottle):
    scope = 'dashboard_refresh'
    rate = '10/minute'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id
        dashboard_type = view.kwargs.get('dashboard_type', '')       
        return f"throttle_refresh_{dashboard_type}_{user_id}"


# ===================== BURST THROTTLE =====================

class BurstDashboardThrottle(BaseThrottle):
    def allow_request(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == 'super_admin':
            return True
        user_id = request.user.id
        window = 10
        max_requests = 15
        burst_key = f"burst_dashboard_{user_id}_{int(timezone.now().timestamp() / window)}"
        current = cache.get(burst_key, 0)
        if current >= max_requests:
            return False
        cache.set(burst_key, current + 1, window)
        return True


# ===================== MANAGER DASHBOARD THROTTLES =====================

class ManagerDashboardThrottle(SimpleRateThrottle):
    """Throttle for Manager Dashboard."""
    scope = 'manager_dashboard'
    rate = '60/minute'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id
        tenant_id = getattr(request.user, 'tenant_id', '')
        return f"throttle_manager_{tenant_id}_{user_id}"
    
    def allow_request(self, request, view):
        if request.user and request.user.role in ['client_admin', 'super_admin']:
            return True
        return super().allow_request(request, view)


# ===================== STAFF DASHBOARD THROTTLES =====================

class StaffDashboardThrottle(SimpleRateThrottle):
    """Throttle for Staff Dashboard."""
    scope = 'staff_dashboard'
    rate = '120/minute'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id
        tenant_id = getattr(request.user, 'tenant_id', '')
        return f"throttle_staff_{tenant_id}_{user_id}"
    
    def allow_request(self, request, view):
        if request.user and request.user.role in ['client_admin', 'super_admin']:
            return True
        return super().allow_request(request, view)


# ===================== CHAMPION DASHBOARD THROTTLES =====================

class ChampionDashboardThrottle(SimpleRateThrottle):
    """Throttle for Champion Dashboard."""
    scope = 'champion_dashboard'
    rate = '30/minute'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id
        tenant_id = getattr(request.user, 'tenant_id', '')
        return f"throttle_champion_{tenant_id}_{user_id}"
    
    def allow_request(self, request, view):
        if request.user and request.user.role in ['client_admin', 'super_admin']:
            return True
        return super().allow_request(request, view)


# ===================== READ-ONLY DASHBOARD THROTTLES =====================

class ReadOnlyDashboardThrottle(SimpleRateThrottle):
    """Throttle for Read-Only Dashboard."""
    scope = 'readonly_dashboard'
    rate = '90/minute'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id
        tenant_id = getattr(request.user, 'tenant_id', '')
        return f"throttle_readonly_{tenant_id}_{user_id}"
    
    def allow_request(self, request, view):
        if request.user and request.user.role in ['client_admin', 'super_admin']:
            return True
        return super().allow_request(request, view)


# ===================== KPI SUBMISSION THROTTLES =====================

class KpiSubmissionThrottle(SimpleRateThrottle):
    """Throttle for KPI data submissions."""
    scope = 'kpi_submission'
    rate = '20/hour'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id
        return f"throttle_submission_{user_id}"
    
    def allow_request(self, request, view):
        if request.user and request.user.role == 'super_admin':
            return True
        return super().allow_request(request, view)


# ===================== APPROVAL ACTION THROTTLES =====================

class ApprovalActionThrottle(SimpleRateThrottle):
    """Throttle for approval/rejection actions."""
    scope = 'approval_action'
    rate = '50/hour'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id
        return f"throttle_approval_{user_id}"
    
    def allow_request(self, request, view):
        if request.user and request.user.role in ['client_admin', 'super_admin']:
            return True
        return super().allow_request(request, view)


# ===================== ENHANCED DRILL-DOWN THROTTLES =====================

class EnhancedDrillDownThrottle(SimpleRateThrottle):
    """Enhanced throttle for drill-down operations."""
    scope = 'enhanced_drilldown'
    rate = '45/minute'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id
        return f"throttle_drilldown_v2_{user_id}"
    
    def allow_request(self, request, view):
        if request.user and request.user.role in ['client_admin', 'super_admin']:
            return True
        return super().allow_request(request, view)