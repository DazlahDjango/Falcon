export const PLAN_TYPES = { TRIAL: 'trial', BASIC: 'basic', PROFESSIONAL: 'professional', ENTERPRISE: 'enterprise' };
export const PLAN_TYPES_DISPLAY = { trial: 'Trial', basic: 'Basic', professional: 'Professional', enterprise: 'Enterprise' };
export const PLAN_TYPE_ORDER = { trial: 0, basic: 1, professional: 2, enterprise: 3 };

export const BILLING_INTERVALS = { MONTHLY: 'monthly', YEARLY: 'yearly' };
export const BILLING_INTERVALS_DISPLAY = { monthly: 'Monthly', yearly: 'Yearly' };
export const BILLING_INTERVAL_DAYS = { monthly: 30, yearly: 365 };

export const SUBSCRIPTION_STATUS = {
    ACTIVE: 'active', TRIALING: 'trialing', PAST_DUE: 'past_due',
    CANCELLED: 'cancelled', EXPIRED: 'expired', PENDING_CANCELLATION: 'pending_cancellation',
};
export const SUBSCRIPTION_STATUS_DISPLAY = {
    active: 'Active', trialing: 'Trial', past_due: 'Past Due',
    cancelled: 'Cancelled', expired: 'Expired', pending_cancellation: 'Pending Cancellation',
};
export const SUBSCRIPTION_STATUS_COLORS = {
    active: 'success', trialing: 'info', past_due: 'warning',
    cancelled: 'secondary', expired: 'error', pending_cancellation: 'warning',
};
export const SUBSCRIPTION_STATUS_ICONS = {
    active: 'CheckCircle', trialing: 'Rocket', past_due: 'AlertTriangle',
    cancelled: 'XCircle', expired: 'Clock', pending_cancellation: 'MinusCircle',
};

export const TRANSACTION_STATUS = { PENDING: 'pending', SUCCESS: 'success', FAILED: 'failed', REFUNDED: 'refunded', DISPUTED: 'disputed' };
export const TRANSACTION_STATUS_DISPLAY = { pending: 'Pending', success: 'Success', failed: 'Failed', refunded: 'Refunded', disputed: 'Disputed' };
export const TRANSACTION_STATUS_COLORS = { pending: 'warning', success: 'success', failed: 'error', refunded: 'info', disputed: 'error' };

export const TRANSACTION_TYPES = {
    SUBSCRIPTION: 'subscription', RENEWAL: 'renewal', UPGRADE: 'upgrade',
    DOWNGRADE: 'downgrade', REFUND: 'refund', ONE_TIME: 'one_time',
};
export const TRANSACTION_TYPES_DISPLAY = {
    subscription: 'Subscription Creation', renewal: 'Renewal', upgrade: 'Plan Upgrade',
    downgrade: 'Plan Downgrade', refund: 'Refund', one_time: 'One Time Payment',
};

export const INVOICE_STATUS = { DRAFT: 'draft', PENDING: 'pending', PAID: 'paid', OVERDUE: 'overdue', CANCELLED: 'cancelled', REFUNDED: 'refunded' };
export const INVOICE_STATUS_DISPLAY = { draft: 'Draft', pending: 'Pending', paid: 'Paid', overdue: 'Overdue', cancelled: 'Cancelled', refunded: 'Refunded' };
export const INVOICE_STATUS_COLORS = { draft: 'secondary', pending: 'warning', paid: 'success', overdue: 'error', cancelled: 'secondary', refunded: 'info' };

export const PAYMENT_METHOD_TYPES = { CARD: 'card', BANK: 'bank', USSD: 'ussd', QR: 'qr', MOBILE_MONEY: 'mobile_money' };
export const PAYMENT_METHOD_TYPES_DISPLAY = { card: 'Credit/Debit Card', bank: 'Bank Account', ussd: 'USSD', qr: 'QR Code', mobile_money: 'Mobile Money' };
export const PAYMENT_METHOD_STATUS = { ACTIVE: 'active', EXPIRED: 'expired', REMOVED: 'removed', DEFAULT: 'default' };

export const USAGE_TYPES = { USERS: 'users', KPIS: 'kpis', API_CALLS: 'api_calls', STORAGE: 'storage', DEPARTMENTS: 'departments' };
export const USAGE_TYPES_DISPLAY = { users: 'Users', kpis: 'KPIs', api_calls: 'API Calls', storage: 'Storage (MB)', departments: 'Departments' };

export const AUDIT_ACTIONS = {
    CREATE: 'create', UPDATE: 'update', DELETE: 'delete', VIEW: 'view',
    PAYMENT: 'payment', REFUND: 'refund', CANCEL: 'cancel', RENEW: 'renew',
    UPGRADE: 'upgrade', DOWNGRADE: 'downgrade', WEBHOOK: 'webhook',
};
export const AUDIT_RESOURCE_TYPES = {
    PLAN: 'plan', SUBSCRIPTION: 'subscription', TRANSACTION: 'transaction',
    INVOICE: 'invoice', PAYMENT_METHOD: 'payment_method', WEBHOOK: 'webhook',
    USAGE: 'usage', TENANT_OVERRIDE: 'tenant_override',
};

export const CARD_BRANDS = { VISA: 'visa', MASTERCARD: 'mastercard', AMERICAN_EXPRESS: 'american express', DISCOVER: 'discover', OTHER: 'other' };
export const CARD_BRANDS_DISPLAY = { visa: 'Visa', mastercard: 'Mastercard', 'american express': 'American Express', discover: 'Discover', other: 'Card' };
export const CARD_BRAND_COLORS = { visa: '#1A1F71', mastercard: '#EB001B', 'american express': '#2E77BC', discover: '#FF6000', other: '#6B7280' };

