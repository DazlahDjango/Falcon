import React from 'react';

// Loading component
const LoadingFallback = () => (
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '16rem' 
    }}>
        <div>Loading Billing...</div>
    </div>
);

const withSuspense = (Component) => (
    <React.Suspense fallback={<LoadingFallback />}>
        <Component />
    </React.Suspense>
);

// Lazy load billing pages
const PlansPage = React.lazy(() => import('../pages/billing/PlansPage'));
const PlanDetailPage = React.lazy(() => import('../pages/billing/PlanDetailPage'));
const CheckoutPage = React.lazy(() => import('../pages/billing/CheckoutPage'));
const CheckoutSuccessPage = React.lazy(() => import('../pages/billing/CheckoutSuccessPage'));
const CheckoutCancelPage = React.lazy(() => import('../pages/billing/CheckoutCancelPage'));
const SubscriptionsPage = React.lazy(() => import('../pages/billing/SubscriptionsPage'));
const SubscriptionDetailPage = React.lazy(() => import('../pages/billing/SubscriptionDetailPage'));
const UpgradePage = React.lazy(() => import('../pages/billing/UpgradePage'));
const CancelPage = React.lazy(() => import('../pages/billing/CancelPage'));
const InvoicesPage = React.lazy(() => import('../pages/billing/InvoicesPage'));
const InvoiceDetailPage = React.lazy(() => import('../pages/billing/InvoiceDetailPage'));
const TransactionsPage = React.lazy(() => import('../pages/billing/TransactionsPage'));
const TransactionDetailPage = React.lazy(() => import('../pages/billing/TransactionDetailPage'));
const PaymentMethodsPage = React.lazy(() => import('../pages/billing/PaymentMethodsPage'));
const BillingPortalPage = React.lazy(() => import('../pages/billing/BillingPortalPage'));
const BillingSettingsPage = React.lazy(() => import('../pages/billing/BillingSettingsPage'));
// Admin pages
const AdminBillingPage = React.lazy(() => import('../pages/billing/admin/AdminBillingPage'));
const AdminPlansPage = React.lazy(() => import('../pages/billing/admin/AdminPlansPage'));
const AdminSubscriptionsPage = React.lazy(() => import('../pages/billing/admin/AdminSubscriptionsPage'));
const AdminTransactionsPage = React.lazy(() => import('../pages/billing/admin/AdminTransactionsPage'));
const AdminRefundsPage = React.lazy(() => import('../pages/billing/admin/AdminRefundsPage'));
const AdminWebhooksPage = React.lazy(() => import('../pages/billing/admin/AdminWebhooksPage'));
const AdminAnalyticsPage = React.lazy(() => import('../pages/billing/admin/AdminAnalyticsPage'));
// Report pages
const RevenueReportPage = React.lazy(() => import('../pages/billing/reports/RevenueReportPage'));
const SubscriptionReportPage = React.lazy(() => import('../pages/billing/reports/SubscriptionReportPage'));
const TaxReportPage = React.lazy(() => import('../pages/billing/reports/TaxReportPage'));

// BILLING ROUTES CONSTANTS
// ===========================
export const BILLING_ROUTES = {
    // Base
    BASE: '/app/billing',
    
    // Plans
    PLANS: '/app/billing/plans',
    PLAN_DETAIL: (id = ':id') => `/app/billing/plans/${id}`,
    
    // Checkout
    CHECKOUT: '/app/billing/checkout',
    CHECKOUT_SUCCESS: '/app/billing/checkout/success',
    CHECKOUT_CANCEL: '/app/billing/checkout/cancel',
    
    // Subscriptions
    SUBSCRIPTIONS: '/app/billing/subscriptions',
    SUBSCRIPTION_DETAIL: (id = ':id') => `/app/billing/subscriptions/${id}`,
    SUBSCRIPTION_UPGRADE: '/app/billing/subscriptions/upgrade',
    SUBSCRIPTION_CANCEL: '/app/billing/subscriptions/cancel',
    
    // Invoices
    INVOICES: '/app/billing/invoices',
    INVOICE_DETAIL: (id = ':id') => `/app/billing/invoices/${id}`,
    
    // Transactions
    TRANSACTIONS: '/app/billing/transactions',
    TRANSACTION_DETAIL: (id = ':id') => `/app/billing/transactions/${id}`,
    
    // Payment Methods
    PAYMENT_METHODS: '/app/billing/payment-methods',
    
    // Billing Portal
    BILLING_PORTAL: '/app/billing/portal',
    BILLING_SETTINGS: '/app/billing/settings',
    
    // Admin
    ADMIN_BILLING: '/app/admin/billing',
    ADMIN_PLANS: '/app/admin/billing/plans',
    ADMIN_SUBSCRIPTIONS: '/app/admin/billing/subscriptions',
    ADMIN_TRANSACTIONS: '/app/admin/billing/transactions',
    ADMIN_REFUNDS: '/app/admin/billing/refunds',
    ADMIN_WEBHOOKS: '/app/admin/billing/webhooks',
    ADMIN_ANALYTICS: '/app/admin/billing/analytics',
    
    // Reports
    REPORTS_REVENUE: '/app/reports/billing/revenue',
    REPORTS_SUBSCRIPTIONS: '/app/reports/billing/subscriptions',
    REPORTS_TAX: '/app/reports/billing/tax',
};

