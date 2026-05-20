from rest_framework.throttling import BaseThrottle, SimpleRateThrottle
from django.core.cache import cache
from django.utils import timezone
import re

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

class DashboardWidgetConfigThrottle(SimpleRateThrottle):
    scope = 'dashboard_widget_config'
    rate = '30/minute'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id        
        return f"throttle_widget_config_{user_id}"

class DashboardRefreshThrottle(SimpleRateThrottle):
    scope = 'dashboard_refresh'
    rate = '10/minute'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id
        dashboard_type = view.kwargs.get('dashboard_type', '')       
        return f"throttle_refresh_{dashboard_type}_{user_id}"
 
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