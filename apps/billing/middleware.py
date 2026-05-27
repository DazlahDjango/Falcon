import logging

from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.core.cache import cache
from django.utils import timezone
from .models import Subscription
from .constants import SubscriptionStatus

logger = logging.getLogger(__name__)


class SubscriptionGuardMiddleware(MiddlewareMixin):
    """
    Middleware to check subscription status for tenant requests.

    Features:
    - Bypasses platform admins (superuser + super_admin role)
    - Blocks invalid subscriptions
    - Enforces premium feature access
    - Uses caching for performance
    """

    # Paths that bypass subscription check
    BYPASS_PATHS = [
        '/api/v1/billing/webhook/',
        '/api/v1/auth/',
        '/api/v1/plans/',
        '/api/v1/billing/checkout/',
        '/api/v1/admin/',
        '/admin/',
        '/health/',
        '/ws/',
        # Dashboard and config endpoints
        '/api/v1/dashboard/',
        '/api/v1/config/',
        '/api/v1/sessions/',
        '/api/v1/accounts/me/',
        '/api/v1/notifications/',
        '/api/v1/tenant/settings/',
    ]

    # Feature to path mapping
    PREMIUM_FEATURES = {
        'custom_branding': ['/api/v1/tenant/branding/'],
        'api_access': ['/api/v1/external/'],
        'advanced_analytics': ['/api/v1/analytics/advanced/'],
        'custom_reports': ['/api/v1/reports/custom/'],
        'sso_enabled': ['/api/v1/sso/'],
    }

    def process_request(self, request):
        """Validate tenant subscription before request processing."""

        # ---------------------------------------------------------
        # BYPASS PUBLIC / SYSTEM PATHS
        # ---------------------------------------------------------
        for path in self.BYPASS_PATHS:
            if request.path.startswith(path):
                return None

        # ---------------------------------------------------------
        # GET TENANT CONTEXT
        # ---------------------------------------------------------
        # Try both attribute names for backward compatibility
        tenant_id = getattr(request, 'tenant_id', None) or getattr(request, 'current_tenant_id', None)

        # No tenant context means public endpoint
        if not tenant_id:
            return None

        # ---------------------------------------------------------
        # SUPER ADMIN / SUPERUSER BYPASS
        # ---------------------------------------------------------
        user = getattr(request, 'user', None)

        # Bypass for users with BOTH super_admin role AND superuser status,
        # or for users who have EITHER condition for broader admin access
        if user and user.is_authenticated:
            is_super_admin_strict = (
                user.is_superuser and getattr(user, 'role', None) == 'super_admin'
            )
            is_super_admin_lenient = (
                user.is_superuser or getattr(user, 'role', None) == 'super_admin'
            )
            
            if is_super_admin_strict or is_super_admin_lenient:
                log_msg = (
                    f"SubscriptionGuard bypassed for admin user {user.email}. "
                    f"is_superuser={user.is_superuser}, role={getattr(user, 'role', 'N/A')}"
                )
                logger.info(log_msg)
                return None

        # ---------------------------------------------------------
        # CHECK CACHE
        # ---------------------------------------------------------
        cache_key = f"subscription_valid_{tenant_id}"
        cached_data = cache.get(cache_key)

        error_msg = None
        subscription = None

        if cached_data is None:

            # ---------------------------------------------------------
            # FETCH SUBSCRIPTION
            # ---------------------------------------------------------
            subscription = Subscription.objects.get_current_for_tenant(
                tenant_id
            )

            # ---------------------------------------------------------
            # VALIDATE SUBSCRIPTION
            # ---------------------------------------------------------
            if not subscription:
                is_valid = False
                error_msg = "No active subscription found"

            elif subscription.status == SubscriptionStatus.EXPIRED:
                is_valid = False
                error_msg = "Subscription has expired"

            elif subscription.status == SubscriptionStatus.CANCELLED:
                is_valid = False
                error_msg = "Subscription has been cancelled"

            elif subscription.status == SubscriptionStatus.PAST_DUE:
                is_valid = False
                error_msg = "Subscription payment is past due"

            elif subscription.status == SubscriptionStatus.TRIALING:
                is_valid = True
                error_msg = None

                request.is_trial = True
                request.trial_days_remaining = (
                    subscription.trial_days_remaining
                )

                request.subscription = subscription

            else:
                is_valid = True
                error_msg = None

                request.subscription = subscription

            # ---------------------------------------------------------
            # CACHE RESULT
            # ---------------------------------------------------------
            cache.set(
                cache_key,
                (is_valid, error_msg),
                300
            )

        else:
            # ---------------------------------------------------------
            # LOAD FROM CACHE
            # ---------------------------------------------------------
            if isinstance(cached_data, tuple):
                is_valid, error_msg = cached_data
            else:
                is_valid = cached_data
                error_msg = None

            # Re-fetch subscription for downstream feature checks
            if is_valid:
                subscription = Subscription.objects.get_current_for_tenant(
                    tenant_id
                )

                if subscription:
                    request.subscription = subscription

        # ---------------------------------------------------------
        # BLOCK INVALID SUBSCRIPTIONS
        # ---------------------------------------------------------
        if not is_valid:
            return JsonResponse({
                'error': 'subscription_required',
                'message': error_msg or 'Active subscription required',
                'code': 'SUBSCRIPTION_REQUIRED'
            }, status=402)

        # ---------------------------------------------------------
        # FEATURE ACCESS CHECKS
        # ---------------------------------------------------------
        if hasattr(request, 'subscription') and request.subscription:

            feature_response = self._check_feature_access(
                request,
                tenant_id
            )

            if feature_response:
                return feature_response

        return None

    def _check_feature_access(self, request, tenant_id):
        """
        Check if tenant plan includes requested premium feature.
        """

        subscription = request.subscription
        plan = subscription.plan

        for feature, paths in self.PREMIUM_FEATURES.items():

            for path in paths:

                if request.path.startswith(path):

                    feature_enabled = getattr(plan, feature, False)

                    if not feature_enabled:

                        return JsonResponse({
                            'error': 'feature_not_available',
                            'message': (
                                f"{feature.replace('_', ' ').title()} "
                                f"requires an upgrade"
                            ),
                            'feature': feature,
                            'current_plan': plan.plan_type,
                            'required_plan':
                                self._get_required_plan_for_feature(feature)
                        }, status=403)

        return None

    def _get_required_plan_for_feature(self, feature):
        """Determine required plan for feature."""

        feature_plan_map = {
            'custom_branding': 'professional',
            'api_access': 'professional',
            'advanced_analytics': 'professional',
            'custom_reports': 'professional',
            'sso_enabled': 'enterprise',
        }

        return feature_plan_map.get(feature, 'professional')