// BILLING ROUTES ARRAY
// ======================
const billingRoutes = [
    // Plans
    { path: BILLING_ROUTES.PLANS, element: withSuspense(PlansPage) },
    { path: BILLING_ROUTES.PLAN_DETAIL(), element: withSuspense(PlanDetailPage) },
    // Checkout
    { path: BILLING_ROUTES.CHECKOUT, element: withSuspense(CheckoutPage) },
    { path: BILLING_ROUTES.CHECKOUT_SUCCESS, element: withSuspense(CheckoutSuccessPage) },
    { path: BILLING_ROUTES.CHECKOUT_CANCEL, element: withSuspense(CheckoutCancelPage) },
    // Subscriptions
    { path: BILLING_ROUTES.SUBSCRIPTIONS, element: withSuspense(SubscriptionsPage) },
    { path: BILLING_ROUTES.SUBSCRIPTION_DETAIL(), element: withSuspense(SubscriptionDetailPage) },
    { path: BILLING_ROUTES.SUBSCRIPTION_UPGRADE, element: withSuspense(UpgradePage) },
    { path: BILLING_ROUTES.SUBSCRIPTION_CANCEL, element: withSuspense(CancelPage) },
    // Invoices
    { path: BILLING_ROUTES.INVOICES, element: withSuspense(InvoicesPage) },
    { path: BILLING_ROUTES.INVOICE_DETAIL(), element: withSuspense(InvoiceDetailPage) },
    // Transactions
    { path: BILLING_ROUTES.TRANSACTIONS, element: withSuspense(TransactionsPage) },
    { path: BILLING_ROUTES.TRANSACTION_DETAIL(), element: withSuspense(TransactionDetailPage) },
    // Payment Methods
    { path: BILLING_ROUTES.PAYMENT_METHODS, element: withSuspense(PaymentMethodsPage) },
    // Billing Portal
    { path: BILLING_ROUTES.BILLING_PORTAL, element: withSuspense(BillingPortalPage) },
    { path: BILLING_ROUTES.BILLING_SETTINGS, element: withSuspense(BillingSettingsPage) },
    // Admin Routes
    { path: BILLING_ROUTES.ADMIN_BILLING, element: withSuspense(AdminBillingPage) },
    { path: BILLING_ROUTES.ADMIN_PLANS, element: withSuspense(AdminPlansPage) },
    { path: BILLING_ROUTES.ADMIN_SUBSCRIPTIONS, element: withSuspense(AdminSubscriptionsPage) },
    { path: BILLING_ROUTES.ADMIN_TRANSACTIONS, element: withSuspense(AdminTransactionsPage) },
    { path: BILLING_ROUTES.ADMIN_REFUNDS, element: withSuspense(AdminRefundsPage) },
    { path: BILLING_ROUTES.ADMIN_WEBHOOKS, element: withSuspense(AdminWebhooksPage) },
    { path: BILLING_ROUTES.ADMIN_ANALYTICS, element: withSuspense(AdminAnalyticsPage) },
    // Report Routes
    { path: BILLING_ROUTES.REPORTS_REVENUE, element: withSuspense(RevenueReportPage) },
    { path: BILLING_ROUTES.REPORTS_SUBSCRIPTIONS, element: withSuspense(SubscriptionReportPage) },
    { path: BILLING_ROUTES.REPORTS_TAX, element: withSuspense(TaxReportPage) },
];

// Helper function to build dynamic paths (for use in components)
export const buildBillingPath = (path, params = {}) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, value);
    });
    return result;
};

export default billingRoutes;