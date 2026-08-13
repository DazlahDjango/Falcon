from django.db import models

# ============================================================================
# Plan Constants
# ============================================================================

class PlanType(models.TextChoices):
    """Subscription plan types matching the proposal."""
    TRIAL = 'trial', 'Trial'
    BASIC = 'basic', 'Basic'
    PROFESSIONAL = 'professional', 'Professional'
    ENTERPRISE = 'enterprise', 'Enterprise'


class BillingInterval(models.TextChoices):
    """Billing interval options."""
    MONTHLY = 'monthly', 'Monthly'
    YEARLY = 'yearly', 'Yearly'


class QuotaResource(models.TextChoices):
    """Quota resource types for tracking."""
    USERS = 'users', 'Users'
    ADMINS = 'admins', 'Admins'
    KPIS = 'kpis', 'KPIs'
    STORAGE_MB = 'storage_mb', 'Storage MB'
    API_CALLS = 'api_calls', 'API Calls'
    DEPARTMENTS = 'departments', 'Departments'


class FeatureFlag:
    """Feature flag constants."""
    CUSTOM_BRANDING = 'custom_branding'
    API_ACCESS = 'api_access'
    SSO = 'sso_enabled'
    ADVANCED_ANALYTICS = 'advanced_analytics'
    AUDIT_LOGS = 'audit_logs'
    REPORTS = 'custom_reports'
    EXPORT = 'data_export'
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


# Plan limits (from proposal)
PLAN_LIMITS = {
    PlanType.TRIAL: {
        'max_users': 10,
        'max_kpis': 50,
        'max_departments': 5,
        'max_storage_mb': 100,
        'trial_days': 14,
    },
    PlanType.BASIC: {
        'max_users': 50,
        'max_kpis': 100,
        'max_departments': 10,
        'max_storage_mb': 500,
        'price_monthly': 5000,  # KES
        'price_yearly': 50000,  # KES (2 months free)
    },
    PlanType.PROFESSIONAL: {
        'max_users': 500,
        'max_kpis': 1000,
        'max_departments': 50,
        'max_storage_mb': 5000,
        'price_monthly': 25000,
        'price_yearly': 250000,
    },
    PlanType.ENTERPRISE: {
        'max_users': -1,  # Unlimited
        'max_kpis': -1,   # Unlimited
        'max_departments': -1,
        'max_storage_mb': -1,
        'price_monthly': 100000,
        'price_yearly': 1000000,
    },
}


# ============================================================================
# Subscription Status Constants
# ============================================================================

class SubscriptionStatus(models.TextChoices):
    """Subscription lifecycle statuses."""
    ACTIVE = 'active', 'Active'
    TRIALING = 'trialing', 'Trialing'
    PAST_DUE = 'past_due', 'Past Due'
    CANCELLED = 'cancelled', 'Cancelled'
    EXPIRED = 'expired', 'Expired'
    PENDING_CANCELLATION = 'pending_cancellation', 'Pending Cancellation'


# ============================================================================
# Transaction Constants
# ============================================================================

class TransactionStatus(models.TextChoices):
    """Transaction processing statuses."""
    PENDING = 'pending', 'Pending'
    SUCCESS = 'success', 'Success'
    FAILED = 'failed', 'Failed'
    REFUNDED = 'refunded', 'Refunded'
    DISPUTED = 'disputed', 'Disputed'


class TransactionType(models.TextChoices):
    """Types of transactions."""
    SUBSCRIPTION = 'subscription', 'Subscription Creation'
    RENEWAL = 'renewal', 'Renewal'
    UPGRADE = 'upgrade', 'Upgrade'
    DOWNGRADE = 'downgrade', 'Downgrade'
    REFUND = 'refund', 'Refund'
    ONE_TIME = 'one_time', 'One Time Payment'


# ============================================================================
# Invoice Constants
# ============================================================================

class InvoiceStatus(models.TextChoices):
    """Invoice lifecycle statuses."""
    DRAFT = 'draft', 'Draft'
    PENDING = 'pending', 'Pending'
    PAID = 'paid', 'Paid'
    OVERDUE = 'overdue', 'Overdue'
    CANCELLED = 'cancelled', 'Cancelled'
    REFUNDED = 'refunded', 'Refunded'


# ============================================================================
# Webhook Constants
# ============================================================================

class WebhookEventType(models.TextChoices):
    """PayStack webhook event types."""
    CHARGE_SUCCESS = 'charge.success', 'Charge Success'
    SUBSCRIPTION_CREATE = 'subscription.create', 'Subscription Create'
    SUBSCRIPTION_DISABLE = 'subscription.disable', 'Subscription Disable'
    SUBSCRIPTION_ENABLE = 'subscription.enable', 'Subscription Enable'
    INVOICE_CREATE = 'invoice.create', 'Invoice Create'
    INVOICE_UPDATE = 'invoice.update', 'Invoice Update'
    INVOICE_PAYMENT_FAILED = 'invoice.payment_failed', 'Invoice Payment Failed'
    PAYMENTREQUEST_SUCCESS = 'paymentrequest.success', 'Payment Request Success'


