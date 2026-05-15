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
    // Base endpoints
    LIST: `${BILLING_API_PREFIX}/plans/`,
    DETAIL: (id) => `${BILLING_API_PREFIX}/plans/${id}/`,
    CREATE: `${BILLING_API_PREFIX}/plans/`,
    UPDATE: (id) => `${BILLING_API_PREFIX}/plans/${id}/`,
    DELETE: (id) => `${BILLING_API_PREFIX}/plans/${id}/`,
    PARTIAL_UPDATE: (id) => `${BILLING_API_PREFIX}/plans/${id}/`,
    
    // Special endpoints
    POPULAR: `${BILLING_API_PREFIX}/plans/popular/`,
    COMPARE: `${BILLING_API_PREFIX}/plans/compare/`,
    
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
    // Base endpoints
    LIST: `${BILLING_API_PREFIX}/subscriptions/`,
    DETAIL: (id) => `${BILLING_API_PREFIX}/subscriptions/${id}/`,
    CREATE: `${BILLING_API_PREFIX}/subscriptions/`,
    UPDATE: (id) => `${BILLING_API_PREFIX}/subscriptions/${id}/`,
    DELETE: (id) => `${BILLING_API_PREFIX}/subscriptions/${id}/`,
    PARTIAL_UPDATE: (id) => `${BILLING_API_PREFIX}/subscriptions/${id}/`,
    
    // Special endpoints
    CURRENT: `${BILLING_API_PREFIX}/subscriptions/current/`,
    CANCEL: (id) => `${BILLING_API_PREFIX}/subscriptions/${id}/cancel/`,
    RENEW: (id) => `${BILLING_API_PREFIX}/subscriptions/${id}/renew/`,
    UPGRADE: (id) => `${BILLING_API_PREFIX}/subscriptions/${id}/upgrade/`,
    DOWNGRADE: (id) => `${BILLING_API_PREFIX}/subscriptions/${id}/downgrade/`,
    INVOICES: (id) => `${BILLING_API_PREFIX}/subscriptions/${id}/invoices/`,
    TRANSACTIONS: (id) => `${BILLING_API_PREFIX}/subscriptions/${id}/transactions/`,
    
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
    // Base endpoints
    LIST: `${BILLING_API_PREFIX}/transactions/`,
    DETAIL: (id) => `${BILLING_API_PREFIX}/transactions/${id}/`,
    
    // Special endpoints
    VERIFY: `${BILLING_API_PREFIX}/transactions/verify/`,
    REFUND: (id) => `${BILLING_API_PREFIX}/transactions/${id}/refund/`,
    
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
    // Base endpoints
    LIST: `${BILLING_API_PREFIX}/invoices/`,
    DETAIL: (id) => `${BILLING_API_PREFIX}/invoices/${id}/`,
    
    // Special endpoints
    DOWNLOAD: (id) => `${BILLING_API_PREFIX}/invoices/${id}/download/`,
    SEND: (id) => `${BILLING_API_PREFIX}/invoices/${id}/send/`,
    PAY: (id) => `${BILLING_API_PREFIX}/invoices/${id}/pay/`,
    SUMMARY: `${BILLING_API_PREFIX}/invoices/summary/`,
    
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
    // Base endpoints
    INITIALIZE: `${BILLING_API_PREFIX}/checkout/initialize/`,
    VERIFY: `${BILLING_API_PREFIX}/checkout/verify/`,
    CALLBACK: `${BILLING_API_PREFIX}/checkout/callback/`,
    
    // Payment methods
    METHODS: `${BILLING_API_PREFIX}/checkout/methods/`,
};

// ============================================================================
// Payment Method Endpoints
// ============================================================================

export const PAYMENT_METHOD_ENDPOINTS = {
    // Base endpoints
    LIST: `${BILLING_API_PREFIX}/payment-methods/`,
    DETAIL: (id) => `${BILLING_API_PREFIX}/payment-methods/${id}/`,
    CREATE: `${BILLING_API_PREFIX}/payment-methods/`,
    DELETE: (id) => `${BILLING_API_PREFIX}/payment-methods/${id}/`,
    
    // Special endpoints
    SET_DEFAULT: (id) => `${BILLING_API_PREFIX}/payment-methods/${id}/set-default/`,
    
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
    // Base endpoints
    ACCESS: `${BILLING_API_PREFIX}/portal/access/`,
    OVERVIEW: `${BILLING_API_PREFIX}/portal/`,
    SETTINGS: `${BILLING_API_PREFIX}/portal/settings/`,
};

// ============================================================================
// Webhook Endpoints (Internal/Admin)
// ============================================================================

export const WEBHOOK_ENDPOINTS = {
    PAYSTACK: `${BILLING_API_PREFIX}/webhook/paystack/`,
    LOGS: `${BILLING_API_PREFIX}/webhook/logs/`,
    RETRY: (id) => `${BILLING_API_PREFIX}/webhook/${id}/retry/`,
};

// ============================================================================
// Analytics Endpoints
// ============================================================================

export const ANALYTICS_ENDPOINTS = {
    SUMMARY: `${BILLING_API_PREFIX}/analytics/summary/`,
    REVENUE: `${BILLING_API_PREFIX}/analytics/revenue/`,
    SUBSCRIPTIONS: `${BILLING_API_PREFIX}/analytics/subscriptions/`,
    TAX: `${BILLING_API_PREFIX}/analytics/tax/`,
    FORECAST: `${BILLING_API_PREFIX}/analytics/forecast/`,
    
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
    TENANT_SUBSCRIPTIONS: (tenantId) => `${BILLING_API_PREFIX}/admin/tenants/${tenantId}/subscriptions/`,
    TENANT_INVOICES: (tenantId) => `${BILLING_API_PREFIX}/admin/tenants/${tenantId}/invoices/`,
    TENANT_TRANSACTIONS: (tenantId) => `${BILLING_API_PREFIX}/admin/tenants/${tenantId}/transactions/`,
    
    // Bulk operations
    BULK_UPDATE_SUBSCRIPTIONS: `${BILLING_API_PREFIX}/admin/subscriptions/bulk-update/`,
    
    // Reports
    REVENUE_REPORT: `${BILLING_API_PREFIX}/admin/reports/revenue/`,
    SUBSCRIPTION_REPORT: `${BILLING_API_PREFIX}/admin/reports/subscriptions/`,
    TAX_REPORT: `${BILLING_API_PREFIX}/admin/reports/tax/`,
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