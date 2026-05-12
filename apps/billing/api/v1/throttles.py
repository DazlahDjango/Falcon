from apps.accounts.api.v1.throttles import UserRateThrottle, AnonRateThrottle
from rest_framework.throttling import SimpleRateThrottle

class BillingAnonRateThrottle(AnonRateThrottle):
    rate = '50/day'    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return None
        return super().get_cache_key(request, view)

class BillingUserRateThrottle(UserRateThrottle):
    rate = '200/hour'    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f'billing_{str(request.user.id)}'
        return None

class CheckoutRateThrottle(UserRateThrottle):
    rate = '10/hour'    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f'checkout_{str(request.user.id)}'
        return None

class WebhookRateThrottle(SimpleRateThrottle):
    rate = '1000/hour'
    def get_cache_key(self, request, view):
        ip = request.META.get('REMOTE_ADDR', '')
        return f'webhook_{ip}'

class SubscriptionOperationThrottle(UserRateThrottle):
    rate = '5/minute'    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f'sub_op_{str(request.user.id)}'
        return None

class PaymentMethodThrottle(UserRateThrottle):
    rate = '10/hour'    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f'pmethod_{str(request.user.id)}'
        return None

class InvoiceDownloadThrottle(UserRateThrottle):
    rate = '30/hour'
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f'invoice_dl_{str(request.user.id)}'
        return None

class TenantBillingRateThrottle(UserRateThrottle):
    rate = '500/hour'
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated and request.user.tenant_id:
            return f'tenant_billing_{str(request.user.tenant_id)}'
        return None

class SensitiveBillingThrottle(UserRateThrottle):
    rate = '3/minute'    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f'sensitive_billing_{str(request.user.id)}'
        return None