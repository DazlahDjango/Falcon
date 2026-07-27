export const BILLING_API_BASE = '/billing';
export const API_VERSION = 'v1';
export const BILLING_API_PREFIX = `/api/${API_VERSION}${BILLING_API_BASE}`;

export const PLAN_ENDPOINTS = {
    LIST: `plans/`,
    DETAIL: (id) => `plans/${id}/`,
    CREATE: `plans/`,
    UPDATE: (id) => `plans/${id}/`,
    DELETE: (id) => `plans/${id}/`,
    PUBLIC: `plans/public/`,
    COMPARISON: `plans/comparison/`,
    SYNC_PAYSTACK: (id) => `plans/${id}/sync-to-paystack/`,
    QUERY_PARAMS: { PLAN_TYPE: 'plan_type', BILLING_INTERVAL: 'billing_interval', IS_ACTIVE: 'is_active' },
};

export const SUBSCRIPTION_ENDPOINTS = {
    LIST: `subscriptions/`,
    DETAIL: (id) => `subscriptions/${id}/`,
    CREATE: `subscriptions/`,
    UPDATE: (id) => `subscriptions/${id}/`,
    CURRENT: `subscriptions/current/`,
    CANCEL: (id) => `subscriptions/${id}/cancel/`,
    CANCEL_IMMEDIATE: (id) => `subscriptions/${id}/cancel-immediate/`,
    RENEW: (id) => `subscriptions/${id}/renew/`,
    UPGRADE: (id, planId) => `subscriptions/${id}/upgrade/${planId}/`,
    DOWNGRADE: (id, planId) => `subscriptions/${id}/downgrade/${planId}/`,
    EXTEND_TRIAL: (id) => `subscriptions/${id}/extend-trial/`,
    USAGE: (id) => `subscriptions/${id}/usage/`,
    INVOICES: (id) => `subscriptions/${id}/invoices/`,
    TRANSACTIONS: (id) => `subscriptions/${id}/transactions/`,
    ADMIN_CANCEL: `subscriptions/admin/cancel/`,
    QUERY_PARAMS: { STATUS: 'status', PLAN_TYPE: 'plan_type', ACTIVE_ONLY: 'active_only' },
};

export const TRANSACTION_ENDPOINTS = {
    LIST: `transactions/`,
    DETAIL: (id) => `transactions/${id}/`,
    VERIFY: `transactions/verify/`,
    REFUND: (id) => `transactions/${id}/refund/`,
    SUMMARY: `transactions/summary/`,
    ADMIN_STATS: `transactions/admin/stats/`,
    QUERY_PARAMS: { STATUS: 'status', TYPE: 'transaction_type', REFERENCE: 'reference' },
};

export const INVOICE_ENDPOINTS = {
    LIST: `invoices/`,
    DETAIL: (id) => `invoices/${id}/`,
    OUTSTANDING: `invoices/outstanding/`,
    DOWNLOAD: (id) => `invoices/${id}/download/`,
    SEND: (id) => `invoices/${id}/send/`,
    ADMIN_OVERDUE: `invoices/admin/overdue/`,
    QUERY_PARAMS: { STATUS: 'status', UNPAID_ONLY: 'unpaid_only' },
};

export const CHECKOUT_ENDPOINTS = {
    INITIALIZE: `checkout/initialize/`,
    VERIFY: `checkout/verify/`,
    CALLBACK: `checkout/callback/`,
};

export const PAYMENT_METHOD_ENDPOINTS = {
    LIST: `payment-methods/`,
    DETAIL: (id) => `payment-methods/${id}/`,
    CREATE: `payment-methods/`,
    DELETE: (id) => `payment-methods/${id}/`,
    SET_DEFAULT: (id) => `payment-methods/${id}/set-default/`,
};

export const USAGE_ENDPOINTS = {
    TRACK: `usage/track/`,
    SUMMARY: `usage/summary/`,
    LIMITS: `usage/limits/`,
};

export const AUDIT_ENDPOINTS = {
    LIST: `audit-logs/`,
    FILTER: `audit-logs/filter/`,
    EXPORT: `audit-logs/export/`,
    SUMMARY: `audit-logs/summary/`,
};

