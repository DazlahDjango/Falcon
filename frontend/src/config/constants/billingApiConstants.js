// frontend/src/config/constants/billingApiConstants.js
/**
 * Billing API Endpoints
 * Centralized API endpoint configuration for billing module
 */

import { API_BASE_URL } from '../environment.js';

// Base billing API path
const BILLING_API_BASE = `${API_BASE_URL}/billing`;

// ============================================================================
// PLAN ENDPOINTS
// ============================================================================

export const PLAN_API_ENDPOINTS = {
    // Base endpoints
    LIST: `${BILLING_API_BASE}/plans/`,
    DETAIL: (id) => `${BILLING_API_BASE}/plans/${id}/`,
    FEATURES: (id) => `${BILLING_API_BASE}/plans/${id}/features/`,
    SUBSCRIPTIONS: (id) => `${BILLING_API_BASE}/plans/${id}/subscriptions/`,
    COMPARE: `${BILLING_API_BASE}/plans/compare/`,
    PUBLIC_LIST: `${BILLING_API_BASE}/plans/public/`,
    RECOMMENDED: `${BILLING_API_BASE}/plans/recommended/`,
};

// ============================================================================
// SUBSCRIPTION ENDPOINTS
// ============================================================================

export const SUBSCRIPTION_API_ENDPOINTS = {
    // Base endpoints
    LIST: `${BILLING_API_BASE}/subscriptions/`,
    DETAIL: (id) => `${BILLING_API_BASE}/subscriptions/${id}/`,
    CREATE: `${BILLING_API_BASE}/subscriptions/`,
    UPDATE: (id) => `${BILLING_API_BASE}/subscriptions/${id}/`,
    DELETE: (id) => `${BILLING_API_BASE}/subscriptions/${id}/`,
    PARTIAL_UPDATE: (id) => `${BILLING_API_BASE}/subscriptions/${id}/`,
    
    // Actions
    CURRENT: `${BILLING_API_BASE}/subscriptions/current/`,
    STATUS: `${BILLING_API_BASE}/subscriptions/status/`,
    CANCEL: (id) => `${BILLING_API_BASE}/subscriptions/${id}/cancel/`,
    REACTIVATE: (id) => `${BILLING_API_BASE}/subscriptions/${id}/reactivate/`,
    SYNC: (id) => `${BILLING_API_BASE}/subscriptions/${id}/sync/`,
    HISTORY: (id) => `${BILLING_API_BASE}/subscriptions/${id}/history/`,
    
    // Nested resources
    INVOICES: (id) => `${BILLING_API_BASE}/subscriptions/${id}/invoices/`,
    PAYMENTS: (id) => `${BILLING_API_BASE}/subscriptions/${id}/payments/`,
    INVOICE_DETAIL: (subId, invId) => `${BILLING_API_BASE}/subscriptions/${subId}/invoices/${invId}/`,
    PAYMENT_DETAIL: (subId, payId) => `${BILLING_API_BASE}/subscriptions/${subId}/payments/${payId}/`,
};

// ============================================================================
// INVOICE ENDPOINTS
// ============================================================================

export const INVOICE_API_ENDPOINTS = {
    // Base endpoints
    LIST: `${BILLING_API_BASE}/invoices/`,
    DETAIL: (id) => `${BILLING_API_BASE}/invoices/${id}/`,
    DOWNLOAD: (id) => `${BILLING_API_BASE}/invoices/${id}/download/`,
    REMIND: (id) => `${BILLING_API_BASE}/invoices/${id}/remind/`,
    OUTSTANDING: `${BILLING_API_BASE}/invoices/outstanding/`,
    SUMMARY: `${BILLING_API_BASE}/invoices/summary/`,
    
    // Nested resources
    LINE_ITEMS: (id) => `${BILLING_API_BASE}/invoices/${id}/line-items/`,
    PAYMENTS: (id) => `${BILLING_API_BASE}/invoices/${id}/payments/`,
};

// ============================================================================
// PAYMENT ENDPOINTS
// ============================================================================

export const PAYMENT_API_ENDPOINTS = {
    // Base endpoints
    LIST: `${BILLING_API_BASE}/payments/`,
    DETAIL: (id) => `${BILLING_API_BASE}/payments/${id}/`,
    RETRY: (id) => `${BILLING_API_BASE}/payments/${id}/retry/`,
    REFUND: (id) => `${BILLING_API_BASE}/payments/${id}/refund/`,
    SUMMARY: `${BILLING_API_BASE}/payments/summary/`,
};

// ============================================================================
// PAYMENT METHOD ENDPOINTS
// ============================================================================

export const PAYMENT_METHOD_API_ENDPOINTS = {
    // Base endpoints
    LIST: `${BILLING_API_BASE}/payment-methods/`,
    DETAIL: (id) => `${BILLING_API_BASE}/payment-methods/${id}/`,
    CREATE: `${BILLING_API_BASE}/payment-methods/`,
    DELETE: (id) => `${BILLING_API_BASE}/payment-methods/${id}/`,
    SET_DEFAULT: (id) => `${BILLING_API_BASE}/payment-methods/${id}/set_default/`,
    DEFAULT: `${BILLING_API_BASE}/payment-methods/default/`,
    EXPIRING_SOON: `${BILLING_API_BASE}/payment-methods/expiring-soon/`,
    SETUP_INTENT: `${BILLING_API_BASE}/payment-methods/setup-intent/`,
    DETACH: (id) => `${BILLING_API_BASE}/payment-methods/${id}/detach/`,
};

// ============================================================================
// CHECKOUT ENDPOINTS
// ============================================================================

export const CHECKOUT_API_ENDPOINTS = {
    CREATE_SESSION: `${BILLING_API_BASE}/checkout/`,
    GET_SESSION: (sessionId) => `${BILLING_API_BASE}/checkout/session/?session_id=${sessionId}`,
    GET_SESSION_BY_ID: (id) => `${BILLING_API_BASE}/checkout/${id}/`,
    CREATE_PORTAL_SESSION: `${BILLING_API_BASE}/portal/`,
};

// ============================================================================
// QUOTA ENDPOINTS
// ============================================================================

export const QUOTA_API_ENDPOINTS = {
    STATUS: `${BILLING_API_BASE}/quota/`,
    LIMITS: `${BILLING_API_BASE}/quota/limits/`,
    REFRESH: `${BILLING_API_BASE}/quota/refresh/`,
    USAGE_HISTORY: `${BILLING_API_BASE}/quota/usage-history/`,
};

// ============================================================================
// WEBHOOK ENDPOINT
// ============================================================================

export const WEBHOOK_API_ENDPOINTS = {
    STRIPE: `${API_BASE_URL}/webhook/stripe/`,
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