import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.core.cache import cache
from django.utils import timezone
from django.conf import settings
from .models import Subscription
from .constants import SubscriptionStatus

logger = logging.getLogger(__name__)

class SubscriptionGuardMiddleware(MiddlewareMixin):
    BYPASS_PATHS = ['/api/v1/billing/webhook/', '/api/v1/auth/', '/api/v1/plans/', '/api/v1/billing/checkout/', '/api/v1/admin/', '/admin/', '/health/', '/ws/', '/api/v1/dashboard/', '/api/v1/config/', '/api/v1/sessions/', '/api/v1/accounts/me/', '/api/v1/notifications/', '/api/v1/tenant/settings/']
    PREMIUM_FEATURES = {'custom_branding': ['/api/v1/tenant/branding/'], 'api_access': ['/api/v1/external/'], 'advanced_analytics': ['/api/v1/analytics/advanced/'], 'custom_reports': ['/api/v1/reports/custom/'], 'sso_enabled': ['/api/v1/sso/']}
    def process_request(self, request):
        for path in self.BYPASS_PATHS:
            if request.path.startswith(path):
                return None
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            if user.is_superuser or getattr(user, 'role', None) == 'super_admin':
                logger.info(f"SubscriptionGuard bypass for admin {user.email if user else 'system'}")
                request.is_admin_bypass = True
                return None
        tenant_id = getattr(request, 'tenant_id', None) or getattr(request, 'current_tenant_id', None)
        if not tenant_id:
            return None
        cache_key = f"subscription_valid_{tenant_id}"
        cached_data = cache.get(cache_key)
        if cached_data is None:
            subscription = Subscription.objects.get_current_for_tenant(tenant_id)
            if not subscription:
                is_valid, error_msg = False, "No active subscription found"
            elif subscription.status == SubscriptionStatus.EXPIRED:
                is_valid, error_msg = False, "Subscription has expired"
            elif subscription.status == SubscriptionStatus.CANCELLED:
                is_valid, error_msg = False, "Subscription has been cancelled"
            elif subscription.status == SubscriptionStatus.PAST_DUE:
                is_valid, error_msg = False, "Subscription payment is past due"
            else:
                is_valid, error_msg = True, None
                request.subscription = subscription
                if subscription.status == SubscriptionStatus.TRIALING:
                    request.is_trial = True
                    request.trial_days_remaining = subscription.trial_days_remaining
            cache.set(cache_key, (is_valid, error_msg), 300)
        else:
            is_valid, error_msg = cached_data if isinstance(cached_data, tuple) else (cached_data, None)
            if is_valid:
                subscription = Subscription.objects.get_current_for_tenant(tenant_id)
                if subscription:
                    request.subscription = subscription
        if not is_valid:
            return JsonResponse({'error': 'subscription_required', 'message': error_msg or 'Active subscription required', 'code': 'SUBSCRIPTION_REQUIRED'}, status=402)
        if hasattr(request, 'subscription') and request.subscription:
            feature_response = self._check_feature_access(request)
            if feature_response:
                return feature_response
        return None
    def _check_feature_access(self, request):
        subscription = request.subscription
        plan = subscription.plan
        for feature, paths in self.PREMIUM_FEATURES.items():
            for path in paths:
                if request.path.startswith(path):
                    feature_enabled = getattr(plan, feature, False)
                    if not feature_enabled:
                        return JsonResponse({'error': 'feature_not_available', 'message': f"{feature.replace('_', ' ').title()} requires an upgrade", 'feature': feature, 'current_plan': plan.plan_type, 'required_plan': self._get_required_plan_for_feature(feature)}, status=403)
        return None
    def _get_required_plan_for_feature(self, feature):
        return {'custom_branding': 'professional', 'api_access': 'professional', 'advanced_analytics': 'professional', 'custom_reports': 'professional', 'sso_enabled': 'enterprise'}.get(feature, 'professional')