class BillingAuditMiddleware(MiddlewareMixin):
    """
    Middleware to audit billing-related requests.
    """

    BILLING_PATHS = [
        '/api/v1/billing/',
        '/api/v1/subscriptions/',
        '/api/v1/invoices/',
    ]

    def process_request(self, request):

        if self._is_billing_request(request):
            request._billing_audit_start = timezone.now()

        return None

    def process_response(self, request, response):

        if (
            self._is_billing_request(request)
            and hasattr(request, '_billing_audit_start')
        ):

            duration = (
                timezone.now() - request._billing_audit_start
            ).total_seconds()

            user_id = (
                getattr(request.user, 'id', None)
                if hasattr(request, 'user')
                else None
            )

            user_email = (
                getattr(request.user, 'email', None)
                if hasattr(request, 'user')
                else None
            )

            audit_data = {
                'timestamp': timezone.now().isoformat(),
                'user_id': str(user_id) if user_id else None,
                'user_email': user_email,
                'tenant_id': str(
                    getattr(request, 'tenant_id', None) or getattr(request, 'current_tenant_id', '')
                ),
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'duration_ms': int(duration * 1000),
                'ip_address': self._get_client_ip(request),
            }

            cache_key = (
                f"billing_audit_{timezone.now().timestamp()}"
            )

            cache.set(cache_key, audit_data, 3600)

            logger.info(f"Billing audit: {audit_data}")

        return response

    def _is_billing_request(self, request):

        return any(
            request.path.startswith(path)
            for path in self.BILLING_PATHS
        )

    def _get_client_ip(self, request):

        x_forwarded_for = request.META.get(
            'HTTP_X_FORWARDED_FOR'
        )

        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]

        return request.META.get('REMOTE_ADDR')


class WebhookRateLimitMiddleware(MiddlewareMixin):
    """
    Rate limiting for webhook endpoints.
    """

    def process_request(self, request):

        if not request.path.startswith(
            '/api/v1/billing/webhook/'
        ):
            return None

        client_ip = self._get_client_ip(request)

        rate_key = f"webhook_rate_limit_{client_ip}"

        current_count = cache.get(rate_key, 0)

        if current_count >= 100:

            logger.warning(
                f"Webhook rate limit exceeded for IP {client_ip}"
            )

            return JsonResponse({
                'error': 'rate_limit_exceeded',
                'message': (
                    'Too many webhook requests. '
                    'Please try again later.'
                )
            }, status=429)

        cache.set(rate_key, current_count + 1, 60)

        return None

    def _get_client_ip(self, request):

        x_forwarded_for = request.META.get(
            'HTTP_X_FORWARDED_FOR'
        )

        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]

        return request.META.get('REMOTE_ADDR')


class TenantBillingContextMiddleware(MiddlewareMixin):
    """
    Attach billing/subscription context to request.
    """

    def process_request(self, request):

        tenant_id = getattr(request, 'tenant_id', None) or getattr(request, 'current_tenant_id', None)

        if not tenant_id:
            return None

        cache_key = f"tenant_billing_context_{tenant_id}"

        billing_context = cache.get(cache_key)

        subscription = getattr(request, 'subscription', None)

        if not billing_context:

            # fallback DB lookup
            if subscription is None:
                subscription = (
                    Subscription.objects.get_current_for_tenant(
                        tenant_id
                    )
                )

            if subscription:

                billing_context = {
                    'has_active_subscription':
                        subscription.is_active,

                    'is_on_trial':
                        subscription.is_on_trial,

                    'plan_type':
                        subscription.plan.plan_type,

                    'plan_name':
                        subscription.plan.name,

                    'trial_days_remaining':
                        subscription.trial_days_remaining,

                    'days_until_expiry':
                        subscription.days_until_expiry,

                    'subscription_status':
                        subscription.status,

                    'features':
                        subscription.plan.feature_dict,
                }

            else:

                billing_context = {
                    'has_active_subscription': False,
                    'is_on_trial': False,
                    'plan_type': None,
                    'plan_name': None,
                    'trial_days_remaining': 0,
                    'days_until_expiry': 0,
                    'subscription_status': None,
                    'features': {},
                }

            cache.set(cache_key, billing_context, 600)

        request.billing_context = billing_context
        request.tenant_subscription = subscription

        return None