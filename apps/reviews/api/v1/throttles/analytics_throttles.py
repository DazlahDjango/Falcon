# apps/reviews/api/v1/throttles/analytics_throttles.py
"""
Throttle classes for analytics endpoints
"""

from apps.accounts.api.v1.throttles import UserRateThrottle


class AnalyticsThrottle(UserRateThrottle):
    """
    Limits analytics requests.
    Rate: 30 requests per minute (analytics queries can be heavy)
    """
    scope = 'analytics'
    rate = '30/min'
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return self.cache_format % {
                'scope': self.scope,
                'ident': request.user.id
            }
        return None


class AnalyticsExportThrottle(UserRateThrottle):
    """
    Limits analytics export requests.
    Rate: 10 exports per hour
    """
    scope = 'analytics_export'
    rate = '10/hour'
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return self.cache_format % {
                'scope': self.scope,
                'ident': request.user.id
            }
        return None


class AnalyticsRefreshThrottle(UserRateThrottle):
    """
    Limits analytics refresh requests.
    Rate: 5 refreshes per hour (to prevent cache abuse)
    """
    scope = 'analytics_refresh'
    rate = '5/hour'
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return self.cache_format % {
                'scope': self.scope,
                'ident': request.user.id
            }
        return None