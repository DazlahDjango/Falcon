// ============================================================================
// Subscription Plan Types
// ============================================================================

export const PLAN_TYPES = {
    TRIAL: 'trial',
    BASIC: 'basic',
    PROFESSIONAL: 'professional',
    ENTERPRISE: 'enterprise',
};

export const PLAN_TYPES_DISPLAY = {
    [PLAN_TYPES.TRIAL]: 'Trial',
    [PLAN_TYPES.BASIC]: 'Basic',
    [PLAN_TYPES.PROFESSIONAL]: 'Professional',
    [PLAN_TYPES.ENTERPRISE]: 'Enterprise',
};

export const PLAN_TYPE_ORDER = {
    [PLAN_TYPES.TRIAL]: 0,
    [PLAN_TYPES.BASIC]: 1,
    [PLAN_TYPES.PROFESSIONAL]: 2,
    [PLAN_TYPES.ENTERPRISE]: 3,
};

// ============================================================================
// Billing Intervals
// ============================================================================

export const BILLING_INTERVALS = {
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
};

export const BILLING_INTERVALS_DISPLAY = {
    [BILLING_INTERVALS.MONTHLY]: 'Monthly',
    [BILLING_INTERVALS.YEARLY]: 'Yearly',
};

export const BILLING_INTERVAL_DAYS = {
    [BILLING_INTERVALS.MONTHLY]: 30,
    [BILLING_INTERVALS.YEARLY]: 365,
};

// ============================================================================
// Subscription Status
// ============================================================================

export const SUBSCRIPTION_STATUS = {
    ACTIVE: 'active',
    TRIALING: 'trialing',
    PAST_DUE: 'past_due',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    PENDING_CANCELLATION: 'pending_cancellation',
};

export const SUBSCRIPTION_STATUS_DISPLAY = {
    [SUBSCRIPTION_STATUS.ACTIVE]: 'Active',
    [SUBSCRIPTION_STATUS.TRIALING]: 'Trial',
    [SUBSCRIPTION_STATUS.PAST_DUE]: 'Past Due',
    [SUBSCRIPTION_STATUS.CANCELLED]: 'Cancelled',
    [SUBSCRIPTION_STATUS.EXPIRED]: 'Expired',
    [SUBSCRIPTION_STATUS.PENDING_CANCELLATION]: 'Pending Cancellation',
};

export const SUBSCRIPTION_STATUS_COLORS = {
    [SUBSCRIPTION_STATUS.ACTIVE]: 'success',
    [SUBSCRIPTION_STATUS.TRIALING]: 'info',
    [SUBSCRIPTION_STATUS.PAST_DUE]: 'warning',
    [SUBSCRIPTION_STATUS.CANCELLED]: 'secondary',
    [SUBSCRIPTION_STATUS.EXPIRED]: 'error',
    [SUBSCRIPTION_STATUS.PENDING_CANCELLATION]: 'warning',
};

export const SUBSCRIPTION_STATUS_ICONS = {
    [SUBSCRIPTION_STATUS.ACTIVE]: 'CheckCircle',
    [SUBSCRIPTION_STATUS.TRIALING]: 'Rocket',
    [SUBSCRIPTION_STATUS.PAST_DUE]: 'AlertTriangle',
    [SUBSCRIPTION_STATUS.CANCELLED]: 'XCircle',
    [SUBSCRIPTION_STATUS.EXPIRED]: 'Clock',
    [SUBSCRIPTION_STATUS.PENDING_CANCELLATION]: 'MinusCircle',
};

// ============================================================================
// Transaction Status
// ============================================================================

export const TRANSACTION_STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    DISPUTED: 'disputed',
};

export const TRANSACTION_STATUS_DISPLAY = {
    [TRANSACTION_STATUS.PENDING]: 'Pending',
    [TRANSACTION_STATUS.SUCCESS]: 'Success',
    [TRANSACTION_STATUS.FAILED]: 'Failed',
    [TRANSACTION_STATUS.REFUNDED]: 'Refunded',
    [TRANSACTION_STATUS.DISPUTED]: 'Disputed',
};