class BillingAuditMiddleware(MiddlewareMixin):
    BILLING_PATHS = ['/api/v1/billing/', '/api/v1/subscriptions/', '/api/v1/invoices/']
    def process_request(self, request):
        if any(request.path.startswith(path) for path in self.BILLING_PATHS):
            request._billing_audit_start = timezone.now()
        return None
    def process_response(self, request, response):
        if any(request.path.startswith(path) for path in self.BILLING_PATHS) and hasattr(request, '_billing_audit_start'):
            duration = (timezone.now() - request._billing_audit_start).total_seconds()
            user = getattr(request, 'user', None)
            user_id = str(user.id) if user and user.is_authenticated else None
            user_email = user.email if user and user.is_authenticated else None
            tenant_id = getattr(request, 'tenant_id', None) or getattr(request, 'current_tenant_id', None)
            audit_data = {'timestamp': timezone.now().isoformat(), 'user_id': user_id, 'user_email': user_email, 'tenant_id': str(tenant_id) if tenant_id else None, 'method': request.method, 'path': request.path, 'status_code': response.status_code, 'duration_ms': int(duration * 1000), 'ip_address': self._get_client_ip(request)}
            cache_key = f"billing_audit_{int(timezone.now().timestamp())}"
            cache.set(cache_key, audit_data, 3600)
            logger.info(f"Billing audit: {audit_data}")
        return response
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        return x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')

class WebhookRateLimitMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if not request.path.startswith('/api/v1/billing/webhook/'):
            return None
        user = getattr(request, 'user', None)
        if user and user.is_authenticated and (user.is_superuser or getattr(user, 'role', None) == 'super_admin'):
            logger.info(f"Webhook rate limit bypass for admin {user.email}")
            return None
        client_ip = self._get_client_ip(request)
        rate_key = f"webhook_rate_limit_{client_ip}"
        current_count = cache.get(rate_key, 0)
        if current_count >= 100:
            logger.warning(f"Webhook rate limit exceeded for IP {client_ip}")
            return JsonResponse({'error': 'rate_limit_exceeded', 'message': 'Too many webhook requests. Please try again later.'}, status=429)
        cache.set(rate_key, current_count + 1, 60)
        return None
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        return x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')

class TenantBillingContextMiddleware(MiddlewareMixin):
    def process_request(self, request):
        tenant_id = getattr(request, 'tenant_id', None) or getattr(request, 'current_tenant_id', None)
        if not tenant_id:
            return None
        cache_key = f"tenant_billing_context_{tenant_id}"
        billing_context = cache.get(cache_key)
        subscription = getattr(request, 'subscription', None)
        if not billing_context:
            if subscription is None:
                subscription = Subscription.objects.get_current_for_tenant(tenant_id)
            if subscription:
                billing_context = {'has_active_subscription': subscription.is_active, 'is_on_trial': subscription.is_on_trial, 'plan_type': subscription.plan.plan_type, 'plan_name': subscription.plan.name, 'trial_days_remaining': subscription.trial_days_remaining, 'days_until_expiry': subscription.days_until_expiry, 'subscription_status': subscription.status, 'features': subscription.plan.feature_dict}
            else:
                billing_context = {'has_active_subscription': False, 'is_on_trial': False, 'plan_type': None, 'plan_name': None, 'trial_days_remaining': 0, 'days_until_expiry': 0, 'subscription_status': None, 'features': {}}
            cache.set(cache_key, billing_context, 600)
        request.billing_context = billing_context
        request.tenant_subscription = subscription
        return None

class SecurityHeadersMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if not settings.DEBUG:
            response['X-Frame-Options'] = 'DENY'
            response['X-Content-Type-Options'] = 'nosniff'
            response['X-XSS-Protection'] = '1; mode=block'
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
            response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
            response['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
            response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        return response

class IdempotencyMiddleware(MiddlewareMixin):
    IDEMPOTENT_METHODS = ['POST', 'PUT', 'PATCH']
    def process_request(self, request):
        if request.method not in self.IDEMPOTENT_METHODS:
            return None
        idempotency_key = request.headers.get('Idempotency-Key')
        if not idempotency_key:
            return None
        cache_key = f"idempotent_response_{request.path}_{idempotency_key}"
        cached_response = cache.get(cache_key)
        if cached_response:
            logger.info(f"Idempotent response returned for {request.path} with key {idempotency_key}")
            return JsonResponse(cached_response, status=200)
        return None
    def process_response(self, request, response):
        if request.method not in self.IDEMPOTENT_METHODS:
            return response
        idempotency_key = request.headers.get('Idempotency-Key')
        if idempotency_key and 200 <= response.status_code < 300:
            cache_key = f"idempotent_response_{request.path}_{idempotency_key}"
            try:
                cache.set(cache_key, response.json(), 86400)
            except:
                pass
        return response