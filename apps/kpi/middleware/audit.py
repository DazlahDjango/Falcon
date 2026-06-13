import time
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class KPIRequestAuditMiddleware(MiddlewareMixin):
    KPI_PATHS = ('/api/kpi/', '/api/v1/kpi/', '/api/v1/kpis/')

    def process_request(self, request):
        request._kpi_start_time = time.time()

    def process_response(self, request, response):
        if not self._is_kpi_endpoint(request):
            return response

        start_time = getattr(request, '_kpi_start_time', time.time())
        duration = (time.time() - start_time) * 1000

        # Use current_tenant_id from TenantMiddleware
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and hasattr(request, 'user') and request.user.is_authenticated:
            tenant_id = str(request.user.tenant_id)

        audit_data = {
            'path': request.path,
            'method': request.method,
            'user_id': str(request.user.id) if request.user.is_authenticated else None,
            'tenant_id': tenant_id,
            'status_code': response.status_code,
            'duration_ms': round(duration, 2),
            'timestamp': time.time(),
        }

        if response.status_code >= 500:
            logger.error(f"KPI API error: {audit_data}")
        elif response.status_code >= 400:
            logger.warning(f"KPI API client error: {audit_data}")
        else:
            logger.debug(f"KPI API request: {audit_data}")

        return response

    def _is_kpi_endpoint(self, request) -> bool:
        return any(request.path.startswith(path) for path in self.KPI_PATHS)


# Alias for backward compatibility
AuditMiddleware = KPIRequestAuditMiddleware