# apps/accounts/throttles/tenant.py

from .base import BaseThrottle, UserRateThrottle

class TenantRateThrottle(UserRateThrottle):
    scope = 'tenant'
    
    def get_cache_key(self, request, view):
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and request.user and request.user.is_authenticated:
            tenant_id = str(request.user.tenant_id)
        if tenant_id:
            return self.cache_format % {
                'scope': self.scope,
                'ident': f"tenant_{tenant_id}"
            }
        return super().get_cache_key(request, view)

class TenantUserCreationThrottle(TenantRateThrottle):
    scope = 'tenant_user_creation'
    rate = '50/day'


class TenantAPIThrottle(TenantRateThrottle):
    scope = 'tenant_api'
    rate = '10000/day'