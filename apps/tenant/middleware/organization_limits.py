import logging
from datetime import date
from django.core.cache import cache
from django.http import JsonResponse, HttpResponse
from django.utils.deprecation import MiddlewareMixin
from apps.tenant.constants import ResourceType

logger = logging.getLogger(__name__)


class HttpResponseTooManyRequests(HttpResponse):
    status_code = 429


class OrganizationLimitsMiddleware(MiddlewareMixin):
    def process_request(self, request):
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            if user.is_superuser or getattr(user, 'role', None) == 'super_admin':
                return None
        if self._should_skip(request):
            return None
        tenant_id = getattr(request, 'tenant_id', None)
        if not tenant_id:
            return None
        if self._is_tenant_suspended(tenant_id):
            logger.warning(f"Tenant {tenant_id} is suspended")
            return JsonResponse({'error': 'Tenant account is suspended. Please contact support.'}, status=403)
        if self._is_tenant_in_maintenance(tenant_id):
            logger.info(f"Tenant {tenant_id} is in maintenance mode")
            return JsonResponse({'error': 'Organization is under maintenance. Please try again later.'}, status=503)
        if not self._check_api_limit(tenant_id, request.path):
            return HttpResponseTooManyRequests("API limit exceeded for today. Please try again later.")
        return None

    def _should_skip(self, request):
        if '/health' in request.path or request.headers.get('X-Health-Check') == 'true':
            return True
        skip_paths = ['/admin/', '/health/', '/api/v1/auth/']
        for path in skip_paths:
            if request.path.startswith(path):
                return True
        return False

    def _check_api_limit(self, tenant_id, path):
        today = date.today().isoformat()
        cache_key = f"api_count_{tenant_id}_{today}"
        current = cache.get(cache_key, 0)
        if current == 0:
            from apps.tenant.models import OrganizationResource
            try:
                resource = OrganizationResource.objects.filter(
                    organization_id=tenant_id,
                    resource_type=ResourceType.API_CALLS_PER_DAY
                ).first()
                current = resource.current_value if resource else 0
                cache.set(cache_key, current, 86400)
            except Exception:
                current = 0
        limit = self._get_api_limit(tenant_id)
        if current >= limit:
            logger.warning(f"Tenant {tenant_id} exceeded API limit: {current}/{limit}")
            return False
        cache.set(cache_key, current + 1, 86400)
        if (current + 1) % 100 == 0:
            self._sync_api_count(tenant_id, current + 1)
        return True

    def _get_api_limit(self, tenant_id):
        from apps.tenant.models import OrganizationResource
        try:
            resource = OrganizationResource.objects.filter(
                organization_id=tenant_id,
                resource_type=ResourceType.API_CALLS_PER_DAY
            ).first()
            return resource.limit_value if resource else 10000
        except Exception:
            return 10000

    def _sync_api_count(self, tenant_id, count):
        from apps.tenant.models import OrganizationResource
        try:
            OrganizationResource.objects.filter(
                organization_id=tenant_id,
                resource_type=ResourceType.API_CALLS_PER_DAY
            ).update(current_value=count)
        except Exception as e:
            logger.error(f"Failed to sync API count: {e}")

    def _is_tenant_suspended(self, tenant_id):
        from apps.tenant.models import Organization
        try:
            org = Organization.objects.filter(id=tenant_id).first()
            return org and org.status == 'SUSPENDED'
        except Exception:
            return False
    
    def _is_tenant_in_maintenance(self, tenant_id):
        from apps.tenant.models import Organization
        try:
            org = Organization.objects.filter(id=tenant_id).first()
            return org and (getattr(org, 'maintenance_mode', False) or (org.metadata and org.metadata.get('maintenance_mode', False)))
        except Exception:
            return False