class WebhookProcessingStatus(models.TextChoices):
    """Webhook processing statuses."""
    PENDING = 'pending', 'Pending'
    PROCESSED = 'processed', 'Processed'
    FAILED = 'failed', 'Failed'
    DUPLICATE = 'duplicate', 'Duplicate'


# ============================================================================
# Payment Method Constants
# ============================================================================

class PaymentMethodType(models.TextChoices):
    """Types of payment methods."""
    CARD = 'card', 'Card'
    BANK = 'bank', 'Bank Account'
    USSD = 'ussd', 'USSD'
    QR = 'qr', 'QR Code'
    MOBILE_MONEY = 'mobile_money', 'Mobile Money'


class PaymentMethodStatus(models.TextChoices):
    """Payment method statuses."""
    ACTIVE = 'active', 'Active'
    EXPIRED = 'expired', 'Expired'
    REMOVED = 'removed', 'Removed'
    DEFAULT = 'default', 'Default'


# ============================================================================
# Audit Log Constants
# ============================================================================

class AuditAction(models.TextChoices):
    """Audit log action types."""
    CREATE = 'create', 'Create'
    UPDATE = 'update', 'Update'
    DELETE = 'delete', 'Delete'
    VIEW = 'view', 'View'
    PAYMENT = 'payment', 'Payment'
    REFUND = 'refund', 'Refund'
    CANCEL = 'cancel', 'Cancel'
    RENEW = 'renew', 'Renew'
    UPGRADE = 'upgrade', 'Upgrade'
    DOWNGRADE = 'downgrade', 'Downgrade'
    WEBHOOK = 'webhook', 'Webhook'
    LOGIN = 'login', 'Login'
    LOGOUT = 'logout', 'Logout'


class AuditResource(models.TextChoices):
    """Audit log resource types."""
    PLAN = 'plan', 'Plan'
    SUBSCRIPTION = 'subscription', 'Subscription'
    TRANSACTION = 'transaction', 'Transaction'
    INVOICE = 'invoice', 'Invoice'
    PAYMENT_METHOD = 'payment_method', 'Payment Method'
    WEBHOOK = 'webhook', 'Webhook'
    CUSTOMER = 'customer', 'Customer'


# ============================================================================
# Billing Settings Constants
# ============================================================================

class Currency(models.TextChoices):
    """Supported currencies."""
    KES = 'KES', 'Kenyan Shilling'
    USD = 'USD', 'US Dollar'
    GBP = 'GBP', 'British Pound'
    EUR = 'EUR', 'Euro'


# Default values
DEFAULT_CURRENCY = Currency.KES
DEFAULT_TAX_RATE = 0.16  # 16% VAT for Kenya
INVOICE_PREFIX = 'FALCON'
PAYMENT_TIMEOUT_MINUTES = 30
IDEMPOTENCY_TTL_HOURS = 24
WEBHOOK_RETRY_MAX_ATTEMPTS = 3
WEBHOOK_RETRY_DELAY_MINUTES = 5
# Feature Flags (from proposal)
FEATURE_FLAGS = {
    'custom_branding': 'Custom branding and theming',
    'api_access': 'REST API access',
    'sso_enabled': 'Single Sign-On integration',
    'advanced_analytics': 'Advanced analytics and reporting',
    'audit_logs': 'Comprehensive audit logging',
    'custom_reports': 'Custom report builder',
    'priority_support': '24/7 priority support',
    'unlimited_users': 'Unlimited user accounts',
    'unlimited_kpis': 'Unlimited KPIs',
    'data_export': 'Bulk data export',
    'webhooks': 'Custom webhook endpoints',
    'white_label': 'White label solution',
}

# Plan to feature mapping
PLAN_FEATURES = {
    PlanType.TRIAL: [
        'audit_logs',
    ],
    PlanType.BASIC: [
        'audit_logs',
        'data_export',
    ],
    PlanType.PROFESSIONAL: [
        'custom_branding',
        'api_access',
        'advanced_analytics',
        'audit_logs',
        'data_export',
        'custom_reports',
    ],
    PlanType.ENTERPRISE: [
        'custom_branding',
        'api_access',
        'sso_enabled',
        'advanced_analytics',
        'audit_logs',
        'custom_reports',
        'priority_support',
        'unlimited_users',
        'unlimited_kpis',
        'data_export',
        'webhooks',
        'white_label',
    ],
}