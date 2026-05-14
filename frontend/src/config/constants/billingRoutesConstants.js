// frontend/src/config/constants/billingRoutesConstants.js
/**
 * Billing Module Route Constants
 * Centralized route definitions for billing pages
 */

// ============================================================================
// BASE ROUTES
// ============================================================================

export const BILLING_BASE_ROUTE = '/app/billing';
export const ADMIN_BILLING_BASE_ROUTE = '/admin/billing';

// ============================================================================
// BILLING ROUTES
// ============================================================================

export const BILLING_ROUTES = {
    // Main routes
    INDEX: '/app/billing',
    DASHBOARD: '/app/billing/dashboard',
    
    // Subscription
    SUBSCRIPTION: '/app/billing/subscription',
    SUBSCRIPTION_CURRENT: '/app/billing/subscription/current',
    SUBSCRIPTION_HISTORY: '/app/billing/subscription/history',
    SUBSCRIPTION_CANCEL: '/app/billing/subscription/cancel',
    SUBSCRIPTION_REACTIVATE: '/app/billing/subscription/reactivate',
    SUBSCRIPTION_UPGRADE: '/app/billing/subscription/upgrade',
    SUBSCRIPTION_DOWNGRADE: '/app/billing/subscription/downgrade',
    
    // Plans
    PLANS: '/app/billing/plans',
    PLAN_DETAIL: (slug = ':slug') => `/app/billing/plans/${slug}`,
    PLAN_COMPARE: '/app/billing/plans/compare',
    PLAN_FEATURES: (slug = ':slug') => `/app/billing/plans/${slug}/features`,
    
    // Checkout
    CHECKOUT: '/app/billing/checkout',
    CHECKOUT_SUCCESS: '/app/billing/checkout/success',
    CHECKOUT_CANCEL: '/app/billing/checkout/cancel',
    CHECKOUT_SESSION: (sessionId = ':sessionId') => `/app/billing/checkout/session/${sessionId}`,
    
    // Customer Portal
    CUSTOMER_PORTAL: '/app/billing/portal',
    CUSTOMER_PORTAL_RETURN: '/app/billing/portal/return',
    
    // Invoices
    INVOICES: '/app/billing/invoices',
    INVOICE_DETAIL: (id = ':id') => `/app/billing/invoices/${id}`,
    INVOICE_DOWNLOAD: (id = ':id') => `/app/billing/invoices/${id}/download`,
    INVOICE_PAY: (id = ':id') => `/app/billing/invoices/${id}/pay`,
    
    // Payments
    PAYMENTS: '/app/billing/payments',
    PAYMENT_DETAIL: (id = ':id') => `/app/billing/payments/${id}`,
    PAYMENT_RECEIPT: (id = ':id') => `/app/billing/payments/${id}/receipt`,
    
    // Payment Methods
    PAYMENT_METHODS: '/app/billing/payment-methods',
    PAYMENT_METHOD_ADD: '/app/billing/payment-methods/add',
    PAYMENT_METHOD_EDIT: (id = ':id') => `/app/billing/payment-methods/${id}/edit`,
    PAYMENT_METHOD_DEFAULT: '/app/billing/payment-methods/default',
    
    // Quota & Usage
    QUOTA: '/app/billing/quota',
    QUOTA_USAGE: '/app/billing/quota/usage',
    QUOTA_LIMITS: '/app/billing/quota/limits',
    USAGE_ANALYTICS: '/app/billing/usage-analytics',
    
    // Settings
    SETTINGS: '/app/billing/settings',
    BILLING_SETTINGS: '/app/billing/settings/billing',
    NOTIFICATION_SETTINGS: '/app/billing/settings/notifications',
    
    // API Keys (for API access feature)
    API_KEYS: '/app/billing/api-keys',
    API_KEY_CREATE: '/app/billing/api-keys/create',
    API_KEY_DETAIL: (id = ':id') => `/app/billing/api-keys/${id}`,
    
    // Webhooks (for webhook feature)
    WEBHOOKS: '/app/billing/webhooks',
    WEBHOOK_CREATE: '/app/billing/webhooks/create',
    WEBHOOK_DETAIL: (id = ':id') => `/app/billing/webhooks/${id}`,
    WEBHOOK_LOGS: (id = ':id') => `/app/billing/webhooks/${id}/logs`,
    
    // Reports
    REPORTS: '/app/billing/reports',
    INVOICE_REPORT: '/app/billing/reports/invoices',
    PAYMENT_REPORT: '/app/billing/reports/payments',
    USAGE_REPORT: '/app/billing/reports/usage',
    EXPORT_DATA: '/app/billing/export',
};

// ============================================================================
// ADMIN BILLING ROUTES (Super Admin only)
// ============================================================================

