# apps/reportplt/api/v1/throttles/export.py
from typing import Optional
from django.core.cache import cache
from django.utils import timezone
from rest_framework.throttling import SimpleRateThrottle

class ReportExportThrottle(SimpleRateThrottle):
    """
    Rate limit for report export endpoints.
    """
    scope = 'report_export'
    rate = '20/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"export:{str(request.user.id)}"
        return None

class ExportUserThrottle(SimpleRateThrottle):
    """
    Per-user rate limit for exports.
    """
    scope = 'export_user'
    rate = '10/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"exp_user:{str(request.user.id)}"
        return None

class ExportTenantThrottle(SimpleRateThrottle):
    """
    Per-tenant rate limit for exports.
    """
    scope = 'export_tenant'
    rate = '100/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request.user, 'tenant_id', None)
            if tenant_id:
                return f"exp_tenant:{str(tenant_id)}"
        return None

class ExportFileSizeThrottle(SimpleRateThrottle):
    """
    Rate limit based on total exported file size.
    """
    scope = 'export_size'
    rate = '50/MB'
    
    def __init__(self):
        super().__init__()
        self.max_size = 50 * 1024 * 1024
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"exp_size:{str(request.user.id)}"
        return None
    
    def get_file_size(self, request) -> int:
        from django.http import QueryDict
        size = 0
        if request.method == 'POST':
            if request.data:
                size += len(json.dumps(request.data))
        return size
    
    def allow_request(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return True
        key = self.get_cache_key(request, view)
        file_size = self.get_file_size(request)
        data = cache.get(key, {'usage': 0, 'reset_at': timezone.now().timestamp() + 3600})
        now = timezone.now().timestamp()
        if now > data.get('reset_at', 0):
            data = {'usage': 0, 'reset_at': now + 3600}
        if data['usage'] + file_size > self.max_size:
            self.wait = data['reset_at'] - now
            return False
        data['usage'] += file_size
        cache.set(key, data, 3600)
        self.wait = 0
        return True

class ExportConcurrentThrottle(SimpleRateThrottle):
    """
    Limit concurrent exports per user.
    """
    scope = 'concurrent_export'
    rate = '3/minute'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"concurrent_exp:{str(request.user.id)}"
        return None
    
    def allow_request(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return True
        key = self.get_cache_key(request, view)
        active = cache.get(key, 0)
        if active >= 3:
            self.wait = 30
            return False
        cache.set(key, active + 1, 60)
        return True

class ExportFormatThrottle(SimpleRateThrottle):
    """
    Rate limit per export format.
    """
    scope = 'export_format'
    rate = '5/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            format = request.data.get('format', 'pdf')
            return f"exp_format:{str(request.user.id)}:{format}"
        return None