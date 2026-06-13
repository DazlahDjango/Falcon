from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from django.http import JsonResponse
from django.urls import resolve
import logging

logger = logging.getLogger(__name__)


class KPIThrottleMiddleware(MiddlewareMixin):
    RATE_LIMITS = {
        'calculate': {'count': 10, 'window': 3600},
        'bulk-upload': {'count': 5, 'window': 60},
        'recalculate': {'count': 20, 'window': 3600},
        'aggregate': {'count': 30, 'window': 3600},
        'export': {'count': 10, 'window': 3600},
        'default': {'count': 60, 'window': 60},
    }

    def process_request(self, request):
        if not request.user.is_authenticated:
            return None

        # SUPER_ADMIN BYPASS - No rate limiting for super_admin
        if request.user.is_superuser:
            logger.debug(f"Rate limit bypassed for superuser {request.user.email}")
            return None

        role = getattr(request.user, 'role', '')
        if role == 'super_admin':
            logger.debug(f"Rate limit bypassed for super_admin {request.user.email}")
            return None

        throttle_key = self._get_throttle_key(request)
        if not throttle_key:
            return None

        # Use current_tenant_id for tenant isolation
        tenant_id = getattr(request, 'current_tenant_id', None) or str(request.user.tenant_id)
        cache_key = f"kpi:throttle:{throttle_key}:{tenant_id}:{request.user.id}"
        count = cache.get(cache_key, 0)
        limit = self.RATE_LIMITS.get(throttle_key, self.RATE_LIMITS['default'])

        if count >= limit['count']:
            logger.warning(f"Rate limit exceeded for user {request.user.email} on {throttle_key}")
            return JsonResponse(
                {'error': 'Rate limit exceeded. Please try again later.', 'retry_after': limit['window']},
                status=429
            )

        cache.set(cache_key, count + 1, limit['window'])
        return None

    def _get_throttle_key(self, request) -> str:
        try:
            resolved = resolve(request.path)
            url_name = resolved.url_name or ''
        except Exception:
            return None

        if 'calculate' in url_name:
            return 'calculate'
        if 'bulk' in url_name or 'upload' in url_name:
            return 'bulk-upload'
        if 'recalculate' in url_name:
            return 'recalculate'
        if 'aggregate' in url_name:
            return 'aggregate'
        if 'export' in url_name:
            return 'export'

        return None


# Alias for backward compatibility
ThrottleMiddleware = KPIThrottleMiddleware