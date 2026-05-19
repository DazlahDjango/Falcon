// ============================================================================
// Base API Configuration
// ============================================================================

export const BILLING_API_BASE = '/billing';
export const API_VERSION = 'v1';
export const BILLING_API_PREFIX = `/api/${API_VERSION}${BILLING_API_BASE}`;

// ============================================================================
// Plan Endpoints
// ============================================================================

export const PLAN_ENDPOINTS = {
    // Base endpoints (relative paths for use with axios baseURL)
    LIST: `plans/`,
    DETAIL: (id) => `plans/${id}/`,
    CREATE: `plans/`,
    UPDATE: (id) => `plans/${id}/`,
    DELETE: (id) => `plans/${id}/`,
    PARTIAL_UPDATE: (id) => `plans/${id}/`,
    
    // Special endpoints
    POPULAR: `plans/popular/`,
    COMPARE: `plans/compare/`,
    
    // Query params
    QUERY_PARAMS: {
        PLAN_TYPE: 'plan_type',
        BILLING_INTERVAL: 'billing_interval',
        EXCLUDE_TRIAL: 'exclude_trial',
        IS_ACTIVE: 'is_active',
    },
};

// ============================================================================
// Subscription Endpoints
// ============================================================================

export const SUBSCRIPTION_ENDPOINTS = {
    // Base endpoints (relative paths for use with axios baseURL)
    LIST: `subscriptions/`,
    DETAIL: (id) => `subscriptions/${id}/`,
    CREATE: `subscriptions/`,
    UPDATE: (id) => `subscriptions/${id}/`,
    DELETE: (id) => `subscriptions/${id}/`,
    PARTIAL_UPDATE: (id) => `subscriptions/${id}/`,
    
    // Special endpoints
    CURRENT: `subscriptions/current/`,
    CANCEL: (id) => `subscriptions/${id}/cancel/`,
    RENEW: (id) => `subscriptions/${id}/renew/`,
    UPGRADE: (id) => `subscriptions/${id}/upgrade/`,
    DOWNGRADE: (id) => `subscriptions/${id}/downgrade/`,
    INVOICES: (id) => `subscriptions/${id}/invoices/`,
    TRANSACTIONS: (id) => `subscriptions/${id}/transactions/`,
    
    // Query params
    QUERY_PARAMS: {
        STATUS: 'status',
        PLAN_TYPE: 'plan_type',
        ACTIVE_ONLY: 'active_only',
        START_DATE: 'start_date',
        END_DATE: 'end_date',
    },
};

// ============================================================================
// Transaction Endpoints
// ============================================================================

export const TRANSACTION_ENDPOINTS = {
    // Base endpoints (relative paths for use with axios baseURL)
    LIST: `transactions/`,
    DETAIL: (id) => `transactions/${id}/`,
    
    // Special endpoints
    VERIFY: `transactions/verify/`,
    REFUND: (id) => `transactions/${id}/refund/`,
    
    // Query params
    QUERY_PARAMS: {
        STATUS: 'status',
        TRANSACTION_TYPE: 'transaction_type',
        START_DATE: 'start_date',
        END_DATE: 'end_date',
        REFERENCE: 'reference',
    },
};

// ============================================================================
// Invoice Endpoints
// ============================================================================

export const INVOICE_ENDPOINTS = {
    // Base endpoints (relative paths for use with axios baseURL)
    LIST: `invoices/`,
    DETAIL: (id) => `invoices/${id}/`,
    
    // Special endpoints
    DOWNLOAD: (id) => `invoices/${id}/download/`,
    SEND: (id) => `invoices/${id}/send/`,
    PAY: (id) => `invoices/${id}/pay/`,
    SUMMARY: `invoices/summary/`,
    
    // Query params
    QUERY_PARAMS: {
        STATUS: 'status',
        UNPAID_ONLY: 'unpaid_only',
        START_DATE: 'start_date',
        END_DATE: 'end_date',
        INVOICE_NUMBER: 'invoice_number',
    },
};

// ============================================================================
// Checkout Endpoints
// ============================================================================

export const CHECKOUT_ENDPOINTS = {
    // Base endpoints (relative paths for use with axios baseURL)
    INITIALIZE: `checkout/initialize/`,
    VERIFY: `checkout/verify/`,
    CALLBACK: `checkout/callback/`,
    
    // Payment methods
    METHODS: `checkout/methods/`,
};

// ============================================================================
// Payment Method Endpoints
// ============================================================================

export const PAYMENT_METHOD_ENDPOINTS = {
    // Base endpoints (relative paths for use with axios baseURL)
    LIST: `payment-methods/`,
    DETAIL: (id) => `payment-methods/${id}/`,
    CREATE: `payment-methods/`,
    DELETE: (id) => `payment-methods/${id}/`,
    
    // Special endpoints
    SET_DEFAULT: (id) => `payment-methods/${id}/set_default/`,
    
    // Query params
    QUERY_PARAMS: {
        STATUS: 'status',
        PAYMENT_TYPE: 'payment_type',
        ACTIVE_ONLY: 'active_only',
    },
};

// ============================================================================
// Billing Portal Endpoints
// ============================================================================

