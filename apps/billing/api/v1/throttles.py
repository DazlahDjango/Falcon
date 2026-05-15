from apps.accounts.api.v1.throttles import UserRateThrottle, AnonRateThrottle
from rest_framework.throttling import SimpleRateThrottle
from django.core.cache import cache

class BillingCheckoutThrottle(UserRateThrottle):
    """
    Rate limit for checkout initialization.
    Prevents abuse of payment initialization.
    """
    rate = '10/hour'  # 10 checkouts per hour per user
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"throttle_checkout_{request.user.id}"
        return None


class BillingWebhookThrottle(SimpleRateThrottle):
    """
    Rate limit for webhook endpoint.
    Higher limit but still protected.
    """
    scope = 'webhook'
    rate = '100/minute'  # 100 webhooks per minute
    
    def get_cache_key(self, request, view):
        # Rate limit by IP address for webhooks
        ip_address = self.get_ident(request)
        return f"throttle_webhook_{ip_address}"


class PaymentInitiationThrottle(UserRateThrottle):
    """
    Rate limit for payment initiation.
    Prevents multiple rapid payment attempts.
    """
    rate = '5/minute'  # 5 payment initiations per minute
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"throttle_payment_{request.user.id}"
        return None


class SubscriptionChangeThrottle(UserRateThrottle):
    """
    Rate limit for subscription changes (upgrade/downgrade/cancel).
    Prevents rapid plan changes abuse.
    """
    rate = '3/hour'  # 3 subscription changes per hour
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request, 'tenant_id', None)
            if tenant_id:
                return f"throttle_subscription_change_{tenant_id}"
            return f"throttle_subscription_change_{request.user.id}"
        return None


class InvoiceDownloadThrottle(UserRateThrottle):
    """
    Rate limit for invoice downloads.
    Prevents excessive PDF generation.
    """
    rate = '30/minute'  # 30 invoice downloads per minute
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request, 'tenant_id', None)
            if tenant_id:
                return f"throttle_invoice_download_{tenant_id}"
            return f"throttle_invoice_download_{request.user.id}"
        return None


class WebhookRetryThrottle(UserRateThrottle):
    """
    Rate limit for manual webhook retry.
    Prevents abuse of retry mechanism.
    """
    rate = '10/hour'  # 10 manual retries per hour
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"throttle_webhook_retry_{request.user.id}"
        return None


class BillingReportThrottle(UserRateThrottle):
    """
    Rate limit for billing report generation.
    Prevents excessive report generation.
    """
    rate = '20/hour'  # 20 reports per hour
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request, 'tenant_id', None)
            if tenant_id:
                return f"throttle_billing_report_{tenant_id}"
            return f"throttle_billing_report_{request.user.id}"
        return None


class PaymentMethodThrottle(UserRateThrottle):
    """
    Rate limit for payment method operations.
    Prevents adding/removing payment methods too frequently.
    """
    rate = '10/hour'  # 10 payment method changes per hour
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request, 'tenant_id', None)
            if tenant_id:
                return f"throttle_payment_method_{tenant_id}"
            return f"throttle_payment_method_{request.user.id}"
        return None


class AnonBillingThrottle(AnonRateThrottle):
    """
    Rate limit for anonymous users on public billing endpoints.
    """
    rate = '20/hour'  # 20 requests per hour for anonymous
    
    def get_cache_key(self, request, view):
        ip_address = self.get_ident(request)
        return f"throttle_anon_billing_{ip_address}"


# Custom burst throttles for critical endpoints

class BurstCheckoutThrottle(SimpleRateThrottle):
    """
    Burst protection for checkout - very aggressive.
    """
    scope = 'burst_checkout'
    rate = '3/minute'  # Only 3 checkouts per minute
    
    def get_cache_key(self, request, view):
        ip_address = self.get_ident(request)
        return f"burst_throttle_checkout_{ip_address}"


class BurstWebhookThrottle(SimpleRateThrottle):
    """
    Burst protection for webhooks - catch flooding.
    """
    scope = 'burst_webhook'
    rate = '200/minute'  # Absolute max
    
    def get_cache_key(self, request, view):
        ip_address = self.get_ident(request)
        return f"burst_throttle_webhook_{ip_address}"


class TieredBillingThrottle(UserRateThrottle):
    """
    Tiered rate limiting based on subscription plan.
    Higher tier = higher limits.
    """
    rate = '100/hour'  # Default rate
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        
        # Get tenant's subscription plan for dynamic rate
        tenant_id = getattr(request, 'tenant_id', None)
        if tenant_id:
            cache_key = f"tenant_plan_{tenant_id}"
            plan_type = cache.get(cache_key)
            
            # Set rate based on plan
            if plan_type == 'enterprise':
                self.rate = '1000/hour'
            elif plan_type == 'professional':
                self.rate = '500/hour'
            elif plan_type == 'basic':
                self.rate = '200/hour'
            else:
                self.rate = '50/hour'
        
        return f"throttle_tiered_billing_{request.user.id}"