import environment from '../environment';

// Base billing API path relative to API_BASE_URL
const BILLING_API_BASE = '/billing';

// ============================================================================
// PLAN ENDPOINTS
// ============================================================================

export const PLAN_API_ENDPOINTS = {
    // Base endpoints
    LIST: '/plans/',
    DETAIL: (id) => `/plans/${id}/`,
    FEATURES: (id) => `/plans/${id}/features/`,
    SUBSCRIPTIONS: (id) => `/plans/${id}/subscriptions/`,
    COMPARE: '/plans/compare/',
};

// ============================================================================
// SUBSCRIPTION ENDPOINTS
// ============================================================================

export const SUBSCRIPTION_API_ENDPOINTS = {
    // Base endpoints
    LIST: '/subscriptions/',
    DETAIL: (id) => `/subscriptions/${id}/`,
    CREATE: '/subscriptions/',
    UPDATE: (id) => `/subscriptions/${id}/`,
    DELETE: (id) => `/subscriptions/${id}/`,
    PARTIAL_UPDATE: (id) => `/subscriptions/${id}/`,
    
    // Actions
    CURRENT: '/subscriptions/current/',
    STATUS: '/subscriptions/status/',
    CANCEL: (id) => `/subscriptions/${id}/cancel/`,
    REACTIVATE: (id) => `/subscriptions/${id}/reactivate/`,
    SYNC: (id) => `/subscriptions/${id}/sync/`,
    HISTORY: (id) => `/subscriptions/${id}/history/`,
};

// ============================================================================
// INVOICE ENDPOINTS
// ============================================================================

export const INVOICE_API_ENDPOINTS = {
    // Base endpoints
    LIST: '/invoices/',
    DETAIL: (id) => `/invoices/${id}/`,
    DOWNLOAD: (id) => `/invoices/${id}/download/`,
    REMIND: (id) => `/invoices/${id}/remind/`,
    OUTSTANDING: '/invoices/outstanding/',
    
    // Nested resources
    LINE_ITEMS: (id) => `/invoices/${id}/line-items/`,
    PAYMENTS: (id) => `/invoices/${id}/payments/`,
};

// ============================================================================
// PAYMENT ENDPOINTS
// ============================================================================

export const PAYMENT_API_ENDPOINTS = {
    // Base endpoints
    LIST: '/payments/',
    DETAIL: (id) => `/payments/${id}/`,
    RETRY: (id) => `/payments/${id}/retry/`,
    REFUND: (id) => `/payments/${id}/refund/`,
};

// ============================================================================
// PAYMENT METHOD ENDPOINTS
// ============================================================================

export const PAYMENT_METHOD_API_ENDPOINTS = {
    // Base endpoints
    LIST: '/payment-methods/',
    DETAIL: (id) => `/payment-methods/${id}/`,
    CREATE: '/payment-methods/',
    DELETE: (id) => `/payment-methods/${id}/`,
    SET_DEFAULT: (id) => `/payment-methods/${id}/set_default/`,
    DEFAULT: '/payment-methods/default/',
    EXPIRING_SOON: '/payment-methods/expiring-soon/',
};

// ============================================================================
// CHECKOUT ENDPOINTS
// ============================================================================

export const CHECKOUT_API_ENDPOINTS = {
    CREATE_SESSION: '/checkout/',
    GET_SESSION: (sessionId) => `/checkout/session/?session_id=${sessionId}`,
    GET_SESSION_BY_ID: (id) => `/checkout/${id}/`,
    CREATE_PORTAL_SESSION: '/portal/',
};

// ============================================================================
// QUOTA ENDPOINTS
// ============================================================================

export const QUOTA_API_ENDPOINTS = {
    STATUS: '/quota/',
    LIMITS: '/quota/limits/',
    REFRESH: '/quota/refresh/',
};

export const WEBHOOK_API_ENDPOINTS = {
    STRIPE: '/webhook/stripe/',
};

