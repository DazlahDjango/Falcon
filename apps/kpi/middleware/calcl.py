import time
import logging
import threading
from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from django.http import JsonResponse
from django.urls import resolve
logger = logging.getLogger(__name__)

class CalculationCacheMiddleware(MiddlewareMixin):
    CACHE_TIMEOUTS = {
        'dashboard:individual': 300,   # 5 minutes
        'dashboard:manager': 300,      # 5 minutes
        'dashboard:executive': 600,    # 10 minutes
        'score:list': 60,              # 1 minute
        'aggregation': 180,            # 3 minutes
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
                import json
                try:
                    data = json.loads(response.content)
                    cache.set(cache_key, data, timeout)
                except (json.JSONDecodeError, AttributeError):
                    pass
        return response
    def _get_cache_key(self, request) -> str:
        resolved = resolve(request.path)
        if 'dashboard' in resolved.url_name:
            user_id = request.user.id if request.user.is_authenticated else 'anonymous'
            year = request.GET.get('year', '')
            month = request.GET.get('month', '')
            return f"kpi:cache:{resolved.url_name}:{user_id}:{year}:{month}"
        if 'score-list' in resolved.url_name:
            return f"kpi:cache:score_list:{request.GET.get('kpi', '')}:{request.GET.get('user', '')}"
        return None
    def _get_cache_timeout(self, cache_key: str) -> int:
        for pattern, timeout in self.CACHE_TIMEOUTS.items():
            if pattern in cache_key:
                return timeout
        return 60
    
    def _invalidate_caches(self, request):
        user_id = request.user.id if request.user.is_authenticated else None
        if user_id:
            cache.delete_pattern(f"kpi:cache:*:{user_id}:*")