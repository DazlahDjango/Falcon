export const BILLING_ROUTES = {
    BASE: '/billing',
    PORTAL: '/billing/portal',
    DASHBOARD: '/billing/portal',

    // Plans
    PLANS: '/billing/plans',
    PLAN_DETAIL: (id = ':id') => `/billing/plans/${id}`,
    PLAN_COMPARE: '/billing/plans/compare',

    // Checkout
    CHECKOUT: '/billing/checkout',
    CHECKOUT_SUCCESS: '/billing/checkout/success',
    CHECKOUT_CANCEL: '/billing/checkout/cancel',

    // Subscriptions
    SUBSCRIPTIONS: '/billing/subscriptions',
    SUBSCRIPTION_DETAIL: (id = ':id') => `/billing/subscriptions/${id}`,
    SUBSCRIPTION_UPGRADE: '/billing/subscriptions/upgrade',
    SUBSCRIPTION_CANCEL: '/billing/subscriptions/cancel',
    SUBSCRIPTION_CURRENT: '/billing/subscriptions/current',

    // Invoices
    INVOICES: '/billing/invoices',
    INVOICE_DETAIL: (id = ':id') => `/billing/invoices/${id}`,

    // Transactions
    TRANSACTIONS: '/billing/transactions',
    TRANSACTION_DETAIL: (id = ':id') => `/billing/transactions/${id}`,

    // Payment Methods
    PAYMENT_METHODS: '/billing/payment-methods',

    // Usage Tracking
    USAGE: '/billing/usage',

    // Audit Logs
    AUDIT_LOGS: '/billing/audit',

    // Analytics
    ANALYTICS: '/billing/analytics',
    REPORTS_REVENUE: '/billing/reports/revenue',
    REPORTS_SUBSCRIPTIONS: '/billing/reports/subscriptions',
    REPORTS_TAX: '/billing/reports/tax',

    // Operations
    OPERATIONS: '/billing/operations',

    // Settings
    SETTINGS: '/billing/settings',

    // Admin
    ADMIN_BASE: '/billing/admin',
    ADMIN_DASHBOARD: '/billing/admin',
    ADMIN_PLANS: '/billing/admin/plans',
    ADMIN_SUBSCRIPTIONS: '/billing/admin/subscriptions',
    ADMIN_TRANSACTIONS: '/billing/admin/transactions',
    ADMIN_REFUNDS: '/billing/admin/refunds',
    ADMIN_WEBHOOKS: '/billing/admin/webhooks',
    ADMIN_ANALYTICS: '/billing/admin/analytics',
    ADMIN_ENTERPRISE: '/billing/admin/enterprise',

    // Webhooks
    WEBHOOKS: '/billing/webhooks',

    // Enterprise
    ENTERPRISE: '/billing/enterprise',

    // Platform Settings
    PLATFORM_SETTINGS: '/billing/platform-settings',
    SYSTEM_SETTINGS: '/billing/system-settings',
};

export const BILLING_MINIMAL_CHROME_PATHS = [
    BILLING_ROUTES.CHECKOUT,
    BILLING_ROUTES.CHECKOUT_SUCCESS,
    BILLING_ROUTES.CHECKOUT_CANCEL,
];

export const buildBillingPath = (path, params = {}) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, String(value));
    });
    return result;
};

export const LEGACY_BILLING_REDIRECTS = [
    ['/app/billing', BILLING_ROUTES.PORTAL],
    ['/app/billing/portal', BILLING_ROUTES.PORTAL],
    ['/app/billing/dashboard', BILLING_ROUTES.PORTAL],
    ['/app/billing/plans', BILLING_ROUTES.PLANS],
    ['/app/billing/plans/compare', BILLING_ROUTES.PLAN_COMPARE],
    ['/app/billing/checkout', BILLING_ROUTES.CHECKOUT],
    ['/app/billing/checkout/success', BILLING_ROUTES.CHECKOUT_SUCCESS],
    ['/app/billing/checkout/cancel', BILLING_ROUTES.CHECKOUT_CANCEL],
    ['/app/billing/subscriptions', BILLING_ROUTES.SUBSCRIPTIONS],
    ['/app/billing/subscriptions/upgrade', BILLING_ROUTES.SUBSCRIPTION_UPGRADE],
    ['/app/billing/subscriptions/cancel', BILLING_ROUTES.SUBSCRIPTION_CANCEL],
    ['/app/billing/invoices', BILLING_ROUTES.INVOICES],
    ['/app/billing/transactions', BILLING_ROUTES.TRANSACTIONS],
    ['/app/billing/payment-methods', BILLING_ROUTES.PAYMENT_METHODS],
    ['/app/billing/usage', BILLING_ROUTES.USAGE],
    ['/app/billing/audit', BILLING_ROUTES.AUDIT_LOGS],
    ['/app/billing/analytics', BILLING_ROUTES.ANALYTICS],
    ['/app/billing/settings', BILLING_ROUTES.SETTINGS],
    ['/app/admin/billing', BILLING_ROUTES.ADMIN_BASE],
    ['/app/admin/billing/plans', BILLING_ROUTES.ADMIN_PLANS],
    ['/app/admin/billing/subscriptions', BILLING_ROUTES.ADMIN_SUBSCRIPTIONS],
    ['/app/admin/billing/transactions', BILLING_ROUTES.ADMIN_TRANSACTIONS],
    ['/app/admin/billing/refunds', BILLING_ROUTES.ADMIN_REFUNDS],
    ['/app/admin/billing/webhooks', BILLING_ROUTES.ADMIN_WEBHOOKS],
    ['/app/admin/billing/analytics', BILLING_ROUTES.ADMIN_ANALYTICS],
    ['/app/admin/billing/enterprise', BILLING_ROUTES.ADMIN_ENTERPRISE],
    ['/app/reports/billing/revenue', BILLING_ROUTES.REPORTS_REVENUE],
    ['/app/reports/billing/subscriptions', BILLING_ROUTES.REPORTS_SUBSCRIPTIONS],
    ['/app/reports/billing/tax', BILLING_ROUTES.REPORTS_TAX],
    ['/app/billing/platform-settings', BILLING_ROUTES.PLATFORM_SETTINGS],
    ['/app/billing/webhooks', BILLING_ROUTES.WEBHOOKS],
    ['/app/billing/enterprise', BILLING_ROUTES.ENTERPRISE],
];