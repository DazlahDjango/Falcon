from rest_framework.throttling import SimpleRateThrottle

class ConfigReadThrottle(SimpleRateThrottle):
    scope = 'config_read'
    rate = '100/minute'
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        tenant_id = getattr(request.user, 'tenant_id', 'global')
        return f'throttle_config_read_{tenant_id}_{self.scope}'

class ConfigWriteThrottle(SimpleRateThrottle):
    scope = 'config_write'
    rate = '30/minute'
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        tenant_id = getattr(request.user, 'tenant_id', 'global')
        return f'throttle_config_write_{tenant_id}_{self.scope}'