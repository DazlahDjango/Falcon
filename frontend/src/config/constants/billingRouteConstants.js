/**
 * Canonical billing routes — aligned with /config (no /app prefix).
 * Use buildBillingPath() for dynamic segments.
 */

export const BILLING_ROUTES = {
    BASE: '/billing',
    PORTAL: '/billing/portal',
    PLANS: '/billing/plans',
    PLAN_DETAIL: (id = ':id') => `/billing/plans/${id}`,

    CHECKOUT: '/billing/checkout',
    CHECKOUT_SUCCESS: '/billing/checkout/success',
    CHECKOUT_CANCEL: '/billing/checkout/cancel',

    SUBSCRIPTIONS: '/billing/subscriptions',
    SUBSCRIPTION_DETAIL: (id = ':id') => `/billing/subscriptions/${id}`,
    SUBSCRIPTION_UPGRADE: '/billing/subscriptions/upgrade',
    SUBSCRIPTION_CANCEL: '/billing/subscriptions/cancel',

    INVOICES: '/billing/invoices',
    INVOICE_DETAIL: (id = ':id') => `/billing/invoices/${id}`,

    TRANSACTIONS: '/billing/transactions',
    TRANSACTION_DETAIL: (id = ':id') => `/billing/transactions/${id}`,

    PAYMENT_METHODS: '/billing/payment-methods',
    SETTINGS: '/billing/settings',

    ADMIN_BASE: '/billing/admin',
    ADMIN_PLANS: '/billing/admin/plans',
    ADMIN_SUBSCRIPTIONS: '/billing/admin/subscriptions',
    ADMIN_TRANSACTIONS: '/billing/admin/transactions',
    ADMIN_REFUNDS: '/billing/admin/refunds',
    ADMIN_WEBHOOKS: '/billing/admin/webhooks',
    ADMIN_ANALYTICS: '/billing/admin/analytics',

    REPORTS_REVENUE: '/billing/reports/revenue',
    REPORTS_SUBSCRIPTIONS: '/billing/reports/subscriptions',
    REPORTS_TAX: '/billing/reports/tax',

    PLATFORM_SETTINGS: '/billing/platform-settings',
};

/** Paths that render without the billing sub-nav (focused checkout flow). */
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

/** Legacy /app/billing and /app/admin/billing paths → canonical */
export const LEGACY_BILLING_REDIRECTS = [
    ['/app/billing', BILLING_ROUTES.PORTAL],
    ['/app/billing/portal', BILLING_ROUTES.PORTAL],
    ['/app/billing/plans', BILLING_ROUTES.PLANS],
    ['/app/billing/checkout', BILLING_ROUTES.CHECKOUT],
    ['/app/billing/checkout/success', BILLING_ROUTES.CHECKOUT_SUCCESS],
    ['/app/billing/checkout/cancel', BILLING_ROUTES.CHECKOUT_CANCEL],
    ['/app/billing/subscriptions', BILLING_ROUTES.SUBSCRIPTIONS],
    ['/app/billing/subscriptions/upgrade', BILLING_ROUTES.SUBSCRIPTION_UPGRADE],
    ['/app/billing/subscriptions/cancel', BILLING_ROUTES.SUBSCRIPTION_CANCEL],
    ['/app/billing/invoices', BILLING_ROUTES.INVOICES],
    ['/app/billing/transactions', BILLING_ROUTES.TRANSACTIONS],
    ['/app/billing/payment-methods', BILLING_ROUTES.PAYMENT_METHODS],
    ['/app/billing/settings', BILLING_ROUTES.SETTINGS],
    ['/app/admin/billing', BILLING_ROUTES.ADMIN_BASE],
    ['/app/admin/billing/plans', BILLING_ROUTES.ADMIN_PLANS],
    ['/app/admin/billing/subscriptions', BILLING_ROUTES.ADMIN_SUBSCRIPTIONS],
    ['/app/admin/billing/transactions', BILLING_ROUTES.ADMIN_TRANSACTIONS],
    ['/app/admin/billing/refunds', BILLING_ROUTES.ADMIN_REFUNDS],
    ['/app/admin/billing/webhooks', BILLING_ROUTES.ADMIN_WEBHOOKS],
    ['/app/admin/billing/analytics', BILLING_ROUTES.ADMIN_ANALYTICS],
    ['/app/reports/billing/revenue', BILLING_ROUTES.REPORTS_REVENUE],
    ['/app/reports/billing/subscriptions', BILLING_ROUTES.REPORTS_SUBSCRIPTIONS],
    ['/app/reports/billing/tax', BILLING_ROUTES.REPORTS_TAX],
    ['/app/billing/platform-settings', BILLING_ROUTES.PLATFORM_SETTINGS],
];
