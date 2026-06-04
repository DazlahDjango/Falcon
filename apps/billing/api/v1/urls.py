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
    UsageViewSet,
    AuditLogViewSet,
    EnterpriseOverrideViewSet,
    SystemSettingsView,
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
router.register(r'usage', UsageViewSet, basename='usage')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')
router.register(r'enterprise', EnterpriseOverrideViewSet, basename='enterprise')

app_name = 'billing'

urlpatterns = [
    path('system-settings/', SystemSettingsView.as_view(), name='system-settings'),
    path('', include(router.urls)),
    path('webhook/paystack/', WebhookView.as_view(), name='paystack-webhook'),
    path('portal/', BillingPortalView.as_view(), name='billing-portal'),
    path('checkout/verify/', CheckoutViewSet.as_view({'get': 'verify_checkout'}), name='checkout-verify'),
    path('checkout/callback/', CheckoutViewSet.as_view({'get': 'payment_callback'}), name='checkout-callback'),
    path('subscriptions/current/', SubscriptionViewSet.as_view({'get': 'current_subscription'}), name='current-subscription'),
    path('subscriptions/<uuid:pk>/cancel/', SubscriptionViewSet.as_view({'post': 'cancel_subscription'}), name='subscription-cancel'),
    path('subscriptions/<uuid:pk>/cancel-immediate/', SubscriptionViewSet.as_view({'post': 'cancel_immediate'}), name='subscription-cancel-immediate'),
    path('subscriptions/<uuid:pk>/renew/', SubscriptionViewSet.as_view({'post': 'renew_subscription'}), name='subscription-renew'),
    path('subscriptions/<uuid:pk>/upgrade/<uuid:new_plan_id>/', SubscriptionViewSet.as_view({'post': 'upgrade_plan'}), name='subscription-upgrade'),
    path('subscriptions/<uuid:pk>/downgrade/<uuid:new_plan_id>/', SubscriptionViewSet.as_view({'post': 'downgrade_plan'}), name='subscription-downgrade'),
    path('subscriptions/<uuid:pk>/extend-trial/', SubscriptionViewSet.as_view({'post': 'extend_trial'}), name='subscription-extend-trial'),
    path('subscriptions/<uuid:pk>/usage/', SubscriptionViewSet.as_view({'get': 'get_usage'}), name='subscription-usage'),
    path('subscriptions/admin/cancel/', SubscriptionViewSet.as_view({'post': 'admin_cancel'}), name='subscription-admin-cancel'),
    path('transactions/verify/', TransactionViewSet.as_view({'post': 'verify_transaction'}), name='transaction-verify'),
    path('transactions/summary/', TransactionViewSet.as_view({'get': 'transaction_summary'}), name='transaction-summary'),
    path('transactions/admin/stats/', TransactionViewSet.as_view({'get': 'admin_stats'}), name='transaction-admin-stats'),
    path('transactions/<uuid:pk>/refund/', TransactionViewSet.as_view({'post': 'refund_transaction'}), name='transaction-refund'),
    path('invoices/outstanding/', InvoiceViewSet.as_view({'get': 'outstanding_invoices'}), name='invoice-outstanding'),
    path('invoices/admin/overdue/', InvoiceViewSet.as_view({'get': 'admin_overdue'}), name='invoice-admin-overdue'),
    path('invoices/<uuid:pk>/download/', InvoiceViewSet.as_view({'get': 'download_invoice'}), name='invoice-download'),
    path('invoices/<uuid:pk>/send/', InvoiceViewSet.as_view({'post': 'send_email'}), name='invoice-send'),
    path('plans/public/', PlanViewSet.as_view({'get': 'public_plans'}), name='plan-public'),
    path('plans/comparison/', PlanViewSet.as_view({'get': 'plan_comparison'}), name='plan-comparison'),
    path('plans/<uuid:pk>/sync-to-paystack/', PlanViewSet.as_view({'post': 'sync_to_paystack'}), name='plan-sync'),
    path('payment-methods/<uuid:pk>/set-default/', PaymentMethodViewSet.as_view({'post': 'set_default'}), name='payment-method-set-default'),
    path('analytics/summary/', BillingAnalyticsViewSet.as_view({'get': 'billing_summary'}), name='analytics-summary'),
    path('analytics/revenue/', BillingAnalyticsViewSet.as_view({'get': 'revenue_report'}), name='analytics-revenue'),
    path('analytics/subscriptions/', BillingAnalyticsViewSet.as_view({'get': 'subscription_analytics'}), name='analytics-subscriptions'),
    path('analytics/admin/revenue/', BillingAnalyticsViewSet.as_view({'get': 'admin_revenue'}), name='analytics-admin-revenue'),
    path('analytics/admin/subscriptions/', BillingAnalyticsViewSet.as_view({'get': 'admin_subscriptions'}), name='analytics-admin-subscriptions'),
    path('usage/track/', UsageViewSet.as_view({'post': 'track_usage'}), name='usage-track'),
    path('usage/summary/', UsageViewSet.as_view({'get': 'usage_summary'}), name='usage-summary'),
    path('usage/limits/', UsageViewSet.as_view({'get': 'current_limits'}), name='usage-limits'),
    path('audit-logs/filter/', AuditLogViewSet.as_view({'get': 'filter_logs'}), name='audit-filter'),
    path('audit-logs/export/', AuditLogViewSet.as_view({'get': 'export_logs'}), name='audit-export'),
    path('audit-logs/summary/', AuditLogViewSet.as_view({'get': 'audit_summary'}), name='audit-summary'),
    path('enterprise/active/<uuid:tenant_id>/', EnterpriseOverrideViewSet.as_view({'get': 'get_active_override'}), name='enterprise-active'),
    path('enterprise/expire/', EnterpriseOverrideViewSet.as_view({'post': 'expire_overrides'}), name='enterprise-expire'),
    path('enterprise/dynamic-plans/create/', EnterpriseOverrideViewSet.as_view({'post': 'create_dynamic_plan'}), name='enterprise-dynamic-plan-create'),
    path('enterprise/dynamic-plans/<uuid:plan_id>/', EnterpriseOverrideViewSet.as_view({'put': 'update_dynamic_plan'}), name='enterprise-dynamic-plan-update'),
    path('enterprise/dynamic-plans/all/', EnterpriseOverrideViewSet.as_view({'get': 'list_dynamic_plans'}), name='enterprise-dynamic-plans-list'),
]