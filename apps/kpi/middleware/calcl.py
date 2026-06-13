import json
import logging
from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from django.http import JsonResponse
from django.urls import resolve

logger = logging.getLogger(__name__)


class CalculationCacheMiddleware(MiddlewareMixin):
    CACHE_TIMEOUTS = {
        'dashboard:individual': 300,
        'dashboard:manager': 300,
        'dashboard:executive': 600,
        'dashboard:champion': 300,
        'kpi-summary-list': 300,
        'department-rollup-list': 300,
        'organization-health-list': 300,
        'score-list': 60,
        'aggregated-score-list': 180,
    }

    def process_request(self, request):
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            self._invalidate_caches(request)
            return None

        if request.method != 'GET':
            return None

        cache_key = self._get_cache_key(request)
        if not cache_key:
            return None

        cached_response = cache.get(cache_key)
        if cached_response:
            logger.debug(f"Cache hit for {cache_key}")
            return JsonResponse(cached_response, safe=False)

        request._kpi_cache_key = cache_key
        return None

    def process_response(self, request, response):
        if hasattr(request, '_kpi_cache_key') and response.status_code == 200:
            cache_key = request._kpi_cache_key
            timeout = self._get_cache_timeout(cache_key)
            if response.get('Content-Type') == 'application/json':
                try:
                    data = json.loads(response.content)
                    cache.set(cache_key, data, timeout)
                except (json.JSONDecodeError, AttributeError):
                    pass
        return response

    def _get_cache_key(self, request) -> str:
        try:
            resolved = resolve(request.path)
            url_name = resolved.url_name or ''
        except Exception:
            return None

        # Use current_tenant_id for tenant isolation
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and hasattr(request, 'user') and request.user.is_authenticated:
            tenant_id = str(request.user.tenant_id)
        
        user_id = str(request.user.id) if request.user.is_authenticated else 'anonymous'
        year = request.GET.get('year', '')
        month = request.GET.get('month', '')
        kpi_id = request.GET.get('kpi', '')
        user_param = request.GET.get('user', '')

        if 'dashboard' in url_name:
            return f"kpi:cache:{url_name}:{tenant_id}:{user_id}:{year}:{month}"
        if 'kpi-summary' in url_name:
            return f"kpi:cache:kpi_summary:{tenant_id}:{user_id}:{year}:{month}"
        if 'department-rollup' in url_name:
            return f"kpi:cache:dept_rollup:{tenant_id}:{user_id}:{year}:{month}"
        if 'organization-health' in url_name:
            return f"kpi:cache:org_health:{tenant_id}:{user_id}:{year}:{month}"
        if 'score-list' in url_name:
            return f"kpi:cache:score_list:{tenant_id}:{kpi_id}:{user_param}"

        return None

    def _get_cache_timeout(self, cache_key: str) -> int:
        for pattern, timeout in self.CACHE_TIMEOUTS.items():
            if pattern in cache_key:
                return timeout
        return 60

    def _invalidate_caches(self, request):
        tenant_id = getattr(request, 'current_tenant_id', None)
        if tenant_id:
            try:
                cache.delete_pattern(f"kpi:cache:*{tenant_id}*")
            except Exception as e:
                logger.warning(f"Failed to invalidate caches: {e}")


# Alias for backward compatibility
CacheMiddleware = CalculationCacheMiddleware