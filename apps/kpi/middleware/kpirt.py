import time
import logging
import threading
from typing import Dict
from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from django.http import JsonResponse
from django.urls import resolve
logger = logging.getLogger(__name__)

class KPIRequestAuditMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request._kpi_start_time = time.time()
    def process_response(self, request, response):
        if not self._is_kpi_endpoint(request):
            return response
        start_time = getattr(request, '_kpi_start_time', time.time())
        duration = (time.time() - start_time) * 1000
        audit_data = {
            'path': request.path,
            'method': request.method,
            'user_id': request.user.id if request.user.is_authenticated else None,
            'tenant_id': getattr(request, 'tenant', None).id if hasattr(request, 'tenant') else None,
            'status_code': response.status_code,
            'duration_ms': round(duration, 2),
            'timestamp': time.time(),
        }
        if response.status_code >= 500:
            logger.error(f"KPI API error: {audit_data}")
        elif response.status_code >= 400:
            logger.warning(f"KPI API client error: {audit_data}")
        else:
            logger.info(f"KPI API request: {audit_data}")
        return response
    def _is_kpi_endpoint(self, request) -> bool:
        return request.path.startswith('/api/kpi/') or request.path.startswith('/api/v1/kpi/')

class KPIThrottleMiddleware(MiddlewareMixin):
    RATE_LIMITS = {
        'calculate': '10/hour',
        'bulk-upload': '5/minute',
        'recalculate': '20/hour',
        'aggregate': '30/hour',
    }
    def process_request(self, request):
        if not request.user.is_authenticated:
            return None
        throttle_key = self._get_throttle_key(request)
        if not throttle_key:
            return None
        cache_key = f"kpi:throttle:{throttle_key}:{request.user.id}"
        count = cache.get(cache_key, 0)
        limit = self._get_limit(throttle_key)
        if limit and count >= limit['count']:
            return JsonResponse(
                {'error': 'Rate limit exceeded', 'retry_after': limit['window']},
                status=429
            )
        cache.set(cache_key, count + 1, limit['window'] if limit else 60)
        return None
    def _get_throttle_key(self, request) -> str:
        resolved = resolve(request.path)
        url_name = resolved.url_name
        if 'calculate' in url_name:
            return 'calculate'
        if 'bulk' in url_name or 'import' in url_name:
            return 'bulk-upload'
        if 'recalculate' in url_name:
            return 'recalculate'
        if 'aggregate' in url_name:
            return 'aggregate'
        return None
    def _get_limit(self, key: str) -> Dict:
        limit_str = self.RATE_LIMITS.get(key, '60/hour')
        count, period = limit_str.split('/')
        count = int(count)
        if period == 'minute':
            window = 60
        elif period == 'hour':
            window = 3600
        elif period == 'day':
            window = 86400
        else:
            window = 3600
        return {'count': count, 'window': window}