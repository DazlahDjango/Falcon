# apps/reportplt/middleware/cache_headers.py
import hashlib
import logging
from typing import Optional
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpRequest, HttpResponse
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

class CacheHeadersMiddleware(MiddlewareMixin):
    """
    Middleware to manage cache headers for report responses.
    Provides intelligent caching based on report type, content, and user roles.
    """
    
    def __init__(self, get_response):
        super().__init__(get_response)
        self.cache_ttl = getattr(settings, 'REPORT_CACHE_TTL', 3600)
        self.dynamic_cache_ttl = getattr(settings, 'REPORT_DYNAMIC_CACHE_TTL', 300)
        self.private_cache_ttl = getattr(settings, 'REPORT_PRIVATE_CACHE_TTL', 60)
    
    def process_request(self, request: HttpRequest):
        if request.method in ['GET', 'HEAD']:
            if 'Cache-Control' not in request.headers:
                request._cache_control = self._get_cache_control(request)
        return None
    
    def process_response(self, request: HttpRequest, response: HttpResponse):
        if request.method not in ['GET', 'HEAD']:
            return response
        if not self._should_cache(request, response):
            return self._add_no_cache_headers(response)
        cache_ttl = self._get_cache_ttl(request, response)
        if cache_ttl > 0:
            return self._add_cache_headers(response, cache_ttl, request)
        return self._add_no_cache_headers(response)
    
    def _should_cache(self, request: HttpRequest, response: HttpResponse) -> bool:
        if response.status_code not in [200, 301, 302, 304]:
            return False
        if request.method not in ['GET', 'HEAD']:
            return False
        if 'private' in request.headers.get('Cache-Control', ''):
            return False
        if hasattr(request, 'user') and request.user.is_authenticated:
            if request.user.role in ['super_admin', 'client_admin']:
                return False
        report_context = getattr(request, 'report_context', {})
        if report_context.get('report_id'):
            return True
        if '/api/v1/reports/' in request.path:
            return True
        if '/api/v1/dashboards/' in request.path:
            return True
        if response.get('X-No-Cache', '').lower() == 'true':
            return False
        return True
    
    def _get_cache_ttl(self, request: HttpRequest, response: HttpResponse) -> int:
        report_context = getattr(request, 'report_context', {})
        if request.path.startswith('/api/v1/reports/'):
            if 'generate' in request.path or 'export' in request.path:
                return self.private_cache_ttl
            if 'dashboard' in request.path:
                return self.dynamic_cache_ttl
            return self.cache_ttl
        if request.path.startswith('/api/v1/dashboards/'):
            if 'snapshot' in request.path:
                return self.dynamic_cache_ttl
            return self.cache_ttl
        if '/api/v1/analytics/' in request.path:
            return self.dynamic_cache_ttl
        if hasattr(request, 'user') and request.user.is_authenticated:
            if request.user.role in ['executive', 'supervisor']:
                return self.cache_ttl
        cache_control = response.get('Cache-Control', '')
        if 'max-age' in cache_control:
            import re
            match = re.search(r'max-age=(\d+)', cache_control)
            if match:
                return int(match.group(1))
        return self.cache_ttl
    
    def _add_cache_headers(self, response: HttpResponse, ttl: int, request: HttpRequest) -> HttpResponse:
        response['Cache-Control'] = f'public, max-age={ttl}, s-maxage={ttl}'
        response['Vary'] = 'Accept-Encoding, Authorization'
        expires = timezone.now() + timezone.timedelta(seconds=ttl)
        response['Expires'] = expires.strftime('%a, %d %b %Y %H:%M:%S GMT')
        if hasattr(request, 'user') and request.user.is_authenticated:
            response['Cache-Control'] = f'private, max-age={min(ttl, 300)}'
        etag = self._generate_etag(response.content)
        if etag:
            response['ETag'] = etag
        return response
    
    def _add_no_cache_headers(self, response: HttpResponse) -> HttpResponse:
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate, private'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response
    
    def _generate_etag(self, content: bytes) -> Optional[str]:
        if not content:
            return None
        return f'"{hashlib.md5(content).hexdigest()}"'
    
    def _get_cache_control(self, request: HttpRequest) -> dict:
        cache_control = {}
        if 'Cache-Control' in request.headers:
            for directive in request.headers['Cache-Control'].split(','):
                directive = directive.strip()
                if '=' in directive:
                    key, value = directive.split('=', 1)
                    cache_control[key.strip()] = value.strip()
                else:
                    cache_control[directive] = True
        return cache_control


class ReportCacheHeaders:
    """
    Utility class for setting cache headers in views and services.
    """
    
    @staticmethod
    def set_report_cache(response: HttpResponse, ttl: int = 3600, private: bool = False):
        if private:
            response['Cache-Control'] = f'private, max-age={ttl}'
        else:
            response['Cache-Control'] = f'public, max-age={ttl}, s-maxage={ttl}'
        expires = timezone.now() + timezone.timedelta(seconds=ttl)
        response['Expires'] = expires.strftime('%a, %d %b %Y %H:%M:%S GMT')
        return response
    
    @staticmethod
    def set_no_cache(response: HttpResponse):
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response
    
    @staticmethod
    def set_etag(response: HttpResponse, content: bytes):
        etag = f'"{hashlib.md5(content).hexdigest()}"'
        response['ETag'] = etag
        return response
    
    @staticmethod
    def set_conditional_cache(response: HttpResponse, ttl: int = 3600, private: bool = False):
        response['Cache-Control'] = f'public, max-age={ttl}, must-revalidate'
        if private:
            response['Cache-Control'] = f'private, max-age={ttl}'
        expires = timezone.now() + timezone.timedelta(seconds=ttl)
        response['Expires'] = expires.strftime('%a, %d %b %Y %H:%M:%S GMT')
        return response
    
    @staticmethod
    def set_stale_while_revalidate(response: HttpResponse, ttl: int = 3600, stale_ttl: int = 86400):
        response['Cache-Control'] = f'public, max-age={ttl}, stale-while-revalidate={stale_ttl}'
        expires = timezone.now() + timezone.timedelta(seconds=ttl)
        response['Expires'] = expires.strftime('%a, %d %b %Y %H:%M:%S GMT')
        return response


class DashboardCacheHeaders:
    """
    Specialized cache headers for dashboard responses.
    """
    
    @staticmethod
    def set_dashboard_cache(response: HttpResponse, dashboard_id: str, ttl: int = 300):
        response['Cache-Control'] = f'public, max-age={ttl}, stale-while-revalidate=60'
        response['X-Dashboard-ID'] = dashboard_id
        expires = timezone.now() + timezone.timedelta(seconds=ttl)
        response['Expires'] = expires.strftime('%a, %d %b %Y %H:%M:%S GMT')
        return response
    
    @staticmethod
    def set_widget_cache(response: HttpResponse, widget_id: str, ttl: int = 60):
        response['Cache-Control'] = f'public, max-age={ttl}, stale-while-revalidate=30'
        response['X-Widget-ID'] = widget_id
        expires = timezone.now() + timezone.timedelta(seconds=ttl)
        response['Expires'] = expires.strftime('%a, %d %b %Y %H:%M:%S GMT')
        return response
    
    @staticmethod
    def set_realtime_dashboard(response: HttpResponse):
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['X-Realtime'] = 'true'
        return response