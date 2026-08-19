import React from 'react';
import { Navigate } from 'react-router-dom';
import { BILLING_ROUTES, LEGACY_BILLING_REDIRECTS, buildBillingPath } from '../config/constants/billingRouteConstants';

export { BILLING_ROUTES, buildBillingPath };

const LoadingFallback = () => (
    <div className="billing-route-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        <div className="loading-spinner"></div>
        <span>Loading Billing...</span>
    </div>
);

const withSuspense = (Component) => (
    <React.Suspense fallback={<LoadingFallback />}>
        <Component />
    </React.Suspense>
);

// Common Layout
const BillingShell = React.lazy(() => import('../components/billing/common/BillingShell'));

// Customer Pages
const PlansPage = React.lazy(() => import('../pages/billing/PlansPage'));
const SubscriptionPage = React.lazy(() => import('../pages/billing/SubscriptionPage'));
const SubscriptionsPage = React.lazy(() => import('../pages/billing/SubscriptionsPage'));
const InvoicesPage = React.lazy(() => import('../pages/billing/InvoicesPage'));
const InvoiceDetailPage = React.lazy(() => import('../pages/billing/InvoiceDetailPage'));
const TransactionsPage = React.lazy(() => import('../pages/billing/TransactionsPage'));
const TransactionDetailPage = React.lazy(() => import('../pages/billing/TransactionDetailPage'));
const PaymentMethodsPage = React.lazy(() => import('../pages/billing/PaymentMethodsPage'));
const CheckoutPage = React.lazy(() => import('../pages/billing/CheckoutPage'));
const CheckoutSuccessPage = React.lazy(() => import('../pages/billing/CheckoutSuccessPage'));
const BillingPortalPage = React.lazy(() => import('../pages/billing/BillingPortalPage'));
const UsagePage = React.lazy(() => import('../pages/billing/UsagePage'));
const AuditLogsPage = React.lazy(() => import('../pages/billing/AuditLogsPage'));
const AnalyticsPage = React.lazy(() => import('../pages/billing/AnalyticsPage'));
const BillingOperationsPage = React.lazy(() => import('../pages/billing/BillingOperationsPage'));

// Admin Pages
const AdminDashboardPage = React.lazy(() => import('../pages/billing/AdminDashboardPage'));
const WebhookLogsPage = React.lazy(() => import('../pages/billing/WebhookLogsPage'));
const EnterprisePage = React.lazy(() => import('../pages/billing/EnterprisePage'));
const BillingPlatformSettingsPage = React.lazy(() => import('../pages/billing/BillingPlatformSettingsPage'));
const BillingSettingsPage = React.lazy(() => import('../pages/billing/BillingSettingsPage'));
const AdminPlansPage = React.lazy(() => import('../pages/billing/AdminPlansPage'));
const AdminSubscriptionsPage = React.lazy(() => import('../pages/billing/AdminSubscriptionsPage'));
const AdminTransactionsPage = React.lazy(() => import('../pages/billing/AdminTransactionsPage'));
const AdminRefundsPage = React.lazy(() => import('../pages/billing/AdminRefundsPage'));
const AdminWebhooksPage = React.lazy(() => import('../pages/billing/AdminWebhooksPage'));
const AdminAnalyticsPage = React.lazy(() => import('../pages/billing/AdminAnalyticsPage'));
const AdminEnterprisePage = React.lazy(() => import('../pages/billing/AdminEnterprisePage'));

