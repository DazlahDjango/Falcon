# apps/reportplt/api/v1/throttles/dashboard.py
from typing import Optional
from django.core.cache import cache
from rest_framework.throttling import SimpleRateThrottle

class DashboardThrottle(SimpleRateThrottle):
    """
    Rate limit for dashboard endpoints.
    """
    scope = 'dashboard'
    rate = '100/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"dash:{str(request.user.id)}"
        return None

class DashboardUserThrottle(SimpleRateThrottle):
    """
    Per-user rate limit for dashboards.
    """
    scope = 'dashboard_user'
    rate = '60/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            dashboard_id = request.parser_context.get('kwargs', {}).get('dashboard_id')
            if dashboard_id:
                return f"dash_user:{str(request.user.id)}:{dashboard_id}"
            return f"dash_user:{str(request.user.id)}"
        return None

class DashboardTenantThrottle(SimpleRateThrottle):
    """
    Per-tenant rate limit for dashboards.
    """
    scope = 'dashboard_tenant'
    rate = '500/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request.user, 'tenant_id', None)
            if tenant_id:
                return f"dash_tenant:{str(tenant_id)}"
        return None

class WidgetDataThrottle(SimpleRateThrottle):
    """
    Rate limit for widget data fetching.
    """
    scope = 'widget_data'
    rate = '200/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            widget_id = request.parser_context.get('kwargs', {}).get('widget_id')
            if widget_id:
                return f"widget:{str(request.user.id)}:{widget_id}"
            return f"widget:{str(request.user.id)}"
        return None

class RealtimeDashboardThrottle(SimpleRateThrottle):
    """
    Rate limit for realtime dashboard updates (WebSocket).
    """
    scope = 'realtime_dashboard'
    rate = '60/minute'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"rt:{str(request.user.id)}"
        return None

class DashboardLayoutThrottle(SimpleRateThrottle):
    """
    Rate limit for dashboard layout updates.
    """
    scope = 'dashboard_layout'
    rate = '10/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"layout:{str(request.user.id)}"
        return None

class WidgetRefreshThrottle(SimpleRateThrottle):
    """
    Rate limit for manual widget refresh.
    """
    scope = 'widget_refresh'
    rate = '30/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            widget_id = request.parser_context.get('kwargs', {}).get('widget_id')
            return f"refresh:{str(request.user.id)}:{widget_id}"
        return None