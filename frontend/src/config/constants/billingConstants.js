export const PLAN_TYPES = {
    TRIAL: 'trial',
    BASIC: 'basic',
    PROFESSIONAL: 'professional',
    ENTERPRISE: 'enterprise',
};
export const PLAN_TYPE_LABELS = {
    [PLAN_TYPES.TRIAL]: 'Trial',
    [PLAN_TYPES.BASIC]: 'Basic',
    [PLAN_TYPES.PROFESSIONAL]: 'Professional',
    [PLAN_TYPES.ENTERPRISE]: 'Enterprise',
};
export const PLAN_TYPE_COLORS = {
    [PLAN_TYPES.TRIAL]: '#8B5CF6',
    [PLAN_TYPES.BASIC]: '#3B82F6',
    [PLAN_TYPES.PROFESSIONAL]: '#10B981',
    [PLAN_TYPES.ENTERPRISE]: '#F59E0B',
};
export const PLAN_TYPE_ICONS = {
    [PLAN_TYPES.TRIAL]: 'RocketIcon',
    [PLAN_TYPES.BASIC]: 'UserIcon',
    [PLAN_TYPES.PROFESSIONAL]: 'BriefcaseIcon',
    [PLAN_TYPES.ENTERPRISE]: 'BuildingIcon',
};

// Billing Intervals
export const BILLING_INTERVALS = {
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
};
export const BILLING_INTERVAL_LABELS = {
    [BILLING_INTERVALS.MONTHLY]: 'Monthly',
    [BILLING_INTERVALS.YEARLY]: 'Yearly',
};
export const BILLING_INTERVAL_MONTHS = {
    [BILLING_INTERVALS.MONTHLY]: 1,
    [BILLING_INTERVALS.YEARLY]: 12,
};

// Subscription Status
export const SUBSCRIPTION_STATUS = {
    TRIALING: 'trialing',
    ACTIVE: 'active',
    PAST_DUE: 'past_due',
    CANCELED: 'canceled',
    INCOMPLETE: 'incomplete',
    INCOMPLETE_EXPIRED: 'incomplete_expired',
    UNPAID: 'unpaid',
    SUSPENDED: 'suspended',
};
export const SUBSCRIPTION_STATUS_LABELS = {
    [SUBSCRIPTION_STATUS.TRIALING]: 'Trial',
    [SUBSCRIPTION_STATUS.ACTIVE]: 'Active',
    [SUBSCRIPTION_STATUS.PAST_DUE]: 'Past Due',
    [SUBSCRIPTION_STATUS.CANCELED]: 'Canceled',
    [SUBSCRIPTION_STATUS.INCOMPLETE]: 'Setup Incomplete',
    [SUBSCRIPTION_STATUS.INCOMPLETE_EXPIRED]: 'Setup Expired',
    [SUBSCRIPTION_STATUS.UNPAID]: 'Unpaid',
    [SUBSCRIPTION_STATUS.SUSPENDED]: 'Suspended',
};
export const SUBSCRIPTION_STATUS_COLORS = {
    [SUBSCRIPTION_STATUS.TRIALING]: '#8B5CF6',
    [SUBSCRIPTION_STATUS.ACTIVE]: '#10B981',
    [SUBSCRIPTION_STATUS.PAST_DUE]: '#F59E0B',
    [SUBSCRIPTION_STATUS.CANCELED]: '#6B7280',
    [SUBSCRIPTION_STATUS.INCOMPLETE]: '#3B82F6',
    [SUBSCRIPTION_STATUS.INCOMPLETE_EXPIRED]: '#EF4444',
    [SUBSCRIPTION_STATUS.UNPAID]: '#DC2626',
    [SUBSCRIPTION_STATUS.SUSPENDED]: '#9CA3AF',
};
export const SUBSCRIPTION_STATUS_BADGE_VARIANTS = {
    [SUBSCRIPTION_STATUS.TRIALING]: 'secondary',
    [SUBSCRIPTION_STATUS.ACTIVE]: 'success',
    [SUBSCRIPTION_STATUS.PAST_DUE]: 'warning',
    [SUBSCRIPTION_STATUS.CANCELED]: 'default',
    [SUBSCRIPTION_STATUS.INCOMPLETE]: 'info',
    [SUBSCRIPTION_STATUS.INCOMPLETE_EXPIRED]: 'danger',
    [SUBSCRIPTION_STATUS.UNPAID]: 'danger',
    [SUBSCRIPTION_STATUS.SUSPENDED]: 'default',
};

