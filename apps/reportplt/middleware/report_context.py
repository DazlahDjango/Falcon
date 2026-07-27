# apps/reportplt/middleware/report_context.py
import logging
import threading
from typing import Optional
from django.utils.deprecation import MiddlewareMixin
from django.core.exceptions import PermissionDenied
from django.http import HttpRequest, HttpResponse
from apps.accounts.models import User
from apps.tenant.context import get_current_tenant_id, set_current_tenant_id, clear_current_tenant_id

logger = logging.getLogger(__name__)

class ReportContextMiddleware(MiddlewareMixin):
    """
    Middleware to set report context per request including tenant isolation,
    user context, and report-specific attributes.
    """
    
    _thread_local = threading.local()
    
    def process_request(self, request: HttpRequest):
        try:
            tenant_id = self._get_tenant_id(request)
            if tenant_id:
                set_current_tenant_id(tenant_id)
                self._thread_local.tenant_id = tenant_id
            user_id = self._get_user_id(request)
            if user_id:
                self._thread_local.user_id = user_id
            report_id = self._get_report_id(request)
            if report_id:
                self._thread_local.report_id = report_id
                request.report_id = report_id
            request.report_context = {
                'tenant_id': tenant_id,
                'user_id': user_id,
                'report_id': report_id,
                'is_authenticated': request.user.is_authenticated if hasattr(request, 'user') else False,
                'request_id': getattr(request, 'request_id', None)
            }
            logger.debug(f"Report context set: tenant={tenant_id}, user={user_id}, report={report_id}")
        except Exception as e:
            logger.warning(f"Failed to set report context: {str(e)}")
    
    def process_response(self, request: HttpRequest, response: HttpResponse):
        try:
            if hasattr(self._thread_local, 'tenant_id'):
                clear_current_tenant_id()
            for attr in ['tenant_id', 'user_id', 'report_id']:
                if hasattr(self._thread_local, attr):
                    delattr(self._thread_local, attr)
            if hasattr(request, 'report_context'):
                delattr(request, 'report_context')
        except Exception as e:
            logger.warning(f"Failed to clear report context: {str(e)}")
        return response
    
    def process_exception(self, request: HttpRequest, exception: Exception):
        try:
            if hasattr(self._thread_local, 'tenant_id'):
                clear_current_tenant_id()
        except:
            pass
        return None
    
    def _get_tenant_id(self, request: HttpRequest) -> Optional[str]:
        if hasattr(request, 'user') and request.user.is_authenticated:
            if hasattr(request.user, 'tenant_id') and request.user.tenant_id:
                return str(request.user.tenant_id)
        tenant_id = request.headers.get('X-Tenant-ID')
        if tenant_id:
            return tenant_id
        if hasattr(request, 'GET') and request.GET.get('tenant_id'):
            return request.GET.get('tenant_id')
        return None
    
    def _get_user_id(self, request: HttpRequest) -> Optional[str]:
        if hasattr(request, 'user') and request.user.is_authenticated:
            return str(request.user.id)
        user_id = request.headers.get('X-User-ID')
        if user_id:
            return user_id
        return None
    
    def _get_report_id(self, request: HttpRequest) -> Optional[str]:
        if hasattr(request, 'resolver_match') and request.resolver_match:
            kwargs = request.resolver_match.kwargs
            if 'report_id' in kwargs:
                return kwargs['report_id']
            if 'pk' in kwargs:
                return kwargs['pk']
        return None
    
    @classmethod
    def get_current_tenant(cls) -> Optional[str]:
        return getattr(cls._thread_local, 'tenant_id', None)
    
    @classmethod
    def get_current_user(cls) -> Optional[str]:
        return getattr(cls._thread_local, 'user_id', None)
    
    @classmethod
    def get_current_report(cls) -> Optional[str]:
        return getattr(cls._thread_local, 'report_id', None)
    
    @classmethod
    def get_context(cls) -> dict:
        return {
            'tenant_id': cls.get_current_tenant(),
            'user_id': cls.get_current_user(),
            'report_id': cls.get_current_report()
        }


class ReportContext:
    """
    Context manager for report context operations.
    Can be used in views and services to set temporary context.
    """
    
    def __init__(self, tenant_id: Optional[str] = None, user_id: Optional[str] = None, report_id: Optional[str] = None):
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.report_id = report_id
        self._old_tenant = None
        self._old_user = None
        self._old_report = None
    
    def __enter__(self):
        self._old_tenant = ReportContextMiddleware.get_current_tenant()
        self._old_user = ReportContextMiddleware.get_current_user()
        self._old_report = ReportContextMiddleware.get_current_report()
        if self.tenant_id:
            set_current_tenant_id(self.tenant_id)
            ReportContextMiddleware._thread_local.tenant_id = self.tenant_id
        if self.user_id:
            ReportContextMiddleware._thread_local.user_id = self.user_id
        if self.report_id:
            ReportContextMiddleware._thread_local.report_id = self.report_id
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._old_tenant:
            set_current_tenant_id(self._old_tenant)
            ReportContextMiddleware._thread_local.tenant_id = self._old_tenant
        else:
            clear_current_tenant_id()
            if hasattr(ReportContextMiddleware._thread_local, 'tenant_id'):
                delattr(ReportContextMiddleware._thread_local, 'tenant_id')
        if self._old_user:
            ReportContextMiddleware._thread_local.user_id = self._old_user
        elif hasattr(ReportContextMiddleware._thread_local, 'user_id'):
            delattr(ReportContextMiddleware._thread_local, 'user_id')
        if self._old_report:
            ReportContextMiddleware._thread_local.report_id = self._old_report
        elif hasattr(ReportContextMiddleware._thread_local, 'report_id'):
            delattr(ReportContextMiddleware._thread_local, 'report_id')


class ReportContextMiddlewareAsync:
    """
    Async version of ReportContextMiddleware for ASGI/WebSocket support.
    """
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope['type'] == 'websocket':
            try:
                headers = dict(scope.get('headers', []))
                tenant_id = headers.get(b'x-tenant-id', b'').decode()
                if tenant_id:
                    set_current_tenant_id(tenant_id)
                    ReportContextMiddleware._thread_local.tenant_id = tenant_id
                scope['report_context'] = {
                    'tenant_id': tenant_id,
                    'is_websocket': True
                }
            except Exception as e:
                logger.warning(f"Failed to set async report context: {str(e)}")
        return await self.app(scope, receive, send)