// ============================================================================
// COMPLETE API OBJECT
// ============================================================================

export const BILLING_API = {
    plans: PLAN_API_ENDPOINTS,
    subscriptions: SUBSCRIPTION_API_ENDPOINTS,
    invoices: INVOICE_API_ENDPOINTS,
    payments: PAYMENT_API_ENDPOINTS,
    paymentMethods: PAYMENT_METHOD_API_ENDPOINTS,
    checkout: CHECKOUT_API_ENDPOINTS,
    quota: QUOTA_API_ENDPOINTS,
    webhook: WEBHOOK_API_ENDPOINTS,
};

// ============================================================================
// API QUERY KEYS (for React Query)
// ============================================================================

export const BILLING_QUERY_KEYS = {
    // Plans
    PLANS: 'billing-plans',
    PLAN_DETAIL: (id) => ['billing-plan', id],
    PLAN_FEATURES: (id) => ['billing-plan-features', id],
    PLAN_COMPARE: (ids) => ['billing-plan-compare', ids],
    
    // Subscriptions
    SUBSCRIPTIONS: 'billing-subscriptions',
    SUBSCRIPTION_DETAIL: (id) => ['billing-subscription', id],
    CURRENT_SUBSCRIPTION: 'billing-current-subscription',
    SUBSCRIPTION_STATUS: 'billing-subscription-status',
    SUBSCRIPTION_HISTORY: (id) => ['billing-subscription-history', id],
    
    // Invoices
    INVOICES: 'billing-invoices',
    INVOICE_DETAIL: (id) => ['billing-invoice', id],
    OUTSTANDING_INVOICES: 'billing-outstanding-invoices',
    INVOICE_SUMMARY: 'billing-invoice-summary',
    INVOICE_LINE_ITEMS: (id) => ['billing-invoice-line-items', id],
    
    // Payments
    PAYMENTS: 'billing-payments',
    PAYMENT_DETAIL: (id) => ['billing-payment', id],
    PAYMENT_SUMMARY: 'billing-payment-summary',
    
    // Payment Methods
    PAYMENT_METHODS: 'billing-payment-methods',
    PAYMENT_METHOD_DETAIL: (id) => ['billing-payment-method', id],
    DEFAULT_PAYMENT_METHOD: 'billing-default-payment-method',
    EXPIRING_PAYMENT_METHODS: 'billing-expiring-payment-methods',
    
    // Quota
    QUOTA_STATUS: 'billing-quota-status',
    QUOTA_LIMITS: 'billing-quota-limits',
    QUOTA_USAGE: 'billing-quota-usage',
};

// ============================================================================
// API PARAMS DEFAULTS
// ============================================================================

export const BILLING_API_DEFAULTS = {
    PAGE_SIZE: 20,
    PAGE: 1,
    SORT_BY: '-created_at',
    INVOICE_STATUS: 'all',
    PAYMENT_STATUS: 'all',
    SUBSCRIPTION_STATUS: 'all',
};

// ============================================================================
// API FILTERS
// ============================================================================

export const createInvoiceFilters = (filters = {}) => ({
    status: filters.status || BILLING_API_DEFAULTS.INVOICE_STATUS,
    date_from: filters.dateFrom || null,
    date_to: filters.dateTo || null,
    min_amount: filters.minAmount || null,
    max_amount: filters.maxAmount || null,
    search: filters.search || '',
    page: filters.page || BILLING_API_DEFAULTS.PAGE,
    page_size: filters.pageSize || BILLING_API_DEFAULTS.PAGE_SIZE,
    ordering: filters.sortBy || BILLING_API_DEFAULTS.SORT_BY,
});

