from enum import Enum

class SubscriptionStatus:
    TRIALING = 'trialing'
    ACTIVE = 'active'
    PAST_DUE = 'past_due'
    CANCELED = 'canceled'
    INCOMPLETE = 'incomplete'
    INCOMPLETE_EXPIRED = 'incomplete_expired'
    UNPAID = 'unpaid'
    SUSPENDED = 'suspended'
    CHOICES = [
        (TRIALING, 'Trialing'),
        (ACTIVE, 'Active'),
        (PAST_DUE, 'Past Due'),
        (CANCELED, 'Canceled'),
        (INCOMPLETE, 'Incomplete'),
        (INCOMPLETE_EXPIRED, 'Incomplete Expired'),
        (UNPAID, 'Unpaid'),
        (SUSPENDED, 'Suspended'),
    ]
    ACTIVE_STATUSES = [TRIALING, ACTIVE]
    TERMINAL_STATUSES = [CANCELED, INCOMPLETE_EXPIRED]

class InvoiceStatus:
    DRAFT = 'draft'
    OPEN = 'open'
    PAID = 'paid'
    UNCOLLECTIBLE = 'uncollectible'
    VOID = 'void'
    CHOICES = [
        (DRAFT, 'Draft'),
        (OPEN, 'Open'),
        (PAID, 'Paid'),
        (UNCOLLECTIBLE, 'Uncollectible'),
        (VOID, 'Void'),
    ]
    UNPAID_STATUSES = [DRAFT, OPEN]
    PAID_STATUSES = [PAID]

class PaymentStatus:
    SUCCEEDED = 'succeeded'
    PENDING = 'pending'
    FAILED = 'failed'
    REFUNDED = 'refunded'
    PARTIALLY_REFUNDED = 'partially_refunded'
    CHOICES = [
        (SUCCEEDED, 'Succeeded'),
        (PENDING, 'Pending'),
        (FAILED, 'Failed'),
        (REFUNDED, 'Refunded'),
        (PARTIALLY_REFUNDED, 'Partially Refunded'),
    ]
    SUCCESS_STATUSES = [SUCCEEDED]
    FAILURE_STATUSES = [FAILED, REFUNDED]

class BillingInterval:
    MONTHLY = 'month'
    YEARLY = 'year'
    CHOICES = [
        (MONTHLY, 'Monthly'),
        (YEARLY, 'Yearly'),
    ]

class PlanType:
    TRIAL = 'trial'
    BASIC = 'basic'
    PROFESSIONAL = 'professional'
    ENTERPRISE = 'enterprise'
    CHOICES = [
        (TRIAL, 'Trial'),
        (BASIC, 'Basic'),
        (PROFESSIONAL, 'Professional'),
        (ENTERPRISE, 'Enterprise'),
    ]
    PAID_PLANS = [BASIC, PROFESSIONAL, ENTERPRISE]

class PaymentMethodType:
    CARD = 'card'
    BANK_ACCOUNT = 'bank_account'
    MOBILE_MONEY = 'mobile_money'
    US_BANK = 'us_bank_account'
    CHOICES = [
        (CARD, 'Card'),
        (BANK_ACCOUNT, 'Bank Account'),
        (MOBILE_MONEY, 'Mobile Money'),
        (US_BANK, 'US Bank Account'),
    ]

class QuotaResource:
    USERS = 'users'
    ADMINS = 'admins'
    KPIS = 'kpis'
    KPI_FRAMEWORKS = 'kpi_frameworks'
    STORAGE_MB = 'storage_mb'
    API_CALLS = 'api_calls'
    ALL_RESOURCES = [USERS, ADMINS, KPIS, KPI_FRAMEWORKS, STORAGE_MB, API_CALLS]

class FeatureFlag:
    CUSTOM_BRANDING = 'custom_branding'
    API_ACCESS = 'api_access'
    SSO = 'sso'
    ADVANCED_ANALYTICS = 'advanced_analytics'
    AUDIT_LOGS = 'audit_logs'
    REPORTS = 'reports'
    EXPORT = 'export'
    WEBHOOKS = 'webhooks'
    MULTI_CURRENCY = 'multi_currency'
    PRIORITY_SUPPORT = 'priority_support'
    SLA = 'sla'
    WHITE_LABEL = 'white_label'
    ALL_FLAGS = [
        CUSTOM_BRANDING, API_ACCESS, SSO, ADVANCED_ANALYTICS,
        AUDIT_LOGS, REPORTS, EXPORT, WEBHOOKS, MULTI_CURRENCY,
        PRIORITY_SUPPORT, SLA, WHITE_LABEL
    ]


