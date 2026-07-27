# apps/reportplt/api/v1/throttles/base.py
import time
import logging
from typing import Optional, Tuple, List
from django.core.cache import cache
from django.utils import timezone
from rest_framework.throttling import BaseThrottle, SimpleRateThrottle, AnonRateThrottle, UserRateThrottle, ScopedRateThrottle
from apps.tenant.context import get_current_tenant_id

logger = logging.getLogger(__name__)

class TenantRateThrottle(SimpleRateThrottle):
    """
    Rate limit that is applied per tenant.
    """
    scope = 'tenant'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request.user, 'tenant_id', None)
            if tenant_id:
                return self.cache_format % {
                    'scope': self.scope,
                    'ident': str(tenant_id)
                }
        return self.get_ident(request)

class TenantScopedThrottle(ScopedRateThrottle):
    """
    Scoped rate limit per tenant.
    """
    def get_cache_key(self, request, view):
        if hasattr(view, 'throttle_scope'):
            scope = view.throttle_scope
            tenant_id = get_current_tenant_id()
            if tenant_id:
                return self.cache_format % {
                    'scope': scope,
                    'ident': str(tenant_id)
                }
        return None

class PerUserTenantThrottle(UserRateThrottle):
    """
    Rate limit per user within a tenant.
    """
    scope = 'user_tenant'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request.user, 'tenant_id', None)
            if tenant_id:
                return f"{self.scope}:{str(tenant_id)}:{str(request.user.id)}"
        return None

class TieredThrottle(BaseThrottle):
    """
    Tiered throttle that applies different rates based on user tier/role.
    """
    
    def __init__(self):
        self.rates = {
            'free': '10/hour',
            'basic': '50/hour',
            'premium': '200/hour',
            'enterprise': '1000/hour',
        }
    
    def get_rate(self, request) -> Tuple[int, int]:
        user = request.user
        if not user or not user.is_authenticated:
            return 10, 3600
        role = getattr(user, 'role', 'staff')
        if role in ['super_admin', 'client_admin']:
            rate_str = self.rates.get('enterprise', '1000/hour')
        elif role == 'executive':
            rate_str = self.rates.get('premium', '200/hour')
        elif role == 'supervisor':
            rate_str = self.rates.get('basic', '50/hour')
        else:
            rate_str = self.rates.get('free', '10/hour')
        num, period = rate_str.split('/')
        period_map = {'second': 1, 'minute': 60, 'hour': 3600, 'day': 86400}
        return int(num), period_map.get(period, 3600)
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"tiered:{str(request.user.id)}:{view.__class__.__name__}"
        return f"tiered:anon:{self.get_ident(request)}"
    
    def allow_request(self, request, view):
        limit, period = self.get_rate(request)
        key = self.get_cache_key(request, view)
        if not key:
            return True
        history = cache.get(key, [])
        now = time.time()
        cutoff = now - period
        history = [ts for ts in history if ts > cutoff]
        if len(history) >= limit:
            wait = period - (now - history[0])
            self.wait = wait if wait > 0 else 0
            return False
        history.append(now)
        cache.set(key, history, period)
        self.wait = 0
        return True
    
    def wait(self):
        return self.wait

class CostBasedThrottle(BaseThrottle):
    """
    Rate limit based on cost of operation.
    """
    
    def __init__(self):
        self.cost_map = {
            'GET': 1,
            'POST': 5,
            'PUT': 5,
            'PATCH': 3,
            'DELETE': 10,
        }
        self.default_limit = 1000
        self.default_period = 3600
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"cost:{str(request.user.id)}"
        return f"cost:anon:{self.get_ident(request)}"
    
    def get_cost(self, request) -> int:
        method = request.method
        cost = self.cost_map.get(method, 3)
        if 'generate' in request.path:
            cost *= 10
        elif 'export' in request.path:
            cost *= 5
        elif 'analyze' in request.path:
            cost *= 8
        return cost
    
    def allow_request(self, request, view):
        cost = self.get_cost(request)
        key = self.get_cache_key(request, view)
        if not key:
            return True
        data = cache.get(key, {'usage': 0, 'reset_at': time.time() + self.default_period})
        now = time.time()
        if now > data.get('reset_at', 0):
            data = {'usage': 0, 'reset_at': now + self.default_period}
        if data['usage'] + cost > self.default_limit:
            self.wait = data['reset_at'] - now
            return False
        data['usage'] += cost
        cache.set(key, data, self.default_period)
        self.wait = 0
        return True
    
    def wait(self):
        return self.wait