export const createPaymentFilters = (filters = {}) => ({
    status: filters.status || BILLING_API_DEFAULTS.PAYMENT_STATUS,
    date_from: filters.dateFrom || null,
    date_to: filters.dateTo || null,
    min_amount: filters.minAmount || null,
    max_amount: filters.maxAmount || null,
    page: filters.page || BILLING_API_DEFAULTS.PAGE,
    page_size: filters.pageSize || BILLING_API_DEFAULTS.PAGE_SIZE,
    ordering: filters.sortBy || BILLING_API_DEFAULTS.SORT_BY,
});

export const createSubscriptionFilters = (filters = {}) => ({
    status: filters.status || BILLING_API_DEFAULTS.SUBSCRIPTION_STATUS,
    plan_type: filters.planType || null,
    billing_interval: filters.billingInterval || null,
    page: filters.page || BILLING_API_DEFAULTS.PAGE,
    page_size: filters.pageSize || BILLING_API_DEFAULTS.PAGE_SIZE,
    ordering: filters.sortBy || BILLING_API_DEFAULTS.SORT_BY,
});

// ============================================================================
// REQUEST/RESPONSE TYPES (for TypeScript/JSDoc)
// ============================================================================

/**
 * @typedef {Object} Plan
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 * @property {string} plan_type
 * @property {number} price_monthly
 * @property {number} price_yearly
 * @property {string} currency
 * @property {number} trial_days
 * @property {boolean} is_active
 * @property {boolean} is_recommended
 * @property {Array<PlanFeature>} features
 */

/**
 * @typedef {Object} PlanFeature
 * @property {string} id
 * @property {string} name
 * @property {string} value
 * @property {boolean} is_highlight
 */

/**
 * @typedef {Object} Subscription
 * @property {string} id
 * @property {string} tenant
 * @property {string} tenant_name
 * @property {Plan} plan
 * @property {string} status
 * @property {string} billing_interval
 * @property {boolean} is_active
 * @property {string} trial_start
 * @property {string} trial_end
 * @property {string} current_period_start
 * @property {string} current_period_end
 * @property {boolean} cancel_at_period_end
 * @property {string} canceled_at
 * @property {string} ended_at
 * @property {boolean} auto_renew
 */

/**
 * @typedef {Object} Invoice
 * @property {string} id
 * @property {string} invoice_number
 * @property {string} status
 * @property {number} amount_due
 * @property {number} amount_paid
 * @property {number} amount_remaining
 * @property {string} currency
 * @property {string} invoice_date
 * @property {string} due_date
 * @property {string} invoice_pdf_url
 * @property {boolean} is_overdue
 * @property {Array<InvoiceLineItem>} line_items
 */

/**
 * @typedef {Object} InvoiceLineItem
 * @property {string} id
 * @property {string} line_type
 * @property {string} description
 * @property {number} quantity
 * @property {number} unit_amount
 * @property {number} amount
 * @property {number} tax_rate
 * @property {number} tax_amount
 */

/**
 * @typedef {Object} Payment
 * @property {string} id
 * @property {number} amount
 * @property {string} currency
 * @property {string} status
 * @property {string} payment_date
 * @property {string} receipt_url
 * @property {string} failure_reason
 */

/**
 * @typedef {Object} PaymentMethod
 * @property {string} id
 * @property {string} method_type
 * @property {string} last4
 * @property {string} brand
 * @property {number} exp_month
 * @property {number} exp_year
 * @property {boolean} is_default
 * @property {boolean} is_active
 * @property {string} billing_email
 * @property {string} billing_name
 */

/**
 * @typedef {Object} QuotaStatus
 * @property {Object} users
 * @property {Object} admins
 * @property {Object} kpis
 * @property {Object} storage
 * @property {Object} api_calls_today
 * @property {Object} features
 * @property {boolean} is_healthy
 */

/**
 * @typedef {Object} CheckoutSession
 * @property {string} session_id
 * @property {string} checkout_url
 * @property {string} stripe_customer_id
 */

/**
 * @typedef {Object} CustomerPortal
 * @property {string} portal_url
 * @property {string} session_id
 * @property {string} return_url
 */