// Legacy redirects
const legacyRedirects = LEGACY_BILLING_REDIRECTS.map(([from, to]) => ({
    path: from.replace(/^\//, ''),
    element: <Navigate to={to} replace />,
}));

const billingRoutes = [
    ...legacyRedirects,
    {
        path: 'billing',
        element: withSuspense(BillingShell),
        children: [
            // Index redirect
            { index: true, element: <Navigate to={BILLING_ROUTES.PORTAL} replace /> },

            // Customer Portal
            { path: 'portal', element: withSuspense(BillingPortalPage) },
            { path: 'dashboard', element: <Navigate to={BILLING_ROUTES.PORTAL} replace /> },

            // Plans
            { path: 'plans', element: withSuspense(PlansPage) },
            { path: 'plans/compare', element: withSuspense(PlansPage) },

            // Checkout
            { path: 'checkout', element: withSuspense(CheckoutPage) },
            { path: 'checkout/success', element: withSuspense(CheckoutSuccessPage) },
            { path: 'payment/success', element: <Navigate to={BILLING_ROUTES.CHECKOUT_SUCCESS} replace /> },
            { path: 'payment/cancelled', element: <Navigate to={BILLING_ROUTES.CHECKOUT_CANCEL} replace /> },

            // Subscriptions
            { path: 'subscriptions', element: withSuspense(SubscriptionsPage) },
            { path: 'subscriptions/current', element: <Navigate to={BILLING_ROUTES.SUBSCRIPTIONS} replace /> },
            { path: 'subscriptions/upgrade', element: withSuspense(SubscriptionPage) },
            { path: 'subscriptions/cancel', element: withSuspense(SubscriptionPage) },
            { path: 'subscriptions/:id', element: withSuspense(SubscriptionPage) },

            // Invoices
            { path: 'invoices', element: withSuspense(InvoicesPage) },
            { path: 'invoices/:id', element: withSuspense(InvoiceDetailPage) },

            // Transactions
            { path: 'transactions', element: withSuspense(TransactionsPage) },
            { path: 'transactions/:id', element: withSuspense(TransactionDetailPage) },

            // Payment Methods
            { path: 'payment-methods', element: withSuspense(PaymentMethodsPage) },

            // Usage Tracking
            { path: 'usage', element: withSuspense(UsagePage) },

            // Audit Logs
            { path: 'audit', element: withSuspense(AuditLogsPage) },
            { path: 'audit-logs', element: <Navigate to={BILLING_ROUTES.AUDIT_LOGS} replace /> },

            // Analytics
            { path: 'analytics', element: withSuspense(AnalyticsPage) },
            { path: 'reports', element: <Navigate to={BILLING_ROUTES.ANALYTICS} replace /> },
            { path: 'reports/revenue', element: withSuspense(AnalyticsPage) },
            { path: 'reports/subscriptions', element: withSuspense(AnalyticsPage) },
            { path: 'reports/tax', element: withSuspense(AnalyticsPage) },

            // Operations
            { path: 'operations', element: withSuspense(BillingOperationsPage) },

            // Settings
            { path: 'settings', element: withSuspense(BillingPortalPage) },

            // Admin Routes (Super Admin only - middleware handles access)
            { path: 'admin', element: withSuspense(AdminDashboardPage) },
            { path: 'admin/dashboard', element: <Navigate to={BILLING_ROUTES.ADMIN_BASE} replace /> },
            { path: 'admin/plans', element: withSuspense(AdminPlansPage) },
            { path: 'admin/subscriptions', element: withSuspense(AdminSubscriptionsPage) },
            { path: 'admin/transactions', element: withSuspense(AdminTransactionsPage) },
            { path: 'admin/refunds', element: withSuspense(AdminRefundsPage) },
            { path: 'admin/webhooks', element: withSuspense(AdminWebhooksPage) },
            { path: 'admin/analytics', element: withSuspense(AdminAnalyticsPage) },
            { path: 'admin/enterprise', element: withSuspense(AdminEnterprisePage) },

            // Webhook Logs
            { path: 'webhooks', element: withSuspense(WebhookLogsPage) },

            // Enterprise (Super Admin)
            { path: 'enterprise', element: withSuspense(EnterprisePage) },

            // Platform Settings (Super Admin)
            { path: 'platform-settings', element: withSuspense(BillingSettingsPage) },
            { path: 'system-settings', element: withSuspense(BillingPlatformSettingsPage) },
        ],
    },
];

export default billingRoutes;