export const SUPPORTED_CURRENCIES = { KES: 'KES', USD: 'USD', GBP: 'GBP', EUR: 'EUR' };
export const CURRENCY_SYMBOLS = { KES: 'KSh', USD: '$', GBP: '£', EUR: '€' };
export const CURRENCY_LOCALES = { KES: 'sw-KE', USD: 'en-US', GBP: 'en-GB', EUR: 'de-DE' };
export const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES.KES;

export const SUPPORTED_COUNTRIES = { KENYA: 'KE', NIGERIA: 'NG', GHANA: 'GH', SOUTH_AFRICA: 'ZA', IVORY_COAST: 'CI' };
export const COUNTRY_TAX_RATES = { KE: 0.16, NG: 0.075, GH: 0.125, ZA: 0.15, CI: 0.18 };
export const DEFAULT_TAX_RATE = 0.16;

export const PLAN_LIMITS = {
    trial: { maxUsers: 10, maxKpis: 50, maxDepartments: 5, maxStorageMb: 100, trialDays: 14 },
    basic: { maxUsers: 50, maxKpis: 100, maxDepartments: 10, maxStorageMb: 500 },
    professional: { maxUsers: 500, maxKpis: 1000, maxDepartments: 50, maxStorageMb: 5000 },
    enterprise: { maxUsers: -1, maxKpis: -1, maxDepartments: -1, maxStorageMb: -1 },
};

export const FEATURE_FLAGS = {
    CUSTOM_BRANDING: 'custom_branding', API_ACCESS: 'api_access', SSO_ENABLED: 'sso_enabled',
    ADVANCED_ANALYTICS: 'advanced_analytics', AUDIT_LOGS: 'audit_logs', CUSTOM_REPORTS: 'custom_reports',
    PRIORITY_SUPPORT: 'priority_support', UNLIMITED_USERS: 'unlimited_users', UNLIMITED_KPIS: 'unlimited_kpis',
};
export const FEATURE_FLAGS_DISPLAY = {
    custom_branding: 'Custom Branding', api_access: 'API Access', sso_enabled: 'Single Sign-On (SSO)',
    advanced_analytics: 'Advanced Analytics', audit_logs: 'Audit Logs', custom_reports: 'Custom Reports',
    priority_support: '24/7 Priority Support', unlimited_users: 'Unlimited Users', unlimited_kpis: 'Unlimited KPIs',
};

export const PLAN_FEATURES = {
    trial: ['audit_logs'],
    basic: ['audit_logs'],
    professional: ['custom_branding', 'api_access', 'advanced_analytics', 'audit_logs', 'custom_reports'],
    enterprise: ['custom_branding', 'api_access', 'sso_enabled', 'advanced_analytics', 'audit_logs', 'custom_reports', 'priority_support', 'unlimited_users', 'unlimited_kpis'],
};

export const BILLING_TIME_CONSTANTS = {
    TRIAL_DAYS_DEFAULT: 14, INVOICE_DUE_DAYS: 30, GRACE_PERIOD_DAYS: 7, SUSPENSION_DAYS: 30,
    RENEWAL_REMINDER_DAYS: [30, 14, 7, 3, 1], PAYMENT_TIMEOUT_MINUTES: 30,
    WEBHOOK_RETRY_MAX_ATTEMPTS: 3, WEBHOOK_RETRY_DELAY_MINUTES: 5,
    CACHE_TTL: { PLANS: 3600, SUBSCRIPTION: 300, INVOICES: 600, USAGE: 60 },
};

export const BILLING_PAGINATION = { DEFAULT_PAGE_SIZE: 20, PAGE_SIZE_OPTIONS: [10, 20, 50, 100], MAX_PAGE_SIZE: 100 };

export const BILLING_STORAGE_KEYS = {
    PLANS_CACHE: 'billing_plans_cache', SUBSCRIPTION_CACHE: 'billing_subscription_cache',
    LAST_ACTIVE_PLAN: 'billing_last_active_plan', CHECKOUT_SESSION: 'billing_checkout_session',
};

export default {
    PLAN_TYPES, PLAN_TYPES_DISPLAY, BILLING_INTERVALS, BILLING_INTERVALS_DISPLAY,
    SUBSCRIPTION_STATUS, SUBSCRIPTION_STATUS_DISPLAY, SUBSCRIPTION_STATUS_COLORS, SUBSCRIPTION_STATUS_ICONS,
    TRANSACTION_STATUS, TRANSACTION_STATUS_DISPLAY, TRANSACTION_STATUS_COLORS,
    TRANSACTION_TYPES, TRANSACTION_TYPES_DISPLAY, INVOICE_STATUS, INVOICE_STATUS_DISPLAY, INVOICE_STATUS_COLORS,
    PAYMENT_METHOD_TYPES, PAYMENT_METHOD_TYPES_DISPLAY, PAYMENT_METHOD_STATUS,
    USAGE_TYPES, USAGE_TYPES_DISPLAY, AUDIT_ACTIONS, AUDIT_RESOURCE_TYPES,
    CARD_BRANDS, CARD_BRANDS_DISPLAY, CARD_BRAND_COLORS,
    SUPPORTED_CURRENCIES, CURRENCY_SYMBOLS, CURRENCY_LOCALES, DEFAULT_CURRENCY,
    SUPPORTED_COUNTRIES, COUNTRY_TAX_RATES, DEFAULT_TAX_RATE,
    PLAN_LIMITS, FEATURE_FLAGS, FEATURE_FLAGS_DISPLAY, PLAN_FEATURES,
    BILLING_TIME_CONSTANTS, BILLING_PAGINATION, BILLING_STORAGE_KEYS,
};