class WebhookEventType:
    CUSTOMER_SUBSCRIPTION_CREATED = 'customer.subscription.created'
    CUSTOMER_SUBSCRIPTION_UPDATED = 'customer.subscription.updated'
    CUSTOMER_SUBSCRIPTION_DELETED = 'customer.subscription.deleted'
    CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END = 'customer.subscription.trial_will_end'
    INVOICE_PAID = 'invoice.paid'
    INVOICE_PAYMENT_FAILED = 'invoice.payment_failed'
    INVOICE_PAYMENT_SUCCEEDED = 'invoice.payment_succeeded'
    PAYMENT_INTENT_SUCCEEDED = 'payment_intent.succeeded'
    PAYMENT_INTENT_PAYMENT_FAILED = 'payment_intent.payment_failed'
    CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed'
    CUSTOMER_UPDATED = 'customer.updated'
    CUSTOMER_DELETED = 'customer.deleted'
    
    SUBSCRIPTION_EVENTS = [
        CUSTOMER_SUBSCRIPTION_CREATED,
        CUSTOMER_SUBSCRIPTION_UPDATED,
        CUSTOMER_SUBSCRIPTION_DELETED,
        CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END,
    ]

    INVOICE_EVENTS = [
        INVOICE_PAID,
        INVOICE_PAYMENT_FAILED,
        INVOICE_PAYMENT_SUCCEEDED,
    ]
    
    PAYMENT_EVENTS = [
        PAYMENT_INTENT_SUCCEEDED,
        PAYMENT_INTENT_PAYMENT_FAILED,
    ]


class ErrorCode:
    SUBSCRIPTION_NOT_FOUND = 'subscription_not_found'
    SUBSCRIPTION_ALREADY_ACTIVE = 'subscription_already_active'
    SUBSCRIPTION_CANCELLATION_FAILED = 'subscription_cancellation_failed'
    PAYMENT_FAILED = 'payment_failed'
    PAYMENT_METHOD_INVALID = 'payment_method_invalid'
    INVOICE_NOT_FOUND = 'invoice_not_found'
    QUOTA_EXCEEDED = 'quota_exceeded'
    FEATURE_NOT_AVAILABLE = 'feature_not_available'
    WEBHOOK_SIGNATURE_INVALID = 'webhook_signature_invalid'
    WEBHOOK_EVENT_ALREADY_PROCESSED = 'webhook_event_already_processed'
    STRIPE_API_ERROR = 'stripe_api_error'
    INVALID_BILLING_INTERVAL = 'invalid_billing_interval'
    PLAN_NOT_FOUND = 'plan_not_found'
    TENANT_NOT_FOUND = 'tenant_not_found'

DEFAULT_QUOTA_LIMITS = {
    PlanType.TRIAL: {
        'max_users': 25,
        'max_admins': 5,
        'max_kpis': 100,
        'max_kpi_frameworks': 3,
        'max_storage_mb': 5120,  # 5GB
        'max_api_calls_per_day': 5000,
        'allow_custom_branding': True,
        'allow_api_access': False,
        'allow_sso': False,
        'allow_advanced_analytics': False,
        'allow_audit_logs': True,
        'allow_reports': True,
        'allow_export': True,
    },
    PlanType.BASIC: {
        'max_users': 50,
        'max_admins': 10,
        'max_kpis': 200,
        'max_kpi_frameworks': 5,
        'max_storage_mb': 10240,  # 10GB
        'max_api_calls_per_day': 10000,
        'allow_custom_branding': False,
        'allow_api_access': False,
        'allow_sso': False,
        'allow_advanced_analytics': False,
        'allow_audit_logs': True,
        'allow_reports': True,
        'allow_export': True,
    },
    PlanType.PROFESSIONAL: {
        'max_users': 500,
        'max_admins': 50,
        'max_kpis': 1000,
        'max_kpi_frameworks': 20,
        'max_storage_mb': 51200,  # 50GB
        'max_api_calls_per_day': 50000,
        'allow_custom_branding': True,
        'allow_api_access': True,
        'allow_sso': False,
        'allow_advanced_analytics': True,
        'allow_audit_logs': True,
        'allow_reports': True,
        'allow_export': True,
    },
    PlanType.ENTERPRISE: {
        'max_users': 10000,
        'max_admins': 500,
        'max_kpis': 10000,
        'max_kpi_frameworks': 100,
        'max_storage_mb': 512000,  # 500GB
        'max_api_calls_per_day': 500000,
        'allow_custom_branding': True,
        'allow_api_access': True,
        'allow_sso': True,
        'allow_advanced_analytics': True,
        'allow_audit_logs': True,
        'allow_reports': True,
        'allow_export': True,
    },
}