export const ENTERPRISE_ENDPOINTS = {
    LIST: `enterprise/`,
    CREATE: `enterprise/`,
    DETAIL: (id) => `enterprise/${id}/`,
    UPDATE: (id) => `enterprise/${id}/`,
    DELETE: (id) => `enterprise/${id}/`,
    ACTIVE: (tenantId) => `enterprise/active/${tenantId}/`,
    EXPIRE: `enterprise/expire/`,
    DYNAMIC_PLAN_CREATE: `enterprise/dynamic-plans/create/`,
    DYNAMIC_PLAN_UPDATE: (planId) => `enterprise/dynamic-plans/${planId}/`,
    DYNAMIC_PLAN_LIST: `enterprise/dynamic-plans/all/`,
};

export const ANALYTICS_ENDPOINTS = {
    SUMMARY: `analytics/summary/`,
    REVENUE: `analytics/revenue/`,
    SUBSCRIPTIONS: `analytics/subscriptions/`,
    ADMIN_REVENUE: `analytics/admin/revenue/`,
    ADMIN_SUBSCRIPTIONS: `analytics/admin/subscriptions/`,
    QUERY_PARAMS: { DAYS: 'days', PERIOD: 'period', YEAR: 'year' },
};

export const PORTAL_ENDPOINTS = {
    ACCESS: `portal/`,
    INFO: `portal/`,
};

export const WEBHOOK_ENDPOINTS = {
    PAYSTACK: `webhook/paystack/`,
};

export const SYSTEM_ENDPOINTS = {
    SETTINGS: `system-settings/`,
};

export const API_STATUS = { SUCCESS: 'success', ERROR: 'error', PENDING: 'pending' };

export const HTTP_STATUS = {
    OK: 200, CREATED: 201, ACCEPTED: 202, NO_CONTENT: 204,
    BAD_REQUEST: 400, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429, INTERNAL_SERVER_ERROR: 500,
};

export const BILLING_ERROR_CODES = {
    SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
    FEATURE_NOT_AVAILABLE: 'feature_not_available',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    INVOICE_NOT_FOUND: 'INVOICE_NOT_FOUND',
    TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
    PLAN_NOT_FOUND: 'PLAN_NOT_FOUND',
    PAYMENT_METHOD_NOT_FOUND: 'PAYMENT_METHOD_NOT_FOUND',
    RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
    SUBSCRIPTION_ALREADY_ACTIVE: 'SUBSCRIPTION_ALREADY_ACTIVE',
    CANNOT_DOWNGRADE: 'CANNOT_DOWNGRADE',
    CANNOT_UPGRADE: 'CANNOT_UPGRADE',
};

export const WEBHOOK_EVENTS = {
    CHARGE_SUCCESS: 'charge.success',
    SUBSCRIPTION_CREATE: 'subscription.create',
    SUBSCRIPTION_DISABLE: 'subscription.disable',
    SUBSCRIPTION_ENABLE: 'subscription.enable',
    INVOICE_CREATE: 'invoice.create',
    INVOICE_UPDATE: 'invoice.update',
    INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
};

export const ADMIN_BILLING_ENDPOINTS = {
    // Tenant management
    TENANT_SUBSCRIPTIONS: (tenantId) => `/admin/tenants/${tenantId}/subscriptions/`,
    TENANT_INVOICES: (tenantId) => `/admin/tenants/${tenantId}/invoices/`,
    TENANT_TRANSACTIONS: (tenantId) => `/admin/tenants/${tenantId}/transactions/`,
    
    // Bulk operations
    BULK_UPDATE_SUBSCRIPTIONS: `/admin/subscriptions/bulk-update/`,
    
    // Reports
    REVENUE_REPORT: `/admin/reports/revenue/`,
    SUBSCRIPTION_REPORT: `/admin/reports/subscriptions/`,
    TAX_REPORT: `/admin/reports/tax/`,
};


export const PAYMENT_CHANNELS = { CARD: 'card', BANK: 'bank', USSD: 'ussd', QR: 'qr', MOBILE_MONEY: 'mobile_money' };

export default {
    PLAN_ENDPOINTS, SUBSCRIPTION_ENDPOINTS, TRANSACTION_ENDPOINTS, INVOICE_ENDPOINTS,
    CHECKOUT_ENDPOINTS, PAYMENT_METHOD_ENDPOINTS, USAGE_ENDPOINTS, AUDIT_ENDPOINTS,
    ENTERPRISE_ENDPOINTS, ANALYTICS_ENDPOINTS, PORTAL_ENDPOINTS, WEBHOOK_ENDPOINTS,
    SYSTEM_ENDPOINTS, API_STATUS, HTTP_STATUS, BILLING_ERROR_CODES, WEBHOOK_EVENTS, PAYMENT_CHANNELS, ADMIN_BILLING_ENDPOINTS,
};