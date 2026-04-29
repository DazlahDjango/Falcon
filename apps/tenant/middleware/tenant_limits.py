# apps/tenant/middleware/tenant_limits.py
"""
Tenant Limits Middleware - Enforces rate limits per tenant.

"""

import logging
from datetime import date

from django.core.cache import cache
from django.http import JsonResponse, HttpResponse
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


# Django 3.2+ uses HttpResponseTooManyRequests, but for compatibility
# we define our own that works with all Django versions
class HttpResponseTooManyRequests(HttpResponse):
    """HTTP 429 Too Many Requests response for rate limiting."""
    status_code = 429


class TenantLimitsMiddleware(MiddlewareMixin):
    """
    Enforces API rate limits and resource quotas per tenant.

    Returns HTTP 429 (Too Many Requests) if limit is exceeded.
    """

    def process_request(self, request):
        """
        Check tenant limits before processing request.
        """

        # Skip for admin and auth endpoints
        if self._should_skip_limits(request):
            return None

        tenant_id = getattr(request, 'tenant_id', None)

        if not tenant_id:
            return None

        # Check if tenant is suspended
        if self._is_tenant_suspended(tenant_id):
            logger.warning(f"Tenant {tenant_id} is suspended, request blocked")
            return JsonResponse(
                {'error': 'Tenant account is suspended. Please contact support.'},
                status=403
            )

        # Check if tenant is in maintenance mode
        if self._is_tenant_in_maintenance(tenant_id):
            logger.info(f"Tenant {tenant_id} is in maintenance mode")
            return JsonResponse(
                {'error': 'Tenant is under maintenance. Please try again later.'},
                status=503
            )

        # Check API call limit
        if not self._check_api_limit(tenant_id, request.path):
            return HttpResponseTooManyRequests(
                "API limit exceeded for today. Please try again later."
            )

        return None

    def _should_skip_limits(self, request):
        """Skip limit checking for certain endpoints"""
        skip_paths = [
            '/admin/',
            '/health/',
            '/api/v1/auth/',
            '/api/v1/tenant/status/',
        ]

        for path in skip_paths:
            if request.path.startswith(path):
                return True
        return False

    def _check_api_limit(self, tenant_id, path):
        """
        Check if tenant has exceeded daily API call limit.

        Returns:
            bool: True if under limit, False if exceeded
        """
        from apps.tenant.models import TenantResource
        from apps.tenant.constants import ResourceType

        today = date.today().isoformat()
        cache_key = f"api_count_{tenant_id}_{today}"

        # Get current count from cache
        current_count = cache.get(cache_key, 0)

        # If not in cache, get from database
        if current_count == 0:
            try:
                resource = TenantResource.objects.filter(
                    tenant_id=tenant_id,
                    resource_type=ResourceType.API_CALLS_PER_DAY
                ).first()

                if resource:
                    current_count = resource.current_value
                    cache.set(cache_key, current_count, 86400)  # 24 hours
            except Exception:
                # Default to 10,000 if no resource found
                current_count = 0

        # Get limit (default to 10,000 if not found)
        limit = self._get_api_limit(tenant_id)

        # Check if limit exceeded
        if current_count >= limit:
            logger.warning(
                f"Tenant {tenant_id} exceeded API limit: {current_count}/{limit}")
            return False

        # Increment counter in cache (will be synced to DB later)
        cache.set(cache_key, current_count + 1, 86400)

        # Sync to database every 100 requests
        if (current_count + 1) % 100 == 0:
            self._sync_api_count_to_db(tenant_id, current_count + 1)

        return True

    def _get_api_limit(self, tenant_id):
        """Get API call limit for tenant"""
        from apps.tenant.models import TenantResource
        from apps.tenant.constants import ResourceType

        try:
            resource = TenantResource.objects.filter(
                tenant_id=tenant_id,
                resource_type=ResourceType.API_CALLS_PER_DAY
            ).first()
            return resource.limit_value if resource else 10000
        except Exception:
            return 10000

    def _sync_api_count_to_db(self, tenant_id, count):
        """Sync API count from cache to database"""
        from apps.tenant.models import TenantResource
        from apps.tenant.constants import ResourceType

        try:
            TenantResource.objects.filter(
                tenant_id=tenant_id,
                resource_type=ResourceType.API_CALLS_PER_DAY
            ).update(current_value=count)
        except Exception as e:
            logger.error(f"Failed to sync API count: {e}")

    def _is_tenant_suspended(self, tenant_id):
        """Check if tenant is suspended"""
        from apps.tenant.models import Client
        from apps.tenant.constants import TenantStatus

        try:
            tenant = Client.objects.filter(id=tenant_id).first()
            return tenant and tenant.status == TenantStatus.SUSPENDED
        except Exception:
            return False

    def _is_tenant_in_maintenance(self, tenant_id):
        """Check if tenant is in maintenance mode"""
        from apps.tenant.models import Client

        try:
            tenant = Client.objects.filter(id=tenant_id).first()
            return tenant and getattr(tenant, 'maintenance_mode', False)
        except Exception:
            return False