from rest_framework.throttling import (
    BaseThrottle,
    AnonRateThrottle as DRFAnonRateThrottle,
    UserRateThrottle as DRFUserRateThrottle,
    ScopedRateThrottle as DRFScopedRateThrottle,
)

class BaseThrottle(BaseThrottle):
    def get_ident(self, request):
        if request.user and request.user.is_authenticated:
            return f"user_{request.user.id}"
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        remote_addr = request.META.get('REMOTE_ADDR')
        if remote_addr:
            return remote_addr
        return "unknown"
    
class AnonRateThrottle(DRFAnonRateThrottle, BaseThrottle):
    scope = 'anon'
    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        if not ident or ident == 'unkown':
            return None
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }
    
class UserRateThrottle(DRFUserRateThrottle, BaseThrottle):
    scope = 'user'
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = f"user_{request.user.id}"
        else:
            ident = self.get_ident(request)
        if not ident or ident == 'unknown':
            return None
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }
    
class ScopedRateThrottle(DRFScopedRateThrottle, BaseThrottle):
    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        if not ident or ident == 'unknown':
            return None
        scope = getattr(view, 'throttle_scope', None)
        if not scope:
            return None
        return self.cache_format % {
            'scope': scope,
            'ident': ident
        }