"""
Billing middleware.

Implements quota enforcement and subscription validation middleware.
Tracks API calls and enforces quota limits per tenant.
"""
import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse, HttpResponseForbidden
from django.core.exceptions import PermissionDenied
from django.utils import timezone
from apps.billing.services.quota_service import QuotaService
from apps.billing.services.feature_service import FeatureService
from apps.billing.constants import QuotaResource
logger = logging.getLogger(__name__)

class QuotaEnforcementMiddleware(MiddlewareMixin):
    EXEMPT_PATHS = [
        '/health/',
        '/metrics/',
        '/admin/',
        '/api/v1/billing/webhook/',
        '/api/v1/auth/',
    ]
    
    def process_request(self, request):
        if any(request.path.startswith(path) for path in self.EXEMPT_PATHS):
            return None
        tenant = self._get_tenant(request)
        if not tenant:
            return None
        quota_service = QuotaService()
        is_available, current, max_limit, message = quota_service.check_quota(
            tenant, QuotaResource.API_CALLS
        )
        if not is_available:
            logger.warning(f"API quota exceeded for tenant {tenant.id}: {current}/{max_limit}")
            return JsonResponse(
                {
                    'error': 'API quota exceeded',
                    'message': message,
                    'code': 'QUOTA_EXCEEDED',
                    'limit': max_limit,
                    'current': current
                },
                status=429
            )
        request._should_increment_quota = True
        request._tenant = tenant
        return None
    
    def process_response(self, request, response):
        if hasattr(request, '_should_increment_quota') and request._should_increment_quota:
            if 200 <= response.status_code < 300:  # Only count successful responses
                tenant = getattr(request, '_tenant', None)
                if tenant:
                    quota_service = QuotaService()
                    quota_service.increment_usage(tenant, QuotaResource.API_CALLS)
        return response
    
    def _get_tenant(self, request):
        """Extract tenant from request."""
        if hasattr(request, 'tenant'):
            return request.tenant
        if hasattr(request, 'user') and request.user.is_authenticated:
            if hasattr(request.user, 'tenant_id') and request.user.tenant_id:
                from apps.tenant.models import Client
                try:
                    return Client.objects.get(id=request.user.tenant_id)
                except Client.DoesNotExist:
                    pass
        tenant_id = request.headers.get('X-Tenant-ID')
        if tenant_id:
            from apps.tenant.models import Client
            try:
                return Client.objects.get(id=tenant_id)
            except Client.DoesNotExist:
                pass
        
        return None

class SubscriptionValidationMiddleware(MiddlewareMixin):
    EXEMPT_PATHS = [
        '/health/',
        '/metrics/',
        '/admin/',
        '/api/v1/billing/',
        '/api/v1/billing/webhook/',
        '/api/v1/auth/',
        '/api/v1/subscription/checkout/',
        '/api/v1/subscription/portal/',
    ]
    EXEMPT_METHODS = ['OPTIONS']
    
    def process_request(self, request):
        if request.method in self.EXEMPT_METHODS:
            return None
        if any(request.path.startswith(path) for path in self.EXEMPT_PATHS):
            return None
        tenant = self._get_tenant(request)
        if not tenant:
            return None
        subscription = getattr(tenant, 'subscription', None)
        if not subscription:
            return JsonResponse(
                {
                    'error': 'No active subscription',
                    'message': 'Please subscribe to a plan to continue using the platform.',
                    'code': 'NO_SUBSCRIPTION'
                },
                status=402
            )
        if not subscription.is_active:
            return JsonResponse(
                {
                    'error': 'Subscription inactive',
                    'message': f'Your subscription is {subscription.status}. Please renew to continue.',
                    'code': 'SUBSCRIPTION_INACTIVE',
                    'status': subscription.status
                },
                status=402
            )
        if subscription.current_period_end and subscription.current_period_end < timezone.now():
            return JsonResponse(
                {
                    'error': 'Subscription expired',
                    'message': 'Your subscription has expired. Please renew.',
                    'code': 'SUBSCRIPTION_EXPIRED',
                    'expired_at': subscription.current_period_end.isoformat()
                },
                status=402
            )
        request._subscription = subscription
        return None
    
    def _get_tenant(self, request):
        if hasattr(request, 'tenant'):
            return request.tenant
        if hasattr(request, 'user') and request.user.is_authenticated:
            if hasattr(request.user, 'tenant_id') and request.user.tenant_id:
                from apps.tenant.models import Client
                try:
                    return Client.objects.get(id=request.user.tenant_id)
                except Client.DoesNotExist:
                    pass
        return None

class FeatureGateMiddleware(MiddlewareMixin):
    FEATURE_PATH_MAP = {
        '/api/v1/reports/advanced/': 'advanced_analytics',
        '/api/v1/sso/': 'sso',
        '/api/v1/webhooks/': 'webhooks',
        '/api/v1/export/': 'export',
    }
    
    def process_request(self, request):
        for path, feature in self.FEATURE_PATH_MAP.items():
            if request.path.startswith(path):
                tenant = self._get_tenant(request)
                if tenant:
                    feature_service = FeatureService()
                    if not feature_service.has_feature(tenant, feature):
                        return JsonResponse(
                            {
                                'error': 'Feature not available',
                                'message': f'The feature "{feature}" is not available in your current plan.',
                                'code': 'FEATURE_NOT_AVAILABLE',
                                'feature': feature
                            },
                            status=403
                        )
                break
        return None
    
    def _get_tenant(self, request):
        if hasattr(request, 'tenant'):
            return request.tenant
        if hasattr(request, 'user') and request.user.is_authenticated:
            if hasattr(request.user, 'tenant_id') and request.user.tenant_id:
                from apps.tenant.models import Client
                try:
                    return Client.objects.get(id=request.user.tenant_id)
                except Client.DoesNotExist:
                    pass
        return None

class BillingAuditMiddleware(MiddlewareMixin):
    AUDIT_PATHS = [
        '/api/v1/billing/subscription/',
        '/api/v1/billing/checkout/',
        '/api/v1/billing/portal/',
        '/api/v1/billing/payment-method/',
    ]
    
    def process_request(self, request):
        if any(request.path.startswith(path) for path in self.AUDIT_PATHS):
            logger.info(
                f"Billing request: {request.method} {request.path} "
                f"User: {getattr(request.user, 'id', 'anonymous')} "
                f"IP: {self._get_client_ip(request)}"
            )
        return None
    
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')