export const TRANSACTION_STATUS_COLORS = {
    [TRANSACTION_STATUS.PENDING]: 'warning',
    [TRANSACTION_STATUS.SUCCESS]: 'success',
    [TRANSACTION_STATUS.FAILED]: 'error',
    [TRANSACTION_STATUS.REFUNDED]: 'info',
    [TRANSACTION_STATUS.DISPUTED]: 'error',
};

// ============================================================================
// Transaction Types
// ============================================================================

export const TRANSACTION_TYPES = {
    SUBSCRIPTION: 'subscription',
    RENEWAL: 'renewal',
    UPGRADE: 'upgrade',
    DOWNGRADE: 'downgrade',
    REFUND: 'refund',
    ONE_TIME: 'one_time',
};

export const TRANSACTION_TYPES_DISPLAY = {
    [TRANSACTION_TYPES.SUBSCRIPTION]: 'Subscription Creation',
    [TRANSACTION_TYPES.RENEWAL]: 'Renewal',
    [TRANSACTION_TYPES.UPGRADE]: 'Plan Upgrade',
    [TRANSACTION_TYPES.DOWNGRADE]: 'Plan Downgrade',
    [TRANSACTION_TYPES.REFUND]: 'Refund',
    [TRANSACTION_TYPES.ONE_TIME]: 'One Time Payment',
};

// ============================================================================
// Invoice Status
// ============================================================================

export const INVOICE_STATUS = {
    DRAFT: 'draft',
    PENDING: 'pending',
    PAID: 'paid',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
};

export const INVOICE_STATUS_DISPLAY = {
    [INVOICE_STATUS.DRAFT]: 'Draft',
    [INVOICE_STATUS.PENDING]: 'Pending',
    [INVOICE_STATUS.PAID]: 'Paid',
    [INVOICE_STATUS.OVERDUE]: 'Overdue',
    [INVOICE_STATUS.CANCELLED]: 'Cancelled',
    [INVOICE_STATUS.REFUNDED]: 'Refunded',
};

export const INVOICE_STATUS_COLORS = {
    [INVOICE_STATUS.DRAFT]: 'secondary',
    [INVOICE_STATUS.PENDING]: 'warning',
    [INVOICE_STATUS.PAID]: 'success',
    [INVOICE_STATUS.OVERDUE]: 'error',
    [INVOICE_STATUS.CANCELLED]: 'secondary',
    [INVOICE_STATUS.REFUNDED]: 'info',
};

// ============================================================================
// Payment Method Types
// ============================================================================

export const PAYMENT_METHOD_TYPES = {
    CARD: 'card',
    BANK: 'bank',
    USSD: 'ussd',
    QR: 'qr',
    MOBILE_MONEY: 'mobile_money',
};

export const PAYMENT_METHOD_TYPES_DISPLAY = {
    [PAYMENT_METHOD_TYPES.CARD]: 'Credit/Debit Card',
    [PAYMENT_METHOD_TYPES.BANK]: 'Bank Account',
    [PAYMENT_METHOD_TYPES.USSD]: 'USSD',
    [PAYMENT_METHOD_TYPES.QR]: 'QR Code',
    [PAYMENT_METHOD_TYPES.MOBILE_MONEY]: 'Mobile Money',
};

export const PAYMENT_METHOD_STATUS = {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    REMOVED: 'removed',
    DEFAULT: 'default',
};

// ============================================================================
// Card Brands
// ============================================================================

export const CARD_BRANDS = {
    VISA: 'visa',
    MASTERCARD: 'mastercard',
    AMERICAN_EXPRESS: 'american express',
    DISCOVER: 'discover',
    OTHER: 'other',
};

