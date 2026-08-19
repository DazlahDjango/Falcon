import threading
from django.utils.deprecation import MiddlewareMixin
import logging

logger = logging.getLogger(__name__)


class KPIContextMiddleware(MiddlewareMixin):
    _thread_local = threading.local()

    def process_request(self, request):
        tenant_id = (
            getattr(request, 'current_tenant_id', None) or
            getattr(request, 'tenant_id', None) or
            getattr(request, 'current_organization_id', None)
        )
        if not tenant_id and hasattr(request, 'user') and request.user.is_authenticated:
            user_tenant_id = getattr(request.user, 'tenant_id', None) or getattr(request.user, 'organization_id', None)
            if user_tenant_id:
                tenant_id = str(user_tenant_id)
        
        if tenant_id:
            self._thread_local.tenant_id = str(tenant_id)
            if not hasattr(request, 'current_tenant_id'):
                request.current_tenant_id = str(tenant_id)
            logger.debug(f"[KPI MIDDLEWARE] Set tenant context for request: {tenant_id}")
        
        if hasattr(request, 'user') and request.user.is_authenticated:
            self._thread_local.user_id = str(request.user.id)
            self._thread_local.user = request.user
        
        self._thread_local.request_id = getattr(request, 'request_id', None)

    def process_response(self, request, response):
        if hasattr(self._thread_local, 'tenant_id'):
            del self._thread_local.tenant_id
        if hasattr(self._thread_local, 'user_id'):
            del self._thread_local.user_id
        if hasattr(self._thread_local, 'user'):
            del self._thread_local.user
        if hasattr(self._thread_local, 'request_id'):
            del self._thread_local.request_id
        return response

    @classmethod
    def get_current_tenant_id(cls):
        return getattr(cls._thread_local, 'tenant_id', None)

    @classmethod
    def get_current_user_id(cls):
        return getattr(cls._thread_local, 'user_id', None)

    @classmethod
    def get_current_user(cls):
        return getattr(cls._thread_local, 'user', None)


# Alias for backward compatibility
ContextMiddleware = KPIContextMiddleware