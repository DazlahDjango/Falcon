import time
import logging
import threading
from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from django.http import JsonResponse
from django.urls import resolve
logger = logging.getLogger(__name__)

class KPIContextMiddleware(MiddlewareMixin):
    _thread_local = threading.local()
    def process_request(self, request):
        if hasattr(request, 'tenant') and request.tenant:
            self._thread_local.tenant_id = request.tenant.id
        if hasattr(request, 'user') and request.user.is_authenticated:
            self._thread_local.user_id = request.user.id
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