export const CARD_BRANDS_DISPLAY = {
    [CARD_BRANDS.VISA]: 'Visa',
    [CARD_BRANDS.MASTERCARD]: 'Mastercard',
    [CARD_BRANDS.AMERICAN_EXPRESS]: 'American Express',
    [CARD_BRANDS.DISCOVER]: 'Discover',
    [CARD_BRANDS.OTHER]: 'Card',
};

export const CARD_BRAND_COLORS = {
    [CARD_BRANDS.VISA]: '#1A1F71',
    [CARD_BRANDS.MASTERCARD]: '#EB001B',
    [CARD_BRANDS.AMERICAN_EXPRESS]: '#2E77BC',
    [CARD_BRANDS.DISCOVER]: '#FF6000',
    [CARD_BRANDS.OTHER]: '#6B7280',
};

// ============================================================================
// Currency Configuration
// ============================================================================

export const SUPPORTED_CURRENCIES = {
    KES: 'KES',
    USD: 'USD',
    GBP: 'GBP',
    EUR: 'EUR',
};

export const CURRENCY_SYMBOLS = {
    [SUPPORTED_CURRENCIES.KES]: 'KSh',
    [SUPPORTED_CURRENCIES.USD]: '$',
    [SUPPORTED_CURRENCIES.GBP]: '£',
    [SUPPORTED_CURRENCIES.EUR]: '€',
};

export const CURRENCY_LOCALES = {
    [SUPPORTED_CURRENCIES.KES]: 'sw-KE',
    [SUPPORTED_CURRENCIES.USD]: 'en-US',
    [SUPPORTED_CURRENCIES.GBP]: 'en-GB',
    [SUPPORTED_CURRENCIES.EUR]: 'de-DE',
};

export const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES.KES;

// ============================================================================
// Plan Limits (from backend proposal)
// ============================================================================

export const PLAN_LIMITS = {
    [PLAN_TYPES.TRIAL]: {
        maxUsers: 10,
        maxKpis: 50,
        maxDepartments: 5,
        maxStorageMb: 100,
        trialDays: 14,
    },
    [PLAN_TYPES.BASIC]: {
        maxUsers: 50,
        maxKpis: 100,
        maxDepartments: 10,
        maxStorageMb: 500,
        priceMonthly: 5000,
        priceYearly: 50000,
    },
    [PLAN_TYPES.PROFESSIONAL]: {
        maxUsers: 500,
        maxKpis: 1000,
        maxDepartments: 50,
        maxStorageMb: 5000,
        priceMonthly: 25000,
        priceYearly: 250000,
    },
    [PLAN_TYPES.ENTERPRISE]: {
        maxUsers: -1,
        maxKpis: -1,
        maxDepartments: -1,
        maxStorageMb: -1,
        priceMonthly: 100000,
        priceYearly: 1000000,
    },
};

// ============================================================================
// Feature Flags (from backend proposal)
// ============================================================================

export const FEATURE_FLAGS = {
    CUSTOM_BRANDING: 'custom_branding',
    API_ACCESS: 'api_access',
    SSO_ENABLED: 'sso_enabled',
    ADVANCED_ANALYTICS: 'advanced_analytics',
    AUDIT_LOGS: 'audit_logs',
    CUSTOM_REPORTS: 'custom_reports',
    PRIORITY_SUPPORT: 'priority_support',
    UNLIMITED_USERS: 'unlimited_users',
    UNLIMITED_KPIS: 'unlimited_kpis',
    DATA_EXPORT: 'data_export',
    WEBHOOKS: 'webhooks',
    WHITE_LABEL: 'white_label',
};