// Invoice Status
export const INVOICE_STATUS = {
    DRAFT: 'draft',
    OPEN: 'open',
    PAID: 'paid',
    UNCOLLECTIBLE: 'uncollectible',
    VOID: 'void',
};
export const INVOICE_STATUS_LABELS = {
    [INVOICE_STATUS.DRAFT]: 'Draft',
    [INVOICE_STATUS.OPEN]: 'Open',
    [INVOICE_STATUS.PAID]: 'Paid',
    [INVOICE_STATUS.UNCOLLECTIBLE]: 'Uncollectible',
    [INVOICE_STATUS.VOID]: 'Void',
};
export const INVOICE_STATUS_COLORS = {
    [INVOICE_STATUS.DRAFT]: '#6B7280',
    [INVOICE_STATUS.OPEN]: '#F59E0B',
    [INVOICE_STATUS.PAID]: '#10B981',
    [INVOICE_STATUS.UNCOLLECTIBLE]: '#EF4444',
    [INVOICE_STATUS.VOID]: '#9CA3AF',
};

// Payment Status
export const PAYMENT_STATUS = {
    SUCCEEDED: 'succeeded',
    PENDING: 'pending',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    PARTIALLY_REFUNDED: 'partially_refunded',
};
export const PAYMENT_STATUS_LABELS = {
    [PAYMENT_STATUS.SUCCEEDED]: 'Successful',
    [PAYMENT_STATUS.PENDING]: 'Pending',
    [PAYMENT_STATUS.FAILED]: 'Failed',
    [PAYMENT_STATUS.REFUNDED]: 'Refunded',
    [PAYMENT_STATUS.PARTIALLY_REFUNDED]: 'Partially Refunded',
};
export const PAYMENT_STATUS_COLORS = {
    [PAYMENT_STATUS.SUCCEEDED]: '#10B981',
    [PAYMENT_STATUS.PENDING]: '#F59E0B',
    [PAYMENT_STATUS.FAILED]: '#EF4444',
    [PAYMENT_STATUS.REFUNDED]: '#6B7280',
    [PAYMENT_STATUS.PARTIALLY_REFUNDED]: '#8B5CF6',
};

// Payment Methods Types
export const PAYMENT_METHOD_TYPES = {
    CARD: 'card',
    BANK_ACCOUNT: 'bank_account',
    MOBILE_MONEY: 'mobile_money',
    US_BANK: 'us_bank_account',
    LINK: 'link',
};
export const PAYMENT_METHOD_TYPE_LABELS = {
    [PAYMENT_METHOD_TYPES.CARD]: 'Credit/Debit Card',
    [PAYMENT_METHOD_TYPES.BANK_ACCOUNT]: 'Bank Account',
    [PAYMENT_METHOD_TYPES.MOBILE_MONEY]: 'Mobile Money',
    [PAYMENT_METHOD_TYPES.US_BANK]: 'US Bank Account',
    [PAYMENT_METHOD_TYPES.LINK]: 'Link',
};
export const PAYMENT_METHOD_TYPE_ICONS = {
    [PAYMENT_METHOD_TYPES.CARD]: 'CreditCardIcon',
    [PAYMENT_METHOD_TYPES.BANK_ACCOUNT]: 'BanknotesIcon',
    [PAYMENT_METHOD_TYPES.MOBILE_MONEY]: 'DevicePhoneMobileIcon',
    [PAYMENT_METHOD_TYPES.US_BANK]: 'BuildingLibraryIcon',
    [PAYMENT_METHOD_TYPES.LINK]: 'LinkIcon',
};

// Card Brands
export const CARD_BRANDS = {
    VISA: 'visa',
    MASTERCARD: 'mastercard',
    AMEX: 'amex',
    DISCOVER: 'discover',
    DINERS: 'diners',
    JCB: 'jcb',
    UNIONPAY: 'unionpay',
    UNKNOWN: 'unknown',
};
export const CARD_BRAND_LOGOS = {
    [CARD_BRANDS.VISA]: '/assets/images/payment/visa.svg',
    [CARD_BRANDS.MASTERCARD]: '/assets/images/payment/mastercard.svg',
    [CARD_BRANDS.AMEX]: '/assets/images/payment/amex.svg',
    [CARD_BRANDS.DISCOVER]: '/assets/images/payment/discover.svg',
    [CARD_BRANDS.DINERS]: '/assets/images/payment/diners.svg',
    [CARD_BRANDS.JCB]: '/assets/images/payment/jcb.svg',
    [CARD_BRANDS.UNIONPAY]: '/assets/images/payment/unionpay.svg',
};

