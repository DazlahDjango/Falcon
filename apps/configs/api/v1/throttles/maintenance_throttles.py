from rest_framework.throttling import SimpleRateThrottle

class MaintenanceRateThrottle(SimpleRateThrottle):
    scope = 'maintenance'
    rate = '20/hour'
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        tenant_id = getattr(request.user, 'tenant_id', 'global')
        return f'throttle_maintenance_{tenant_id}_{self.scope}'

class MaintenanceBurstThrottle(SimpleRateThrottle):
    scope = 'maintenance_burst'
    rate = '5/minute'
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        tenant_id = getattr(request.user, 'tenant_id', 'global')
        return f'throttle_maintenance_burst_{tenant_id}_{self.scope}'