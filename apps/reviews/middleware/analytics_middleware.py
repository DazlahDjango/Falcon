# apps/reviews/middleware/analytics_middleware.py
"""
Middleware for analytics features in Reviews app.
Injects analytics data, tracks page views, and adds analytics headers.
"""

import json
import time
from django.utils.deprecation import MiddlewareMixin
from django.utils import timezone
from django.core.cache import cache


class AnalyticsContextMiddleware(MiddlewareMixin):
    """
    Injects analytics data into request context.
    Also tracks page views for analytics.
    """
    
    # URL patterns that should have analytics data injected
    ANALYTICS_PATTERNS = [
        '/reviews/dashboard',
        '/reviews/analytics',
        '/reviews/reports',
        '/reviews/insights',
    ]
    
    def process_request(self, request):
        """
        Add analytics data to request for use in views.
        """
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return None
        
        path = request.path_info
        
        # Only inject analytics for relevant pages
        is_analytics_page = any(pattern in path for pattern in self.ANALYTICS_PATTERNS)
        
        if not is_analytics_page:
            return None
        
        # Get tenant
        tenant = getattr(request, 'tenant', None)
        if not tenant and hasattr(request.user, 'tenant'):
            tenant = request.user.tenant
        
        if not tenant:
            return None
        
        # Store analytics data in request
        request.analytics_data = {
            'tenant_id': str(tenant.id),
            'page': path,
            'user_role': request.user.role,
            'timestamp': timezone.now().isoformat()
        }
        
        # Add cached analytics if available
        cache_key = f'reviews:analytics:page:{tenant.id}:{path}'
        cached_analytics = cache.get(cache_key)
        if cached_analytics:
            request.analytics_data['cached_data'] = cached_analytics
        
        return None
    
    def process_response(self, request, response):
        """
        Add analytics headers to response.
        """
        if hasattr(request, 'analytics_data'):
            response['X-Analytics-Enabled'] = 'true'
            response['X-Analytics-Tenant'] = request.analytics_data.get('tenant_id', '')
        
        return response


class AnalyticsPageViewMiddleware(MiddlewareMixin):
    """
    Tracks page views for analytics and reporting.
    """
    
    def process_request(self, request):
        """
        Track page view for analytics.
        """
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return None
        
        path = request.path_info
        
        # Track only review-related pages
        if '/reviews/' not in path:
            return None
        
        # Record page view in cache for real-time stats
        cache_key = f'reviews:pageview:{path}:{timezone.now().strftime("%Y-%m-%d-%H")}'
        
        try:
            current_count = cache.get(cache_key, 0)
            cache.set(cache_key, current_count + 1, 3600)
        except Exception:
            pass
        
        return None


class AnalyticsCacheMiddleware(MiddlewareMixin):
    """
    Caches analytics responses for better performance.
    """
    
    # Cache duration in seconds
    CACHE_DURATIONS = {
        '/api/v1/reviews/analytics/company/': 3600,      # 1 hour
        '/api/v1/reviews/analytics/departments/': 3600,  # 1 hour
        '/api/v1/reviews/analytics/managers/': 3600,     # 1 hour
        '/api/v1/reviews/analytics/trends/': 7200,       # 2 hours
        '/api/v1/reviews/analytics/predictions/': 21600, # 6 hours
        '/api/v1/reviews/analytics/insights/': 21600,    # 6 hours
    }
    
    def process_request(self, request):
        """
        Check if cached response exists.
        """
        if request.method != 'GET':
            return None
        
        path = request.path_info
        
        # Check if this path should be cached
        cache_duration = None
        for cache_path, duration in self.CACHE_DURATIONS.items():
            if cache_path in path:
                cache_duration = duration
                break
        
        if not cache_duration:
            return None
        
        # Check cache
        cache_key = f'reviews:analytics:cache:{path}:{request.user.tenant_id}'
        cached_response = cache.get(cache_key)
        
        if cached_response:
            request.cached_response = cached_response
            request.use_cached_response = True
        
        return None
    
    def process_response(self, request, response):
        """
        Cache the response for future requests.
        """
        if request.method != 'GET':
            return response
        
        # Don't cache error responses
        if response.status_code >= 400:
            return response
        
        # Don't cache if we already used cached response
        if hasattr(request, 'use_cached_response') and request.use_cached_response:
            return response
        
        path = request.path_info
        
        # Check if this path should be cached
        cache_duration = None
        for cache_path, duration in self.CACHE_DURATIONS.items():
            if cache_path in path:
                cache_duration = duration
                break
        
        if not cache_duration:
            return response
        
        # Cache the response
        cache_key = f'reviews:analytics:cache:{path}:{request.user.tenant_id}'
        
        try:
            # Store response data (not the whole response object)
            cache.set(cache_key, {
                'content': response.content,
                'status_code': response.status_code,
                'content_type': response.get('Content-Type', 'application/json')
            }, cache_duration)
        except Exception:
            pass
        
        return response


class RealTimeAnalyticsMiddleware(MiddlewareMixin):
    """
    Tracks real-time analytics events.
    """
    
    def process_request(self, request):
        """
        Track real-time events for WebSocket analytics.
        """
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return None
        
        # Track user online status for real-time analytics
        cache_key = f'reviews:realtime:user_online:{request.user.id}'
        cache.set(cache_key, timezone.now().isoformat(), 300)  # 5 minutes expiry
        
        # Update active users count
        active_users_key = f'reviews:realtime:active_users:{request.user.tenant_id}'
        active_users = cache.get(active_users_key, set())
        if request.user.id not in active_users:
            active_users.add(request.user.id)
            cache.set(active_users_key, active_users, 300)
        
        return None