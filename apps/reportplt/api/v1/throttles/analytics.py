# apps/reportplt/api/v1/throttles/analytics.py
from typing import Optional
from django.core.cache import cache
from rest_framework.throttling import SimpleRateThrottle

class AnalyticsThrottle(SimpleRateThrottle):
    """
    Rate limit for analytics endpoints.
    """
    scope = 'analytics'
    rate = '50/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"analytics:{str(request.user.id)}"
        return None

class AnalyticsUserThrottle(SimpleRateThrottle):
    """
    Per-user rate limit for analytics.
    """
    scope = 'analytics_user'
    rate = '30/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"analytics_user:{str(request.user.id)}"
        return None

class AnalyticsTenantThrottle(SimpleRateThrottle):
    """
    Per-tenant rate limit for analytics.
    """
    scope = 'analytics_tenant'
    rate = '200/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request.user, 'tenant_id', None)
            if tenant_id:
                return f"analytics_tenant:{str(tenant_id)}"
        return None

class TrendAnalysisThrottle(SimpleRateThrottle):
    """
    Rate limit for trend analysis endpoints.
    """
    scope = 'trend_analysis'
    rate = '20/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            report_id = request.parser_context.get('kwargs', {}).get('report_id')
            if report_id:
                return f"trend:{str(request.user.id)}:{report_id}"
            return f"trend:{str(request.user.id)}"
        return None

class PredictiveAnalysisThrottle(SimpleRateThrottle):
    """
    Rate limit for predictive analysis endpoints.
    """
    scope = 'predictive_analysis'
    rate = '10/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"predict:{str(request.user.id)}"
        return None

class ComparativeAnalysisThrottle(SimpleRateThrottle):
    """
    Rate limit for comparative analysis endpoints.
    """
    scope = 'comparative_analysis'
    rate = '20/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"compare:{str(request.user.id)}"
        return None

class PerformanceAnalysisThrottle(SimpleRateThrottle):
    """
    Rate limit for performance analysis endpoints.
    """
    scope = 'performance_analysis'
    rate = '20/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"perf:{str(request.user.id)}"
        return None

class AnomalyDetectionThrottle(SimpleRateThrottle):
    """
    Rate limit for anomaly detection endpoints.
    """
    scope = 'anomaly_detection'
    rate = '15/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"anomaly:{str(request.user.id)}"
        return None