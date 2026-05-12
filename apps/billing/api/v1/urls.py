# apps/billing/api/v1/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    PlanViewSet,
    SubscriptionViewSet,
    InvoiceViewSet,
    PaymentViewSet,
    PaymentMethodViewSet,
    CheckoutViewSet,
    CustomerPortalViewSet,
    QuotaViewSet,
    WebhookView,
)

# ========== Main Router ==========
router = DefaultRouter()
router.register(r'plans', PlanViewSet, basename='plan')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'payment-methods', PaymentMethodViewSet, basename='payment-method')
router.register(r'checkout', CheckoutViewSet, basename='checkout')
router.register(r'portal', CustomerPortalViewSet, basename='portal')
router.register(r'quota', QuotaViewSet, basename='quota')

# ========== Nested Routers ==========
# Subscription nested routes
subscription_router = routers.NestedDefaultRouter(router, r'subscriptions', lookup='subscription')
subscription_router.register(r'invoices', InvoiceViewSet, basename='subscription-invoices')
subscription_router.register(r'payments', PaymentViewSet, basename='subscription-payments')
# Note: Don't register history here - use custom endpoint instead

# Invoice nested routes
invoice_router = routers.NestedDefaultRouter(router, r'invoices', lookup='invoice')
invoice_router.register(r'line-items', InvoiceViewSet, basename='invoice-line-items')
invoice_router.register(r'payments', PaymentViewSet, basename='invoice-payments')

# Plan nested routes
plan_router = routers.NestedDefaultRouter(router, r'plans', lookup='plan')
plan_router.register(r'features', PlanViewSet, basename='plan-features')
plan_router.register(r'subscriptions', SubscriptionViewSet, basename='plan-subscriptions')

urlpatterns = [
    # Webhook endpoint (no auth)
    path('webhook/stripe/', WebhookView.as_view(), name='stripe-webhook'),
    
    # Include router URLs
    path('', include(router.urls)),
    path('', include(subscription_router.urls)),
    path('', include(invoice_router.urls)),
    path('', include(plan_router.urls)),
    
    # ========== CUSTOM ACTION ENDPOINTS (use @action in views, not separate paths) ==========
    # These should be handled by @action decorators in the views, not separate paths
    # Remove these duplicate path definitions:
    # - subscription/current/
    # - subscription/status/
    # - plans/compare/
    # - quota/refresh/
    # - quota/limits/
    # - payment-methods/default/
    # - payment-methods/expiring-soon/
    # - invoices/download/
    # - invoices/outstanding/
    # - invoices/remind/
    # - subscriptions/cancel/
    # - subscriptions/reactivate/
    # - subscriptions/sync/
    # - subscriptions/history/
]

app_name = 'billing'