export const BILLING_PORTAL_ENDPOINTS = {
    // Base endpoints (relative paths for use with axios baseURL)
    ACCESS: `portal/access/`,
    OVERVIEW: `portal/`,
    SETTINGS: `portal/settings/`,
};

// ============================================================================
// Webhook Endpoints (Internal/Admin)
// ============================================================================

export const WEBHOOK_ENDPOINTS = {
    // Relative paths for use with axios baseURL
    PAYSTACK: `webhook/paystack/`,
    LOGS: `webhook/logs/`,
    RETRY: (id) => `webhook/${id}/retry/`,
};

// ============================================================================
// Analytics Endpoints
// ============================================================================

export const ANALYTICS_ENDPOINTS = {
    // Relative paths for use with axios baseURL
    SUMMARY: `analytics/summary/`,
    REVENUE: `analytics/revenue/`,
    SUBSCRIPTIONS: `analytics/subscriptions/`,
    TAX: `analytics/tax/`,
    FORECAST: `analytics/forecast/`,
    
    // Query params
    QUERY_PARAMS: {
        DAYS: 'days',
        PERIOD: 'period',
        YEAR: 'year',
        START_DATE: 'start_date',
        END_DATE: 'end_date',
    },
};

// ============================================================================
// Admin Billing Endpoints
// ============================================================================

export const ADMIN_BILLING_ENDPOINTS = {
    // Tenant management
    TENANT_SUBSCRIPTIONS: (tenantId) => `admin/tenants/${tenantId}/subscriptions/`,
    TENANT_INVOICES: (tenantId) => `admin/tenants/${tenantId}/invoices/`,
    TENANT_TRANSACTIONS: (tenantId) => `admin/tenants/${tenantId}/transactions/`,
    
    // Bulk operations
    BULK_UPDATE_SUBSCRIPTIONS: `admin/subscriptions/bulk-update/`,
    
    // Reports
    REVENUE_REPORT: `admin/reports/revenue/`,
    SUBSCRIPTION_REPORT: `admin/reports/subscriptions/`,
    TAX_REPORT: `admin/reports/tax/`,
};

// ============================================================================
// API Response Constants
// ============================================================================

export const API_STATUS = {
    SUCCESS: 'success',
    ERROR: 'error',
    PENDING: 'pending',
    PROCESSING: 'processing',
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
};

// ============================================================================
// Error Codes
// ============================================================================

export const BILLING_ERROR_CODES = {
    SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
    FEATURE_NOT_AVAILABLE: 'feature_not_available',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    INVOICE_NOT_FOUND: 'INVOICE_NOT_FOUND',
    TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
    PLAN_NOT_FOUND: 'PLAN_NOT_FOUND',
    PAYMENT_METHOD_NOT_FOUND: 'PAYMENT_METHOD_NOT_FOUND',
    INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
    EXPIRED_CARD: 'EXPIRED_CARD',
    INVALID_WEBHOOK_SIGNATURE: 'INVALID_WEBHOOK_SIGNATURE',
    DUPLICATE_WEBHOOK: 'DUPLICATE_WEBHOOK',
    RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
    SUBSCRIPTION_ALREADY_ACTIVE: 'SUBSCRIPTION_ALREADY_ACTIVE',
    SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
    CANNOT_DOWNGRADE: 'CANNOT_DOWNGRADE',
    CANNOT_UPGRADE: 'CANNOT_UPGRADE',
};

// ============================================================================
// Webhook Event Types
// ============================================================================

export const WEBHOOK_EVENTS = {
    CHARGE_SUCCESS: 'charge.success',
    CHARGE_DISPUTE_CREATE: 'charge.dispute.create',
    CHARGE_DISPUTE_REMIND: 'charge.dispute.remind',
    CHARGE_DISPUTE_RESOLVE: 'charge.dispute.resolve',
    SUBSCRIPTION_CREATE: 'subscription.create',
    SUBSCRIPTION_DISABLE: 'subscription.disable',
    SUBSCRIPTION_ENABLE: 'subscription.enable',
    INVOICE_CREATE: 'invoice.create',
    INVOICE_UPDATE: 'invoice.update',
    INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
    PAYMENTREQUEST_SUCCESS: 'paymentrequest.success',
};

// ============================================================================
// Checkout Channels
// ============================================================================

export const PAYMENT_CHANNELS = {
    CARD: 'card',
    BANK: 'bank',
    USSD: 'ussd',
    QR: 'qr',
    MOBILE_MONEY: 'mobile_money',
    BANK_TRANSFER: 'bank_transfer',
};

// ============================================================================
// Export all endpoints as default object
// ============================================================================

export default {
    PLAN_ENDPOINTS,
    SUBSCRIPTION_ENDPOINTS,
    TRANSACTION_ENDPOINTS,
    INVOICE_ENDPOINTS,
    CHECKOUT_ENDPOINTS,
    PAYMENT_METHOD_ENDPOINTS,
    BILLING_PORTAL_ENDPOINTS,
    WEBHOOK_ENDPOINTS,
    ANALYTICS_ENDPOINTS,
    ADMIN_BILLING_ENDPOINTS,
    API_STATUS,
    HTTP_STATUS,
    BILLING_ERROR_CODES,
    WEBHOOK_EVENTS,
    PAYMENT_CHANNELS,
};