// Quota Resources
export const QUOTA_RESOURCES = {
    USERS: 'users',
    ADMINS: 'admins',
    KPIS: 'kpis',
    KPI_FRAMEWORKS: 'kpi_frameworks',
    STORAGE_MB: 'storage_mb',
    API_CALLS: 'api_calls',
};
export const QUOTA_RESOURCE_LABELS = {
    [QUOTA_RESOURCES.USERS]: 'Users',
    [QUOTA_RESOURCES.ADMINS]: 'Admins',
    [QUOTA_RESOURCES.KPIS]: 'KPIs',
    [QUOTA_RESOURCES.KPI_FRAMEWORKS]: 'KPI Frameworks',
    [QUOTA_RESOURCES.STORAGE_MB]: 'Storage',
    [QUOTA_RESOURCES.API_CALLS]: 'API Calls',
};
export const QUOTA_RESOURCE_UNITS = {
    [QUOTA_RESOURCES.USERS]: 'users',
    [QUOTA_RESOURCES.ADMINS]: 'admins',
    [QUOTA_RESOURCES.KPIS]: 'KPIs',
    [QUOTA_RESOURCES.KPI_FRAMEWORKS]: 'frameworks',
    [QUOTA_RESOURCES.STORAGE_MB]: 'MB',
    [QUOTA_RESOURCES.API_CALLS]: 'calls/day',
};

// Webhook Event Types
export const WEBHOOK_EVENT_TYPES = {
    SUBSCRIPTION_CREATED: 'customer.subscription.created',
    SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
    SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
    SUBSCRIPTION_TRIAL_WILL_END: 'customer.subscription.trial_will_end',
    INVOICE_CREATED: 'invoice.created',
    INVOICE_PAID: 'invoice.paid',
    INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
    INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
    PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
    PAYMENT_INTENT_PAYMENT_FAILED: 'payment_intent.payment_failed',
    CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
    CUSTOMER_UPDATED: 'customer.updated',
    CUSTOMER_DELETED: 'customer.deleted',
};
export const WEBHOOK_EVENT_LABELS = {
    [WEBHOOK_EVENT_TYPES.SUBSCRIPTION_CREATED]: 'Subscription Created',
    [WEBHOOK_EVENT_TYPES.SUBSCRIPTION_UPDATED]: 'Subscription Updated',
    [WEBHOOK_EVENT_TYPES.SUBSCRIPTION_DELETED]: 'Subscription Deleted',
    [WEBHOOK_EVENT_TYPES.SUBSCRIPTION_TRIAL_WILL_END]: 'Trial Ending Soon',
    [WEBHOOK_EVENT_TYPES.INVOICE_CREATED]: 'Invoice Created',
    [WEBHOOK_EVENT_TYPES.INVOICE_PAID]: 'Invoice Paid',
    [WEBHOOK_EVENT_TYPES.INVOICE_PAYMENT_FAILED]: 'Payment Failed',
    [WEBHOOK_EVENT_TYPES.INVOICE_PAYMENT_SUCCEEDED]: 'Payment Succeeded',
    [WEBHOOK_EVENT_TYPES.PAYMENT_INTENT_SUCCEEDED]: 'Payment Intent Succeeded',
    [WEBHOOK_EVENT_TYPES.PAYMENT_INTENT_PAYMENT_FAILED]: 'Payment Intent Failed',
    [WEBHOOK_EVENT_TYPES.CHECKOUT_SESSION_COMPLETED]: 'Checkout Completed',
    [WEBHOOK_EVENT_TYPES.CUSTOMER_UPDATED]: 'Customer Updated',
    [WEBHOOK_EVENT_TYPES.CUSTOMER_DELETED]: 'Customer Deleted',
};

// Feature Flags
export const FEATURE_FLAGS = {
    CUSTOM_BRANDING: 'custom_branding',
    API_ACCESS: 'api_access',
    SSO: 'sso',
    ADVANCED_ANALYTICS: 'advanced_analytics',
    AUDIT_LOGS: 'audit_logs',
    REPORTS: 'reports',
    EXPORT: 'export',
    WEBHOOKS: 'webhooks',
    MULTI_CURRENCY: 'multi_currency',
    PRIORITY_SUPPORT: 'priority_support',
    SLA: 'sla',
    WHITE_LABEL: 'white_label',
};
export const FEATURE_FLAG_LABELS = {
    [FEATURE_FLAGS.CUSTOM_BRANDING]: 'Custom Branding',
    [FEATURE_FLAGS.API_ACCESS]: 'API Access',
    [FEATURE_FLAGS.SSO]: 'Single Sign-On (SSO)',
    [FEATURE_FLAGS.ADVANCED_ANALYTICS]: 'Advanced Analytics',
    [FEATURE_FLAGS.AUDIT_LOGS]: 'Audit Logs',
    [FEATURE_FLAGS.REPORTS]: 'Advanced Reports',
    [FEATURE_FLAGS.EXPORT]: 'Data Export',
    [FEATURE_FLAGS.WEBHOOKS]: 'Webhooks',
    [FEATURE_FLAGS.MULTI_CURRENCY]: 'Multi-Currency Support',
    [FEATURE_FLAGS.PRIORITY_SUPPORT]: 'Priority Support',
    [FEATURE_FLAGS.SLA]: 'SLA Guarantee',
    [FEATURE_FLAGS.WHITE_LABEL]: 'White Label',
};

