from rest_framework.throttling import BaseThrottle, SimpleRateThrottle
from django.core.cache import cache
from django.utils import timezone
from django.conf import settings


class OrganizationRateThrottle(SimpleRateThrottle):
    scope = 'organization'
    DEFAULT_RATES = {
        'free': '1000/day',
        'basic': '5000/day',
        'professional': '25000/day',
        'enterprise': '100000/day',
    }

    def get_cache_key(self, request, view):
        org_id = self._get_org_id(request)
        if not org_id:
            return None
        today = timezone.now().date().isoformat()
        return f"throttle_org_{org_id}_{today}"

    def _get_org_id(self, request):
        org_id = request.headers.get('X-Organization-ID')
        if not org_id:
            org_id = getattr(request, 'organization_id', None)
        if not org_id:
            org = getattr(request, 'organization', None)
            if org:
                org_id = str(org.id) if hasattr(org, 'id') else None
        return org_id

    def _get_org_plan(self, request):
        org_id = self._get_org_id(request)
        if not org_id:
            return 'basic'
        cache_key = f"org_plan_{org_id}"
        plan = cache.get(cache_key)
        if plan:
            return plan
        try:
            from apps.tenant.models import Organization
            org = Organization.objects.filter(id=org_id, is_deleted=False).first()
            plan = org.subscription_tier if org else 'basic'
        except Exception:
            plan = 'basic'
        cache.set(cache_key, plan, 3600)
        return plan

    def get_rate(self):
        request = getattr(self, 'request', None)
        if not request:
            return self.DEFAULT_RATES['basic']
        plan = self._get_org_plan(request)
        rate = getattr(settings, f'ORG_RATE_LIMIT_{plan.upper()}', None)
        if not rate:
            rate = self.DEFAULT_RATES.get(plan, self.DEFAULT_RATES['basic'])
        return rate

    def allow_request(self, request, view):
        if request.user and request.user.is_superuser:
            return True
        if request.path in ['/health/', '/docs/', '/swagger/']:
            return True
        self.key = self.get_cache_key(request, view)
        if not self.key:
            return True
        self.rate = self.get_rate()
        if self.rate is None:
            return True
        self.num_requests, self.duration = self.parse_rate(self.rate)
        self.history = cache.get(self.key, [])
        self.now = timezone.now().timestamp()
        while self.history and self.history[-1] <= self.now - self.duration:
            self.history.pop()
        if len(self.history) >= self.num_requests:
            return False
        self.history.insert(0, self.now)
        cache.set(self.key, self.history, self.duration)
        return True

    def wait(self):
        if not self.history:
            return None
        remaining = self.duration - (self.now - self.history[-1])
        return max(0, remaining)


class OrganizationUserCreationThrottle(SimpleRateThrottle):
    scope = 'user_creation'
    DEFAULT_RATES = {
        'free': '10/day',
        'basic': '50/day',
        'professional': '200/day',
        'enterprise': '1000/day',
    }

    def get_cache_key(self, request, view):
        org_id = self._get_org_id(request)
        if not org_id:
            return None
        today = timezone.now().date().isoformat()
        return f"throttle_user_creation_org_{org_id}_{today}"

    def _get_org_id(self, request):
        org_id = request.headers.get('X-Organization-ID')
        if not org_id:
            org_id = getattr(request, 'organization_id', None)
        if not org_id:
            org = getattr(request, 'organization', None)
            if org:
                org_id = str(org.id) if hasattr(org, 'id') else None
        return org_id

    def _get_org_plan(self, request):
        org_id = self._get_org_id(request)
        if not org_id:
            return 'basic'
        cache_key = f"org_plan_{org_id}"
        plan = cache.get(cache_key)
        if plan:
            return plan
        try:
            from apps.tenant.models import Organization
            org = Organization.objects.filter(id=org_id, is_deleted=False).first()
            plan = org.subscription_tier if org else 'basic'
        except Exception:
            plan = 'basic'
        cache.set(cache_key, plan, 3600)
        return plan

    def get_rate(self):
        request = getattr(self, 'request', None)
        if not request:
            return self.DEFAULT_RATES['basic']
        plan = self._get_org_plan(request)
        return self.DEFAULT_RATES.get(plan, self.DEFAULT_RATES['basic'])

    def allow_request(self, request, view):
        if request.user and request.user.is_superuser:
            return True
        if not view.action == 'create' or 'user' not in view.basename:
            return True
        return super().allow_request(request, view)

    def wait(self):
        if not self.history:
            return None
        remaining = self.duration - (self.now - self.history[-1])
        return max(0, remaining)


class OrganizationApiThrottle(BaseThrottle):
    def __init__(self):
        self.org_throttle = None
        self.user_creation_throttle = None

    def allow_request(self, request, view):
        self.org_throttle = OrganizationRateThrottle()
        if not self.org_throttle.allow_request(request, view):
            return False
        if view.action == 'create' and 'user' in view.basename:
            self.user_creation_throttle = OrganizationUserCreationThrottle()
            if not self.user_creation_throttle.allow_request(request, view):
                return False
        return True

    def wait(self):
        wait_times = []
        if self.org_throttle:
            wait = self.org_throttle.wait()
            if wait:
                wait_times.append(wait)
        if self.user_creation_throttle:
            wait = self.user_creation_throttle.wait()
            if wait:
                wait_times.append(wait)
        return max(wait_times) if wait_times else None


class BurstRateThrottle(SimpleRateThrottle):
    scope = 'burst'
    rate = '60/minute'

    def get_cache_key(self, request, view):
        org_id = request.headers.get('X-Organization-ID')
        if not org_id:
            org_id = getattr(request, 'organization_id', None)
        if not org_id:
            return None
        current_minute = timezone.now().strftime('%Y%m%d%H%M')
        return f"throttle_burst_org_{org_id}_{current_minute}"

    def allow_request(self, request, view):
        if request.user and request.user.is_superuser:
            return True
        if request.path in ['/health/', '/docs/']:
            return True
        return super().allow_request(request, view)

    def wait(self):
        if not self.history:
            return None
        remaining = self.duration - (self.now - self.history[-1])
        return max(0, remaining)


class AdminOperationThrottle(SimpleRateThrottle):
    scope = 'admin_operation'
    rate = '30/hour'

    ADMIN_PATHS = [
        'suspend', 'activate', 'verify', 'restore',
        'migrate', 'delete', 'archive'
    ]

    def get_cache_key(self, request, view):
        org_id = request.headers.get('X-Organization-ID')
        if not org_id:
            org_id = getattr(request, 'organization_id', None)
        if not org_id:
            return None
        current_hour = timezone.now().strftime('%Y%m%d%H')
        return f"throttle_admin_org_{org_id}_{current_hour}"

    def allow_request(self, request, view):
        is_admin_operation = any(path in request.path for path in self.ADMIN_PATHS)
        if not is_admin_operation:
            return True
        if request.user and request.user.is_superuser:
            return True
        return super().allow_request(request, view)

    def wait(self):
        if not self.history:
            return None
        remaining = self.duration - (self.now - self.history[-1])
        return max(0, remaining)