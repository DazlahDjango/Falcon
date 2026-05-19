from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlanViewSet,
    SubscriptionViewSet,
    TransactionViewSet,
    InvoiceViewSet,
    CheckoutViewSet,
    PaymentMethodViewSet,
    BillingPortalView,
    BillingAnalyticsViewSet,
)
from .views.webhook import WebhookView
router = DefaultRouter()
router.register(r'plans', PlanViewSet, basename='plan')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'checkout', CheckoutViewSet, basename='checkout')
router.register(r'payment-methods', PaymentMethodViewSet, basename='payment-method')
router.register(r'analytics', BillingAnalyticsViewSet, basename='billing-analytics')

app_name = 'billing'

urlpatterns = [
    # ViewSet URLs
    path('', include(router.urls)),
    
    # Webhook endpoint (no authentication - signature verified)
    path('webhook/paystack/', WebhookView.as_view(), name='paystack-webhook'),
    
    # Billing Portal (customer self-service)
    path('portal/', BillingPortalView.as_view(), name='billing-portal'),
    path('portal/access/', BillingPortalView.as_view(), name='billing-portal-access'),
    
    # Checkout specific endpoints (additional)
    path('checkout/verify/', CheckoutViewSet.as_view({'post': 'verify'}), name='checkout-verify'),
    path('checkout/callback/', CheckoutViewSet.as_view({'get': 'callback', 'post': 'callback'}), name='checkout-callback'),
    
    # Subscription specific actions
    path('subscriptions/<uuid:pk>/cancel/', SubscriptionViewSet.as_view({'post': 'cancel'}), name='subscription-cancel'),
    path('subscriptions/<uuid:pk>/renew/', SubscriptionViewSet.as_view({'post': 'renew'}), name='subscription-renew'),
    path('subscriptions/<uuid:pk>/upgrade/', SubscriptionViewSet.as_view({'post': 'upgrade'}), name='subscription-upgrade'),
    path('subscriptions/<uuid:pk>/downgrade/', SubscriptionViewSet.as_view({'post': 'downgrade'}), name='subscription-downgrade'),
    path('subscriptions/<uuid:pk>/invoices/', SubscriptionViewSet.as_view({'get': 'invoices'}), name='subscription-invoices'),
    path('subscriptions/<uuid:pk>/transactions/', SubscriptionViewSet.as_view({'get': 'transactions'}), name='subscription-transactions'),
    path('subscriptions/current/', SubscriptionViewSet.as_view({'get': 'current'}), name='current-subscription'),
    
    # Transaction specific actions
    path('transactions/verify/', TransactionViewSet.as_view({'post': 'verify'}), name='transaction-verify'),
    path('transactions/<uuid:pk>/refund/', TransactionViewSet.as_view({'post': 'refund'}), name='transaction-refund'),
    
    # Invoice specific actions
    path('invoices/<uuid:pk>/download/', InvoiceViewSet.as_view({'get': 'download'}), name='invoice-download'),
    path('invoices/<uuid:pk>/send/', InvoiceViewSet.as_view({'post': 'send'}), name='invoice-send'),
    path('invoices/<uuid:pk>/pay/', InvoiceViewSet.as_view({'post': 'pay'}), name='invoice-pay'),
    path('invoices/summary/', InvoiceViewSet.as_view({'get': 'summary'}), name='invoice-summary'),
    
    # Plan specific actions
    path('plans/popular/', PlanViewSet.as_view({'get': 'popular'}), name='plan-popular'),
    path('plans/compare/', PlanViewSet.as_view({'post': 'compare'}), name='plan-compare'),
    
    # Payment method specific actions
    path('payment-methods/<uuid:pk>/set-default/', PaymentMethodViewSet.as_view({'post': 'set_default'}), name='payment-method-set-default'),
    
    # Analytics endpoints
    path('analytics/summary/', BillingAnalyticsViewSet.as_view({'get': 'summary'}), name='analytics-summary'),
    path('analytics/revenue/', BillingAnalyticsViewSet.as_view({'get': 'revenue'}), name='analytics-revenue'),
    path('analytics/subscriptions/', BillingAnalyticsViewSet.as_view({'get': 'subscriptions'}), name='analytics-subscriptions'),
    path('analytics/tax/', BillingAnalyticsViewSet.as_view({'get': 'tax'}), name='analytics-tax'),
    path('analytics/forecast/', BillingAnalyticsViewSet.as_view({'get': 'forecast'}), name='analytics-forecast'),
]