// Plan Features
export const PLAN_FEATURES = {
    USERS: 'users',
    ADMIN_USERS: 'admin_users',
    STORAGE: 'storage',
    API_CALLS: 'api_calls',
    CUSTOM_REPORTS: 'custom_reports',
    EXPORT_DATA: 'export_data',
    AUDIT_TRAIL: 'audit_trail',
    CUSTOM_BRANDING: 'custom_branding',
    API_ACCESS: 'api_access',
    SSO: 'sso',
    PRIORITY_SUPPORT: 'priority_support',
    SLA: 'sla',
    ADVANCED_ANALYTICS: 'advanced_analytics',
    MULTI_CURRENCY: 'multi_currency',
    WEBHOOKS: 'webhooks',
    WHITE_LABEL: 'white_label',
};
export const PLAN_FEATURE_DESCRIPTIONS = {
    [PLAN_FEATURES.USERS]: 'Number of team members you can add',
    [PLAN_FEATURES.ADMIN_USERS]: 'Number of admin users',
    [PLAN_FEATURES.STORAGE]: 'Total storage space for your data',
    [PLAN_FEATURES.API_CALLS]: 'API calls per day',
    [PLAN_FEATURES.CUSTOM_REPORTS]: 'Create custom reports',
    [PLAN_FEATURES.EXPORT_DATA]: 'Export data to CSV, Excel, PDF',
    [PLAN_FEATURES.AUDIT_TRAIL]: 'Complete audit trail of all actions',
    [PLAN_FEATURES.CUSTOM_BRANDING]: 'Use your own logo and colors',
    [PLAN_FEATURES.API_ACCESS]: 'Access our REST API',
    [PLAN_FEATURES.SSO]: 'Single Sign-On integration',
    [PLAN_FEATURES.PRIORITY_SUPPORT]: '24/7 priority support',
    [PLAN_FEATURES.SLA]: 'Service Level Agreement',
    [PLAN_FEATURES.ADVANCED_ANALYTICS]: 'Advanced analytics and insights',
    [PLAN_FEATURES.MULTI_CURRENCY]: 'Multi-currency support',
    [PLAN_FEATURES.WEBHOOKS]: 'Webhook integrations',
    [PLAN_FEATURES.WHITE_LABEL]: 'Complete white label solution',
};

// Default Values
export const DEFAULT_PLAN = PLAN_TYPES.BASIC;
export const DEFAULT_BILLING_INTERVAL = BILLING_INTERVALS.MONTHLY;
export const DEFAULT_CURRENCY = 'KES';
export const DEFAULT_TRIAL_DAYS = 14;
export const DEFAULT_PAGE_SIZE = 20;