export const ADMIN_BILLING_ROUTES = {
    // Tenant billing management
    TENANTS: '/admin/billing/tenants',
    TENANT_DETAIL: (id = ':id') => `/admin/billing/tenants/${id}`,
    TENANT_SUBSCRIPTION: (id = ':id') => `/admin/billing/tenants/${id}/subscription`,
    TENANT_INVOICES: (id = ':id') => `/admin/billing/tenants/${id}/invoices`,
    TENANT_PAYMENTS: (id = ':id') => `/admin/billing/tenants/${id}/payments`,
    TENANT_QUOTA: (id = ':id') => `/admin/billing/tenants/${id}/quota`,
    TENANT_USAGE: (id = ':id') => `/admin/billing/tenants/${id}/usage`,
    
    // Plan management
    PLANS_MANAGEMENT: '/admin/billing/plans',
    PLAN_CREATE: '/admin/billing/plans/create',
    PLAN_EDIT: (id = ':id') => `/admin/billing/plans/${id}/edit`,
    PLAN_FEATURES_MANAGE: (id = ':id') => `/admin/billing/plans/${id}/features`,
    
    // Subscription management (all tenants)
    ALL_SUBSCRIPTIONS: '/admin/billing/subscriptions',
    SUBSCRIPTION_DETAIL: (id = ':id') => `/admin/billing/subscriptions/${id}`,
    
    // Invoice management
    ALL_INVOICES: '/admin/billing/invoices',
    INVOICE_MANAGE: (id = ':id') => `/admin/billing/invoices/${id}/manage`,
    
    // Payment management
    ALL_PAYMENTS: '/admin/billing/payments',
    PAYMENT_REFUND: (id = ':id') => `/admin/billing/payments/${id}/refund`,
    
    // Quota management (global)
    QUOTA_POLICIES: '/admin/billing/quota-policies',
    QUOTA_POLICY_CREATE: '/admin/billing/quota-policies/create',
    QUOTA_POLICY_EDIT: (id = ':id') => `/admin/billing/quota-policies/${id}/edit`,
    
    // Revenue analytics
    REVENUE_DASHBOARD: '/admin/billing/revenue',
    REVENUE_REPORT: '/admin/billing/revenue/report',
    REVENUE_FORECAST: '/admin/billing/revenue/forecast',
    MRR_ANALYTICS: '/admin/billing/revenue/mrr',
    CHURN_ANALYTICS: '/admin/billing/revenue/churn',
    LTV_ANALYTICS: '/admin/billing/revenue/ltv',
    
    // System settings
    BILLING_SYSTEM_SETTINGS: '/admin/billing/settings',
    TAX_SETTINGS: '/admin/billing/settings/tax',
    INVOICE_SETTINGS: '/admin/billing/settings/invoice',
    PAYMENT_GATEWAY_SETTINGS: '/admin/billing/settings/payment-gateway',
    EMAIL_TEMPLATES: '/admin/billing/settings/email-templates',
    
    // Audit logs
    BILLING_AUDIT_LOGS: '/admin/billing/audit-logs',
    BILLING_AUDIT_DETAIL: (id = ':id') => `/admin/billing/audit-logs/${id}`,
};

// ============================================================================
// DYNAMIC PATH BUILDERS
// ============================================================================

/**
 * Build a dynamic billing route path
 * @param {string} path - Route pattern with placeholders (e.g., '/app/billing/plans/:slug')
 * @param {Object} params - Parameters to replace
 * @returns {string} - Built path
 */
export const buildBillingPath = (path, params = {}) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, value);
    });
    return result;
};

// ============================================================================
// ROUTE PARAMETERS
// ============================================================================

export const BILLING_ROUTE_PARAMS = {
    PLAN_ID: 'planId',
    PLAN_SLUG: 'slug',
    SUBSCRIPTION_ID: 'subscriptionId',
    INVOICE_ID: 'invoiceId',
    PAYMENT_ID: 'paymentId',
    PAYMENT_METHOD_ID: 'paymentMethodId',
    SESSION_ID: 'sessionId',
    TENANT_ID: 'tenantId',
    WEBHOOK_ID: 'webhookId',
    API_KEY_ID: 'apiKeyId',
    AUDIT_LOG_ID: 'auditLogId',
};

// ============================================================================
// ROUTE GROUPS (for sidebar organization)
// ============================================================================

export const BILLING_ROUTE_GROUPS = {
    MAIN: {
        label: 'Billing',
        icon: 'CreditCardIcon',
        routes: [
            BILLING_ROUTES.DASHBOARD,
            BILLING_ROUTES.SUBSCRIPTION_CURRENT,
            BILLING_ROUTES.INVOICES,
            BILLING_ROUTES.PAYMENTS,
            BILLING_ROUTES.PAYMENT_METHODS,
        ],
    },
    SUBSCRIPTION: {
        label: 'Subscription',
        icon: 'CogIcon',
        routes: [
            BILLING_ROUTES.PLANS,
            BILLING_ROUTES.SUBSCRIPTION_UPGRADE,
            BILLING_ROUTES.SUBSCRIPTION_HISTORY,
            BILLING_ROUTES.QUOTA,
        ],
    },
    BILLING: {
        label: 'Billing',
        icon: 'DocumentTextIcon',
        routes: [
            BILLING_ROUTES.INVOICES,
            BILLING_ROUTES.PAYMENTS,
            BILLING_ROUTES.PAYMENT_METHODS,
        ],
    },
    SETTINGS: {
        label: 'Settings',
        icon: 'AdjustmentsHorizontalIcon',
        routes: [
            BILLING_ROUTES.BILLING_SETTINGS,
            BILLING_ROUTES.NOTIFICATION_SETTINGS,
            BILLING_ROUTES.API_KEYS,
            BILLING_ROUTES.WEBHOOKS,
        ],
    },
    REPORTS: {
        label: 'Reports',
        icon: 'ChartBarIcon',
        routes: [
            BILLING_ROUTES.INVOICE_REPORT,
            BILLING_ROUTES.PAYMENT_REPORT,
            BILLING_ROUTES.USAGE_REPORT,
            BILLING_ROUTES.EXPORT_DATA,
        ],
    },
};