export const FEATURE_FLAGS_DISPLAY = {
    [FEATURE_FLAGS.CUSTOM_BRANDING]: 'Custom Branding',
    [FEATURE_FLAGS.API_ACCESS]: 'API Access',
    [FEATURE_FLAGS.SSO_ENABLED]: 'Single Sign-On (SSO)',
    [FEATURE_FLAGS.ADVANCED_ANALYTICS]: 'Advanced Analytics',
    [FEATURE_FLAGS.AUDIT_LOGS]: 'Audit Logs',
    [FEATURE_FLAGS.CUSTOM_REPORTS]: 'Custom Reports',
    [FEATURE_FLAGS.PRIORITY_SUPPORT]: '24/7 Priority Support',
    [FEATURE_FLAGS.UNLIMITED_USERS]: 'Unlimited Users',
    [FEATURE_FLAGS.UNLIMITED_KPIS]: 'Unlimited KPIs',
    [FEATURE_FLAGS.DATA_EXPORT]: 'Data Export',
    [FEATURE_FLAGS.WEBHOOKS]: 'Webhook Integrations',
    [FEATURE_FLAGS.WHITE_LABEL]: 'White Label Solution',
};

// ============================================================================
// Plan Feature Mapping (from backend)
// ============================================================================

export const PLAN_FEATURES = {
    [PLAN_TYPES.TRIAL]: [
        FEATURE_FLAGS.AUDIT_LOGS,
    ],
    [PLAN_TYPES.BASIC]: [
        FEATURE_FLAGS.AUDIT_LOGS,
        FEATURE_FLAGS.DATA_EXPORT,
    ],
    [PLAN_TYPES.PROFESSIONAL]: [
        FEATURE_FLAGS.CUSTOM_BRANDING,
        FEATURE_FLAGS.API_ACCESS,
        FEATURE_FLAGS.ADVANCED_ANALYTICS,
        FEATURE_FLAGS.AUDIT_LOGS,
        FEATURE_FLAGS.DATA_EXPORT,
        FEATURE_FLAGS.CUSTOM_REPORTS,
    ],
    [PLAN_TYPES.ENTERPRISE]: [
        FEATURE_FLAGS.CUSTOM_BRANDING,
        FEATURE_FLAGS.API_ACCESS,
        FEATURE_FLAGS.SSO_ENABLED,
        FEATURE_FLAGS.ADVANCED_ANALYTICS,
        FEATURE_FLAGS.AUDIT_LOGS,
        FEATURE_FLAGS.CUSTOM_REPORTS,
        FEATURE_FLAGS.PRIORITY_SUPPORT,
        FEATURE_FLAGS.UNLIMITED_USERS,
        FEATURE_FLAGS.UNLIMITED_KPIS,
        FEATURE_FLAGS.DATA_EXPORT,
        FEATURE_FLAGS.WEBHOOKS,
        FEATURE_FLAGS.WHITE_LABEL,
    ],
};

// ============================================================================
// Tax Configuration
// ============================================================================

export const TAX_RATES = {
    KENYA: 0.16,      // 16% VAT
    UGANDA: 0.18,     // 18% VAT
    TANZANIA: 0.18,   // 18% VAT
    NIGERIA: 0.075,   // 7.5% VAT
    DEFAULT: 0.16,
};

export const TAX_EXEMPT_COUNTRIES = [];

// ============================================================================
// Time Constants
// ============================================================================

export const BILLING_TIME_CONSTANTS = {
    TRIAL_DAYS_DEFAULT: 14,
    INVOICE_DUE_DAYS: 30,
    RENEWAL_REMINDER_DAYS: [30, 14, 7, 3, 1],
    PAYMENT_TIMEOUT_MINUTES: 30,
    WEBHOOK_RETRY_MAX_ATTEMPTS: 3,
    WEBHOOK_RETRY_DELAY_MINUTES: 5,
    CACHE_TTL: {
        PLANS: 3600,        // 1 hour
        SUBSCRIPTION: 300,  // 5 minutes
        INVOICES: 600,      // 10 minutes
    },
};

// ============================================================================
// Pagination Defaults
// ============================================================================

export const BILLING_PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    MAX_PAGE_SIZE: 100,
};

