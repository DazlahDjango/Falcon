# apps/tenant/api/v1/throttles/tenant_limits.py
"""
Rate limiting classes for Tenant API.

Controls how many requests a tenant can make within a time period.
Prevents abuse and ensures fair usage across tenants.
"""

from rest_framework.throttling import BaseThrottle, SimpleRateThrottle
from django.core.cache import cache
from django.utils import timezone
from django.conf import settings


class TenantRateThrottle(SimpleRateThrottle):
    """
    Rate limit based on tenant ID.

    Limits API calls per tenant per day/month based on subscription plan.

    Rate limits by plan:
        - Trial: 1,000 requests/day
        - Basic: 5,000 requests/day
        - Professional: 25,000 requests/day
        - Enterprise: 100,000 requests/day

    How it works:
        1. Identifies tenant from request headers
        2. Looks up tenant's subscription plan
        3. Applies appropriate rate limit
        4. Returns 429 if limit exceeded
    """

    scope = 'tenant'

    # Default rate limits (requests per day)
    DEFAULT_RATES = {
        'trial': '1000/day',
        'basic': '5000/day',
        'professional': '25000/day',
        'enterprise': '100000/day',
    }

    def get_cache_key(self, request, view):
        """
        Generate unique cache key for this tenant.

        Format: throttle_tenant_{tenant_id}_{date}
        Example: throttle_tenant_550e8400_2024-01-15
        """
        tenant_id = self.get_tenant_id(request)

        if not tenant_id:
            return None

        # Add date to ensure daily reset
        today = timezone.now().date().isoformat()

        return f"throttle_tenant_{tenant_id}_{today}"

    def get_tenant_id(self, request):
        """Extract tenant ID from request."""
        # Check headers first
        tenant_id = request.headers.get('X-Tenant-ID')

        if not tenant_id:
            tenant_id = getattr(request, 'tenant_id', None)

        if not tenant_id:
            tenant_id = getattr(request, 'tenant', None)
            if tenant_id:
                tenant_id = str(tenant_id.id) if hasattr(
                    tenant_id, 'id') else None

        return tenant_id

    def get_tenant_plan(self, request):
        """Get tenant's subscription plan to determine rate limit."""
        tenant_id = self.get_tenant_id(request)

        if not tenant_id:
            return 'basic'  # Default plan

        # Try to get from cache first
        cache_key = f"tenant_plan_{tenant_id}"
        plan = cache.get(cache_key)

        if plan:
            return plan

        # Get from database
        try:
            from apps.tenant.models import Client

            tenant = Client.objects.filter(
                id=tenant_id, is_deleted=False).first()
            if tenant:
                plan = tenant.subscription_plan
            else:
                plan = 'basic'
        except Exception:
            plan = 'basic'

        # Cache for 1 hour
        cache.set(cache_key, plan, 3600)

        return plan

    def get_rate(self):
        """
        Determine the rate limit based on tenant's plan.
        """
        request = getattr(self, 'request', None)
        if not request:
            return self.DEFAULT_RATES['basic']

        plan = self.get_tenant_plan(request)

        # Get rate from settings or use default
        rate = getattr(settings, f'TENANT_RATE_LIMIT_{plan.upper()}', None)

        if not rate:
            rate = self.DEFAULT_RATES.get(plan, self.DEFAULT_RATES['basic'])

        return rate

    def allow_request(self, request, view):
        """
        Check if the request should be allowed.

        Returns:
            True: Request allowed
            False: Rate limit exceeded, should return 429
        """
        # Skip rate limiting for super admins
        if request.user and request.user.is_superuser:
            return True

        # Skip for health check and docs endpoints
        if request.path in ['/health/', '/docs/', '/swagger/']:
            return True

        # Get cache key
        self.key = self.get_cache_key(request, view)
        if not self.key:
            return True

        # Get rate limit string and parse it
        self.rate = self.get_rate()
        if self.rate is None:
            return True

        # Parse rate (e.g., '1000/day' -> num_requests=1000, duration=86400)
        self.num_requests, self.duration = self.parse_rate(self.rate)

        # Get current count
        self.history = cache.get(self.key, [])
        self.now = timezone.now().timestamp()

        # Remove old requests outside the time window
        while self.history and self.history[-1] <= self.now - self.duration:
            self.history.pop()

        # Check if limit is exceeded
        if len(self.history) >= self.num_requests:
            return False

        # Add current request to history
        self.history.insert(0, self.now)
        cache.set(self.key, self.history, self.duration)
        return True

    def wait(self):
        """
        Return the number of seconds to wait before next request.
        """
        if not self.history:
            return None

        remaining_duration = self.duration - (self.now - self.history[-1])
        return max(0, remaining_duration)


