# apps/reportplt/api/v1/throttles/generation.py
import hashlib
import json
from typing import Optional
from django.core.cache import cache
from django.utils import timezone
from rest_framework.throttling import SimpleRateThrottle
from apps.reportplt.models import Report

class ReportGenerationThrottle(SimpleRateThrottle):
    """
    Rate limit for report generation endpoints.
    """
    scope = 'report_generation'
    rate = '5/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"gen:{str(request.user.id)}"
        return None

class ReportGenerationUserThrottle(SimpleRateThrottle):
    """
    Per-user rate limit for report generation.
    """
    scope = 'report_generation_user'
    rate = '10/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            report_id = request.parser_context.get('kwargs', {}).get('report_id')
            if report_id:
                return f"gen_user:{str(request.user.id)}:{report_id}"
            return f"gen_user:{str(request.user.id)}"
        return None

class ReportGenerationTenantThrottle(SimpleRateThrottle):
    """
    Per-tenant rate limit for report generation.
    """
    scope = 'report_generation_tenant'
    rate = '50/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request.user, 'tenant_id', None)
            if tenant_id:
                return f"gen_tenant:{str(tenant_id)}"
        return None

class ConcurrentGenerationThrottle(SimpleRateThrottle):
    """
    Limit concurrent report generation per user.
    """
    scope = 'concurrent_generation'
    rate = '2/minute'
    
    def __init__(self):
        super().__init__()
        self.active_generations = {}
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"concurrent:{str(request.user.id)}"
        return None
    
    def allow_request(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return True
        key = self.get_cache_key(request, view)
        if not key:
            return True
        active = cache.get(key, 0)
        if active >= 2:
            self.wait = 30
            return False
        cache.set(key, active + 1, 60)
        return True

class ReportSizeThrottle(SimpleRateThrottle):
    """
    Rate limit based on report size/complexity.
    """
    scope = 'report_size'
    rate = '10/hour'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"size:{str(request.user.id)}"
        return None
    
    def get_weight(self, request) -> int:
        weight = 1
        params = request.query_params
        if params.get('include_charts', 'false').lower() == 'true':
            weight += 2
        if params.get('include_tables', 'false').lower() == 'true':
            weight += 1
        if params.get('include_commentary', 'false').lower() == 'true':
            weight += 1
        if params.get('format'):
            weight += 1
        return weight
    
    def allow_request(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return True
        key = self.get_cache_key(request, view)
        weight = self.get_weight(request)
        data = cache.get(key, {'usage': 0, 'reset_at': timezone.now().timestamp() + 3600})
        now = timezone.now().timestamp()
        if now > data.get('reset_at', 0):
            data = {'usage': 0, 'reset_at': now + 3600}
        if data['usage'] + weight > 10:
            self.wait = data['reset_at'] - now
            return False
        data['usage'] += weight
        cache.set(key, data, 3600)
        self.wait = 0
        return True