// Currency Symbols
export const SUPPORTED_CURRENCIES = [
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
    { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
];
export const getCurrencySymbol = (currencyCode) => {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    return currency?.symbol || currencyCode;
};
export const formatCurrency = (amount, currencyCode = DEFAULT_CURRENCY) => {
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Quota Thresholds
export const QUOTA_WARNING_THRESHOLD = 0.8;   
export const QUOTA_CRITICAL_THRESHOLD = 0.9;    
export const QUOTA_DANGER_THRESHOLD = 0.95;    

// Table Columns
export const PLAN_TABLE_COLUMNS = [
    { key: 'name', label: 'Plan Name', sortable: true },
    { key: 'price_monthly', label: 'Monthly Price', sortable: true },
    { key: 'price_yearly', label: 'Yearly Price', sortable: true },
    { key: 'trial_days', label: 'Trial Days', sortable: true },
    { key: 'is_recommended', label: 'Recommended', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
];
export const SUBSCRIPTION_TABLE_COLUMNS = [
    { key: 'plan', label: 'Plan', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'billing_interval', label: 'Billing', sortable: true },
    { key: 'current_period_end', label: 'Renewal Date', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
];
export const INVOICE_TABLE_COLUMNS = [
    { key: 'invoice_number', label: 'Invoice #', sortable: true },
    { key: 'invoice_date', label: 'Date', sortable: true },
    { key: 'due_date', label: 'Due Date', sortable: true },
    { key: 'amount_due', label: 'Amount', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
];
export const PAYMENT_TABLE_COLUMNS = [
    { key: 'payment_date', label: 'Date', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'receipt', label: 'Receipt', sortable: false },
];
export const PAYMENT_METHOD_TABLE_COLUMNS = [
    { key: 'type', label: 'Type', sortable: true },
    { key: 'details', label: 'Details', sortable: true },
    { key: 'expiry', label: 'Expiry', sortable: true },
    { key: 'is_default', label: 'Default', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
];

// Storage Keys
export const BILLING_STORAGE_KEYS = {
    SELECTED_PLAN: 'billing_selected_plan',
    BILLING_FILTERS: 'billing_filters',
    INVOICE_FILTERS: 'billing_invoice_filters',
    PAYMENT_FILTERS: 'billing_payment_filters',
    UI_PREFERENCES: 'billing_ui_preferences',
    RECENT_PLANS: 'billing_recent_plans',
};

// Webhook event for websocket
export const WS_BILLING_EVENTS = {
    SUBSCRIPTION_UPDATED: 'subscription_updated',
    INVOICE_CREATED: 'invoice_created',
    INVOICE_PAID: 'invoice_paid',
    PAYMENT_RECEIVED: 'payment_received',
    PAYMENT_FAILED: 'payment_failed',
    QUOTA_ALERT: 'quota_alert',
    TRIAL_ENDING: 'trial_ending',
    UPCOMING_INVOICE: 'upcoming_invoice',
};

// Local Storage keys
export const BILLING_LOCAL_STORAGE = {
    CACHED_PLANS: 'billing_cached_plans',
    CACHED_PLANS_TIMESTAMP: 'billing_cached_plans_ts',
    SUBSCRIPTION_CACHE: 'billing_subscription_cache',
    SUBSCRIPTION_CACHE_TIMESTAMP: 'billing_subscription_cache_ts',
};

// Cache duration
export const BILLING_CACHE_DURATIONS = {
    PLANS: 5 * 60 * 1000,        // 5 minutes
    SUBSCRIPTION: 60 * 1000,     // 1 minute
    INVOICES: 2 * 60 * 1000,     // 2 minutes
    QUOTA: 30 * 1000,            // 30 seconds
    PAYMENT_METHODS: 60 * 1000,  // 1 minute
};

// Error Codes
export const BILLING_ERROR_CODES = {
    SUBSCRIPTION_NOT_FOUND: 'subscription_not_found',
    SUBSCRIPTION_ALREADY_ACTIVE: 'subscription_already_active',
    SUBSCRIPTION_CANCELLATION_FAILED: 'subscription_cancellation_failed',
    PAYMENT_FAILED: 'payment_failed',
    PAYMENT_METHOD_INVALID: 'payment_method_invalid',
    INVOICE_NOT_FOUND: 'invoice_not_found',
    QUOTA_EXCEEDED: 'quota_exceeded',
    FEATURE_NOT_AVAILABLE: 'feature_not_available',
    PLAN_NOT_FOUND: 'plan_not_found',
    TENANT_NOT_FOUND: 'tenant_not_found',
};
export const BILLING_ERROR_MESSAGES = {
    [BILLING_ERROR_CODES.SUBSCRIPTION_NOT_FOUND]: 'Subscription not found',
    [BILLING_ERROR_CODES.SUBSCRIPTION_ALREADY_ACTIVE]: 'You already have an active subscription',
    [BILLING_ERROR_CODES.SUBSCRIPTION_CANCELLATION_FAILED]: 'Failed to cancel subscription',
    [BILLING_ERROR_CODES.PAYMENT_FAILED]: 'Payment processing failed',
    [BILLING_ERROR_CODES.PAYMENT_METHOD_INVALID]: 'Invalid payment method',
    [BILLING_ERROR_CODES.INVOICE_NOT_FOUND]: 'Invoice not found',
    [BILLING_ERROR_CODES.QUOTA_EXCEEDED]: 'Quota limit exceeded',
    [BILLING_ERROR_CODES.FEATURE_NOT_AVAILABLE]: 'Feature not available in your current plan',
    [BILLING_ERROR_CODES.PLAN_NOT_FOUND]: 'Plan not found',
    [BILLING_ERROR_CODES.TENANT_NOT_FOUND]: 'Organization not found',
};