class TenantUserCreationThrottle(SimpleRateThrottle):
    """
    Rate limit for user creation per tenant.

    Limits how many new users can be created per day by a tenant.
    Prevents spam and abuse.

    Rate limits by plan:
        - Trial: 10 users/day
        - Basic: 50 users/day
        - Professional: 200 users/day
        - Enterprise: 1000 users/day
    """

    scope = 'user_creation'

    DEFAULT_RATES = {
        'trial': '10/day',
        'basic': '50/day',
        'professional': '200/day',
        'enterprise': '1000/day',
    }

    def get_cache_key(self, request, view):
        """Generate cache key for user creation rate limit."""
        tenant_id = self.get_tenant_id(request)

        if not tenant_id:
            return None

        today = timezone.now().date().isoformat()
        return f"throttle_user_creation_tenant_{tenant_id}_{today}"

    def get_tenant_id(self, request):
        """Extract tenant ID from request."""
        tenant_id = request.headers.get('X-Tenant-ID')

        if not tenant_id:
            tenant_id = getattr(request, 'tenant_id', None)

        if not tenant_id:
            tenant_id = getattr(request, 'tenant', None)
            if tenant_id:
                tenant_id = str(tenant_id.id) if hasattr(
                    tenant_id, 'id') else None

        return tenant_id

    def get_tenant_plan(self, request):
        """Get tenant's subscription plan."""
        tenant_id = self.get_tenant_id(request)

        if not tenant_id:
            return 'basic'

        cache_key = f"tenant_plan_{tenant_id}"
        plan = cache.get(cache_key)

        if plan:
            return plan

        try:
            from apps.tenant.models import Client

            tenant = Client.objects.filter(
                id=tenant_id, is_deleted=False).first()
            plan = tenant.subscription_plan if tenant else 'basic'
        except Exception:
            plan = 'basic'

        cache.set(cache_key, plan, 3600)
        return plan

    def get_rate(self):
        """Get rate limit based on tenant plan."""
        request = getattr(self, 'request', None)
        if not request:
            return self.DEFAULT_RATES['basic']

        plan = self.get_tenant_plan(request)
        return self.DEFAULT_RATES.get(plan, self.DEFAULT_RATES['basic'])

    def allow_request(self, request, view):
        """Check if user creation is allowed."""
        # Skip for super admins
        if request.user and request.user.is_superuser:
            return True

        # Only apply to user creation endpoints
        if not view.action == 'create' or 'user' not in view.basename:
            return True

        return super().allow_request(request, view)


class TenantApiThrottle(BaseThrottle):
    """
    Combined throttle for tenant API endpoints.

    Applies multiple throttles:
        - Rate limit per tenant
        - User creation limit per tenant

    This is the main throttle class to use for tenant API views.
    """

    def __init__(self):
        self.tenant_throttle = None
        self.user_creation_throttle = None

    def allow_request(self, request, view):
        """
        Check all applicable throttles.

        Returns:
            True: All throttles passed
            False: At least one throttle failed
        """
        # Check tenant rate throttle
        self.tenant_throttle = TenantRateThrottle()
        if not self.tenant_throttle.allow_request(request, view):
            return False

        # Check user creation throttle (only for user creation endpoints)
        if view.action == 'create' and 'user' in view.basename:
            self.user_creation_throttle = TenantUserCreationThrottle()
            if not self.user_creation_throttle.allow_request(request, view):
                return False

        return True

    def wait(self):
        """
        Return the maximum wait time from all throttles.
        """
        wait_times = []

        if self.tenant_throttle:
            wait = self.tenant_throttle.wait()
            if wait:
                wait_times.append(wait)

        if self.user_creation_throttle:
            wait = self.user_creation_throttle.wait()
            if wait:
                wait_times.append(wait)

        return max(wait_times) if wait_times else None


class BurstRateThrottle(SimpleRateThrottle):
    """
    Short-term burst rate limiting.

    Prevents sudden spikes in traffic by limiting requests per minute.
    This is in addition to the daily limit.

    Rate: 60 requests per minute for all plans
    """

    scope = 'burst'
    rate = '60/minute'

    def get_cache_key(self, request, view):
        """Generate cache key for burst rate limiting."""
        tenant_id = request.headers.get('X-Tenant-ID')

        if not tenant_id:
            tenant_id = getattr(request, 'tenant_id', None)

        if not tenant_id:
            return None

        # Use minute-level granularity
        current_minute = timezone.now().strftime('%Y%m%d%H%M')

        return f"throttle_burst_tenant_{tenant_id}_{current_minute}"

    def allow_request(self, request, view):
        """Check burst rate limit."""
        # Skip for super admins
        if request.user and request.user.is_superuser:
            return True

        # Skip for health check
        if request.path in ['/health/', '/docs/']:
            return True

        return super().allow_request(request, view)


class AdminOperationThrottle(SimpleRateThrottle):
    """
    Rate limit for admin operations.

    Limits sensitive admin operations like:
        - Tenant suspension/activation
        - Backup creation/restoration
        - Domain verification

    Rate: 30 requests per hour
    """

    scope = 'admin_operation'
    rate = '30/hour'

    ADMIN_PATHS = [
        'suspend', 'activate', 'verify', 'restore',
        'backup', 'migrate', 'delete'
    ]

    def get_cache_key(self, request, view):
        """Generate cache key for admin operations."""
        tenant_id = request.headers.get('X-Tenant-ID')

        if not tenant_id:
            tenant_id = getattr(request, 'tenant_id', None)

        if not tenant_id:
            return None

        current_hour = timezone.now().strftime('%Y%m%d%H')

        return f"throttle_admin_tenant_{tenant_id}_{current_hour}"

    def allow_request(self, request, view):
        """Check if admin operation is allowed."""
        # Only apply to admin operations
        is_admin_operation = any(
            path in request.path for path in self.ADMIN_PATHS)

        if not is_admin_operation:
            return True

        # Skip for super admins
        if request.user and request.user.is_superuser:
            return True

        return super().allow_request(request, view)