export const ADMIN_BILLING_ROUTE_GROUPS = {
    TENANTS: {
        label: 'Tenant Management',
        icon: 'BuildingOfficeIcon',
        routes: [
            ADMIN_BILLING_ROUTES.TENANTS,
            ADMIN_BILLING_ROUTES.ALL_SUBSCRIPTIONS,
            ADMIN_BILLING_ROUTES.ALL_INVOICES,
            ADMIN_BILLING_ROUTES.ALL_PAYMENTS,
        ],
    },
    PLANS: {
        label: 'Plans & Features',
        icon: 'SparklesIcon',
        routes: [
            ADMIN_BILLING_ROUTES.PLANS_MANAGEMENT,
            ADMIN_BILLING_ROUTES.QUOTA_POLICIES,
        ],
    },
    REVENUE: {
        label: 'Revenue Analytics',
        icon: 'ChartPieIcon',
        routes: [
            ADMIN_BILLING_ROUTES.REVENUE_DASHBOARD,
            ADMIN_BILLING_ROUTES.MRR_ANALYTICS,
            ADMIN_BILLING_ROUTES.CHURN_ANALYTICS,
            ADMIN_BILLING_ROUTES.LTV_ANALYTICS,
            ADMIN_BILLING_ROUTES.REVENUE_FORECAST,
        ],
    },
    SYSTEM: {
        label: 'System Settings',
        icon: 'ServerIcon',
        routes: [
            ADMIN_BILLING_ROUTES.BILLING_SYSTEM_SETTINGS,
            ADMIN_BILLING_ROUTES.TAX_SETTINGS,
            ADMIN_BILLING_ROUTES.INVOICE_SETTINGS,
            ADMIN_BILLING_ROUTES.PAYMENT_GATEWAY_SETTINGS,
            ADMIN_BILLING_ROUTES.EMAIL_TEMPLATES,
        ],
    },
    AUDIT: {
        label: 'Audit',
        icon: 'ShieldCheckIcon',
        routes: [
            ADMIN_BILLING_ROUTES.BILLING_AUDIT_LOGS,
        ],
    },
};

// ============================================================================
// BREADCRUMB MAPPINGS
// ============================================================================

export const BILLING_BREADCRUMBS = {
    [BILLING_ROUTES.INDEX]: [{ label: 'Billing', path: BILLING_ROUTES.INDEX }],
    [BILLING_ROUTES.DASHBOARD]: [
        { label: 'Billing', path: BILLING_ROUTES.INDEX },
        { label: 'Dashboard', path: BILLING_ROUTES.DASHBOARD },
    ],
    [BILLING_ROUTES.SUBSCRIPTION_CURRENT]: [
        { label: 'Billing', path: BILLING_ROUTES.INDEX },
        { label: 'Subscription', path: BILLING_ROUTES.SUBSCRIPTION_CURRENT },
    ],
    [BILLING_ROUTES.PLANS]: [
        { label: 'Billing', path: BILLING_ROUTES.INDEX },
        { label: 'Plans', path: BILLING_ROUTES.PLANS },
    ],
    [BILLING_ROUTES.INVOICES]: [
        { label: 'Billing', path: BILLING_ROUTES.INDEX },
        { label: 'Invoices', path: BILLING_ROUTES.INVOICES },
    ],
    [BILLING_ROUTES.PAYMENT_METHODS]: [
        { label: 'Billing', path: BILLING_ROUTES.INDEX },
        { label: 'Payment Methods', path: BILLING_ROUTES.PAYMENT_METHODS },
    ],
    [BILLING_ROUTES.QUOTA]: [
        { label: 'Billing', path: BILLING_ROUTES.INDEX },
        { label: 'Usage & Quota', path: BILLING_ROUTES.QUOTA },
    ],
    [BILLING_ROUTES.CHECKOUT]: [
        { label: 'Billing', path: BILLING_ROUTES.INDEX },
        { label: 'Checkout', path: BILLING_ROUTES.CHECKOUT },
    ],
    [BILLING_ROUTES.CHECKOUT_SUCCESS]: [
        { label: 'Billing', path: BILLING_ROUTES.INDEX },
        { label: 'Checkout', path: BILLING_ROUTES.CHECKOUT },
        { label: 'Success', path: BILLING_ROUTES.CHECKOUT_SUCCESS },
    ],
};