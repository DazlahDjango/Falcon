from rest_framework.throttling import SimpleRateThrottle

class BackupRateThrottle(SimpleRateThrottle):
    scope = 'backup'
    rate = '10/hour'
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        tenant_id = getattr(request.user, 'tenant_id', 'global')
        return f'throttle_backup_{tenant_id}_{self.scope}'

class RestoreRateThrottle(SimpleRateThrottle):
    scope = 'restore'
    rate = '5/hour'
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        tenant_id = getattr(request.user, 'tenant_id', 'global')
        return f'throttle_restore_{tenant_id}_{self.scope}'

class BackupBurstThrottle(SimpleRateThrottle):
    scope = 'backup_burst'
    rate = '2/minute'
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        tenant_id = getattr(request.user, 'tenant_id', 'global')
        return f'throttle_backup_burst_{tenant_id}_{self.scope}'