import threading
from django.utils.deprecation import MiddlewareMixin
import logging

logger = logging.getLogger(__name__)


class KPIContextMiddleware(MiddlewareMixin):
    _thread_local = threading.local()

    def process_request(self, request):
        print(f"[KPI MIDDLEWARE] Processing request: {request.path}")
        print(f"[KPI MIDDLEWARE] current_tenant_id before: {getattr(request, 'current_tenant_id', 'NOT SET')}")
        # Use current_tenant_id from TenantMiddleware (not 'tenant')
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and hasattr(request, 'user') and request.user.is_authenticated:
            tenant_id = str(request.user.tenant_id)
            print(f"[KPI MIDDLEWARE] Got tenant_id from user: {tenant_id}")
        
        if tenant_id:
            self._thread_local.tenant_id = tenant_id
            # Also set it on request if missing
            if not hasattr(request, 'current_tenant_id'):
                request.current_tenant_id = tenant_id
                print(f"[KPI MIDDLEWARE] Set request.current_tenant_id = {tenant_id}")
        
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