// ============================================================================
// Route Constants (for navigation)
// ============================================================================

export const BILLING_ROUTES = {
    // Canonical paths — prefer billingRouteConstants.js for new code
    PLANS: '/billing/plans',
    PLAN_DETAIL: (id) => `/billing/plans/${id}`,
    PLAN_COMPARE: '/billing/plans/compare',
    SUBSCRIPTIONS: '/billing/subscriptions',
    SUBSCRIPTION_DETAIL: (id) => `/billing/subscriptions/${id}`,
    SUBSCRIPTION_UPGRADE: '/billing/subscriptions/upgrade',
    SUBSCRIPTION_CANCEL: '/billing/subscriptions/cancel',
    CHECKOUT: '/billing/checkout',
    CHECKOUT_SUCCESS: '/billing/checkout/success',
    CHECKOUT_CANCEL: '/billing/checkout/cancel',
    INVOICES: '/billing/invoices',
    INVOICE_DETAIL: (id) => `/billing/invoices/${id}`,
    TRANSACTIONS: '/billing/transactions',
    TRANSACTION_DETAIL: (id) => `/billing/transactions/${id}`,
    PAYMENT_METHODS: '/billing/payment-methods',
    BILLING_PORTAL: '/billing/portal',
    BILLING_SETTINGS: '/billing/settings',
    ADMIN_BILLING: '/billing/admin',
    ADMIN_PLANS: '/billing/admin/plans',
    ADMIN_SUBSCRIPTIONS: '/billing/admin/subscriptions',
    ADMIN_TRANSACTIONS: '/billing/admin/transactions',
    ADMIN_WEBHOOKS: '/billing/admin/webhooks',
    ADMIN_ANALYTICS: '/billing/admin/analytics',
    REPORTS_REVENUE: '/billing/reports/revenue',
    REPORTS_SUBSCRIPTIONS: '/billing/reports/subscriptions',
    REPORTS_TAX: '/billing/reports/tax',
};

// ============================================================================
// Storage Keys
// ============================================================================

export const BILLING_STORAGE_KEYS = {
    PLANS_CACHE: 'billing_plans_cache',
    SUBSCRIPTION_CACHE: 'billing_subscription_cache',
    LAST_ACTIVE_PLAN: 'billing_last_active_plan',
    CHECKOUT_SESSION: 'billing_checkout_session',
};

// ============================================================================
// Export all constants as default object
// ============================================================================

export default {
    PLAN_TYPES,
    PLAN_TYPES_DISPLAY,
    BILLING_INTERVALS,
    BILLING_INTERVALS_DISPLAY,
    SUBSCRIPTION_STATUS,
    SUBSCRIPTION_STATUS_DISPLAY,
    SUBSCRIPTION_STATUS_COLORS,
    SUBSCRIPTION_STATUS_ICONS,
    TRANSACTION_STATUS,
    TRANSACTION_STATUS_DISPLAY,
    TRANSACTION_STATUS_COLORS,
    TRANSACTION_TYPES,
    TRANSACTION_TYPES_DISPLAY,
    INVOICE_STATUS,
    INVOICE_STATUS_DISPLAY,
    INVOICE_STATUS_COLORS,
    PAYMENT_METHOD_TYPES,
    PAYMENT_METHOD_TYPES_DISPLAY,
    CARD_BRANDS,
    CARD_BRANDS_DISPLAY,
    CARD_BRAND_COLORS,
    SUPPORTED_CURRENCIES,
    CURRENCY_SYMBOLS,
    CURRENCY_LOCALES,
    DEFAULT_CURRENCY,
    PLAN_LIMITS,
    FEATURE_FLAGS,
    FEATURE_FLAGS_DISPLAY,
    PLAN_FEATURES,
    TAX_RATES,
    BILLING_TIME_CONSTANTS,
    BILLING_PAGINATION,
    BILLING_ROUTES,
    BILLING_STORAGE_KEYS,
};