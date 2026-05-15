import json
import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone

from .models import Subscription
from .constants import SubscriptionStatus
from .exceptions import TenantInactiveError, TenantSubscriptionRequiredError

logger = logging.getLogger(__name__)


class SubscriptionGuardMiddleware(MiddlewareMixin):
    """
    Middleware to check subscription status for tenant requests.
    Blocks access to premium features if subscription is invalid.
    """
    
    # Paths that bypass subscription check
    BYPASS_PATHS = [
        '/api/v1/billing/webhook/',
        '/api/v1/auth/',
        '/api/v1/plans/',
        '/api/v1/billing/checkout/',
        '/admin/',
        '/health/',
        '/ws/',
    ]
    
    # Feature to path mapping (requires active subscription)
    PREMIUM_FEATURES = {
        'custom_branding': ['/api/v1/tenant/branding/'],
        'api_access': ['/api/v1/external/'],
        'advanced_analytics': ['/api/v1/analytics/advanced/'],
        'custom_reports': ['/api/v1/reports/custom/'],
        'sso_enabled': ['/api/v1/sso/'],
    }
    
    def process_request(self, request):
        """Check subscription before processing request."""
        
        # Skip for bypass paths
        for path in self.BYPASS_PATHS:
            if request.path.startswith(path):
                return None
        
        # Get tenant from request (set by tenant middleware)
        tenant_id = getattr(request, 'tenant_id', None)
        
        if not tenant_id:
            # No tenant context - likely public endpoint
            return None
        
        # Check cache first
        cache_key = f"subscription_valid_{tenant_id}"
        is_valid = cache.get(cache_key)
        
        if is_valid is None:
            # Check subscription status
            subscription = Subscription.objects.get_current_for_tenant(tenant_id)
            
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
                # Trial has limited access
                is_valid = True
                error_msg = None
                request.is_trial = True
                request.trial_days_remaining = subscription.trial_days_remaining
            else:
                is_valid = True
                error_msg = None
                request.subscription = subscription
            
            # Cache for 5 minutes
            cache.set(cache_key, is_valid, 300)
        
        if not is_valid:
            return JsonResponse({
                'error': 'subscription_required',
                'message': error_msg or 'Active subscription required',
                'code': 'SUBSCRIPTION_REQUIRED'
            }, status=402)
        
        # Check feature access for premium features
        if hasattr(request, 'subscription') and request.subscription:
            self._check_feature_access(request, tenant_id)
        
        return None
    
    def _check_feature_access(self, request, tenant_id):
        """Check if tenant has access to requested feature."""
        subscription = request.subscription
        plan = subscription.plan
        
        for feature, paths in self.PREMIUM_FEATURES.items():
            for path in paths:
                if request.path.startswith(path):
                    feature_enabled = getattr(plan, feature, False)
                    
                    if not feature_enabled:
                        return JsonResponse({
                            'error': 'feature_not_available',
                            'message': f"{feature.replace('_', ' ').title()} requires an upgrade",
                            'feature': feature,
                            'current_plan': plan.plan_type,
                            'required_plan': self._get_required_plan_for_feature(feature)
                        }, status=403)
        
        return None
    
    def _get_required_plan_for_feature(self, feature):
        """Determine required plan for a feature."""
        feature_plan_map = {
            'custom_branding': 'professional',
            'api_access': 'professional',
            'advanced_analytics': 'professional',
            'custom_reports': 'professional',
            'sso_enabled': 'enterprise'
        }
        return feature_plan_map.get(feature, 'professional')


class BillingAuditMiddleware(MiddlewareMixin):
    """
    Middleware to audit billing-related requests.
    Logs all billing API calls for security.
    """
    
    BILLING_PATHS = ['/api/v1/billing/', '/api/v1/subscriptions/', '/api/v1/invoices/']
    
    def process_request(self, request):
        """Start audit timer."""
        if self._is_billing_request(request):
            request._billing_audit_start = timezone.now()
        return None
    
    def process_response(self, request, response):
        """Log audit for billing request."""
        if self._is_billing_request(request) and hasattr(request, '_billing_audit_start'):
            duration = (timezone.now() - request._billing_audit_start).total_seconds()
            
            # Get user info
            user_id = getattr(request.user, 'id', None) if hasattr(request, 'user') else None
            user_email = getattr(request.user, 'email', None) if hasattr(request, 'user') else None
            
            # Log to cache/queue for batch processing
            audit_data = {
                'timestamp': timezone.now().isoformat(),
                'user_id': str(user_id) if user_id else None,
                'user_email': user_email,
                'tenant_id': str(getattr(request, 'tenant_id', '')),
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'duration_ms': int(duration * 1000),
                'ip_address': self._get_client_ip(request)
            }
            
            # Store in cache for async processing
            cache_key = f"billing_audit_{timezone.now().timestamp()}"
            cache.set(cache_key, audit_data, 3600)
            
            logger.info(f"Billing audit: {audit_data}")
        
        return response
    
    def _is_billing_request(self, request):
        """Check if request is a billing request."""
        for path in self.BILLING_PATHS:
            if request.path.startswith(path):
                return True
        return False
    
    def _get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class WebhookRateLimitMiddleware(MiddlewareMixin):
    """
    Rate limiting middleware specifically for webhook endpoints.
    Prevents webhook flooding attacks.
    """
    
    def process_request(self, request):
        """Rate limit webhook requests."""
        if not request.path.startswith('/api/v1/billing/webhook/'):
            return None
        
        # Get client IP
        client_ip = self._get_client_ip(request)
        
        # Rate limit key
        rate_key = f"webhook_rate_limit_{client_ip}"
        
        # Get current count
        current_count = cache.get(rate_key, 0)
        
        # Webhook limits: 100 per minute
        if current_count >= 100:
            logger.warning(f"Webhook rate limit exceeded for IP {client_ip}")
            return JsonResponse({
                'error': 'rate_limit_exceeded',
                'message': 'Too many webhook requests',
                'retry_after': 60
            }, status=429)
        
        # Increment counter
        cache.set(rate_key, current_count + 1, 60)
        
        return None
    
    def _get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class TenantBillingContextMiddleware(MiddlewareMixin):
    """
    Middleware to set billing context for tenant.
    Attaches billing information to request for easy access.
    """
    
    def process_request(self, request):
        """Attach billing context to request."""
        tenant_id = getattr(request, 'tenant_id', None)
        
        if not tenant_id:
            return None
        
        # Get or create billing context
        cache_key = f"tenant_billing_context_{tenant_id}"
        billing_context = cache.get(cache_key)
        
        if not billing_context:
            subscription = Subscription.objects.get_current_for_tenant(tenant_id)
            
            if subscription:
                billing_context = {
                    'has_active_subscription': subscription.is_active,
                    'is_on_trial': subscription.is_on_trial,
                    'plan_type': subscription.plan.plan_type,
                    'plan_name': subscription.plan.name,
                    'trial_days_remaining': subscription.trial_days_remaining,
                    'days_until_expiry': subscription.days_until_expiry,
                    'subscription_status': subscription.status,
                    'features': subscription.plan.feature_dict
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
                    'features': {}
                }
            
            # Cache for 10 minutes
            cache.set(cache_key, billing_context, 600)
        
        request.billing_context = billing_context
        
        return None