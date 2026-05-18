from rest_framework.throttling import SimpleRateThrottle

class DRRateThrottle(SimpleRateThrottle):
    scope = 'dr'
    rate = '2/hour'
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id
        return f'throttle_dr_{user_id}_{self.scope}'

class DRBurstThrottle(SimpleRateThrottle):
    scope = 'dr_burst'
    rate = '1/minute'
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        user_id = request.user.id
        return f'throttle_dr_burst_{user_id}_{self.scope}'