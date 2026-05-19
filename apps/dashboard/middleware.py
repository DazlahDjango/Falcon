from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from django.conf import settings
import threading
import re
import logging
logger = logging.getLogger(__name__)
_thread_local = threading.local()

class DashboardTenantMiddleware(MiddlewareMixin):
    def process_request(self, request):
        tenant_id = None
        if hasattr(request, 'user') and request.user.is_authenticated:
            tenant_id = getattr(request.user, 'tenant_id', None)
        if not tenant_id:
            auth_header = request.headers.get('X-Tenant-ID')
            if auth_header:
                tenant_id = auth_header
        _thread_local.tenant_id = str(tenant_id) if tenant_id else None
        request.tenant_id = tenant_id        
        return None
    
    def process_response(self, request, response):
        if hasattr(request, 'tenant_id') and request.tenant_id:
            response['X-Tenant-ID'] = str(request.tenant_id)
        return response

class DashboardCacheMiddleware(MiddlewareMixin):
    CACHEABLE_PATHS = [
        r'^/api/v1/dashboard/.*/data/$',
        r'^/api/v1/dashboard/.*/overview/$',
    ]
    def process_request(self, request):
        if request.method != 'GET':
            return None
        for pattern in self.CACHEABLE_PATHS:
            if re.match(pattern, request.path):
                cache_key = f"dashboard_response:{request.path}:{request.META.get('QUERY_STRING', '')}"
                if hasattr(request, 'user') and request.user.is_authenticated:
                    cache_key = f"{cache_key}:{request.user.id}"
                cached_response = cache.get(cache_key)
                if cached_response:
                    response = JsonResponse(cached_response, safe=False)
                    response['X-Cache'] = 'HIT'
                    return response
                request._dashboard_cache_key = cache_key
                break        
        return None
    
    def process_response(self, request, response):
        if hasattr(request, '_dashboard_cache_key') and response.status_code == 200:
            if response.get('Content-Type', '').startswith('application/json'):
                try:
                    cache.set(request._dashboard_cache_key, response.json(), 300)
                except Exception as e:
                    logger.warning(f"Failed to cache dashboard response: {e}")
        return response

class DashboardRateLimitMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if not request.path.startswith('/api/v1/dashboard/'):
            return None
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return None
        user_id = str(request.user.id)
        path = request.path
        if request.method == 'GET':
            limit = 60
            period = 60
        elif request.method in ['POST', 'PUT', 'DELETE']:
            limit = 30
            period = 60
        else:
            return None
        rate_key = f"dashboard_rate_limit:{user_id}:{path}:{timezone.now().strftime('%Y%m%d%H%M%S')[:10]}"
        current = cache.get(rate_key, 0)
        if current >= limit:
            return JsonResponse(
                {'error': 'Rate limit exceeded', 'retry_after': period},
                status=429
            )        
        cache.set(rate_key, current + 1, period)
        return None

class DashboardAuditMiddleware(MiddlewareMixin):
    AUDIT_PATHS = [
        r'^/api/v1/dashboard/.*/view/$',
        r'^/api/v1/dashboard/.*/export/$',
        r'^/api/v1/dashboard/.*/drill-down/.*$',
    ]
    def process_response(self, request, response):
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return response
        path = request.path
        for pattern in self.AUDIT_PATHS:
            if re.match(pattern, path):
                self._log_audit(request, response)
                break
        return response
    
    def _log_audit(self, request, response):
        try:
            from apps.dashboard.models import DashboardAccessLog
            dashboard_type = self._extract_dashboard_type(request.path)            
            DashboardAccessLog.objects.log_access(
                user_id=str(request.user.id),
                tenant_id=getattr(request.user, 'tenant_id', None),
                dashboard_type=dashboard_type,
                action=self._get_action(request.path, request.method),
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                response_time_ms=getattr(request, '_response_time_ms', None)
            )
        except Exception as e:
            logger.error(f"Failed to log dashboard audit: {e}")
    
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')
    
    def _extract_dashboard_type(self, path):
        if '/executive/' in path:
            return 'executive'
        if '/client-admin/' in path:
            return 'client_admin'
        if '/super-admin/' in path:
            return 'super_admin'
        return 'unknown'
    
    def _get_action(self, path, method):
        if '/export/' in path:
            return 'export'
        if '/drill-down/' in path:
            return 'drill_down'
        if method == 'GET':
            return 'view'
        return 'view'

class DashboardMaintenanceMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if not request.path.startswith('/api/v1/dashboard/'):
            return None
        maintenance_mode = cache.get('dashboard_maintenance_mode', False)
        if maintenance_mode:
            return JsonResponse(
                {
                    'error': 'Dashboard maintenance in progress',
                    'message': 'The dashboard is currently under maintenance. Please try again later.',
                    'estimated_completion': cache.get('dashboard_maintenance_until')
                },
                status=503
            )
        return None