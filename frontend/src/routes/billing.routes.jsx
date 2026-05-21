import React from 'react';
import { Navigate } from 'react-router-dom';
import {
    BILLING_ROUTES,
    LEGACY_BILLING_REDIRECTS,
    buildBillingPath,
} from '../config/constants/billingRouteConstants';

export { BILLING_ROUTES, buildBillingPath };

const LoadingFallback = () => (
    <div className="billing-route-loading">
        <div>Loading Billing…</div>
    </div>
);

const withSuspense = (Component) => (
    <React.Suspense fallback={<LoadingFallback />}>
        <Component />
    </React.Suspense>
);

const BillingShell = React.lazy(() => import('../components/billing/common/BillingShell'));

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

const AdminBillingPage = React.lazy(() => import('../pages/billing/admin/AdminBillingPage'));
const AdminPlansPage = React.lazy(() => import('../pages/billing/admin/AdminPlansPage'));
const AdminSubscriptionsPage = React.lazy(() => import('../pages/billing/admin/AdminSubscriptionsPage'));
const AdminTransactionsPage = React.lazy(() => import('../pages/billing/admin/AdminTransactionsPage'));
const AdminRefundsPage = React.lazy(() => import('../pages/billing/admin/AdminRefundsPage'));
const AdminWebhooksPage = React.lazy(() => import('../pages/billing/admin/AdminWebhooksPage'));
const AdminAnalyticsPage = React.lazy(() => import('../pages/billing/admin/AdminAnalyticsPage'));

const RevenueReportPage = React.lazy(() => import('../pages/billing/reports/RevenueReportPage'));
const SubscriptionReportPage = React.lazy(() => import('../pages/billing/reports/SubscriptionReportPage'));
const TaxReportPage = React.lazy(() => import('../pages/billing/reports/TaxReportPage'));
const BillingPlatformSettingsPage = React.lazy(() => import('../pages/billing/BillingPlatformSettingsPage'));

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
            { index: true, element: <Navigate to={BILLING_ROUTES.PORTAL} replace /> },
            { path: 'portal', element: withSuspense(BillingPortalPage) },
            { path: 'plans', element: withSuspense(PlansPage) },
            { path: 'plans/:id', element: withSuspense(PlanDetailPage) },
            { path: 'checkout', element: withSuspense(CheckoutPage) },
            { path: 'checkout/success', element: withSuspense(CheckoutSuccessPage) },
            { path: 'checkout/cancel', element: withSuspense(CheckoutCancelPage) },
            { path: 'subscriptions', element: withSuspense(SubscriptionsPage) },
            { path: 'subscriptions/upgrade', element: withSuspense(UpgradePage) },
            { path: 'subscriptions/cancel', element: withSuspense(CancelPage) },
            { path: 'subscriptions/:id', element: withSuspense(SubscriptionDetailPage) },
            { path: 'invoices', element: withSuspense(InvoicesPage) },
            { path: 'invoices/:id', element: withSuspense(InvoiceDetailPage) },
            { path: 'transactions', element: withSuspense(TransactionsPage) },
            { path: 'transactions/:id', element: withSuspense(TransactionDetailPage) },
            { path: 'payment-methods', element: withSuspense(PaymentMethodsPage) },
            { path: 'settings', element: withSuspense(BillingSettingsPage) },
            { path: 'admin', element: withSuspense(AdminBillingPage) },
            { path: 'admin/plans', element: withSuspense(AdminPlansPage) },
            { path: 'admin/subscriptions', element: withSuspense(AdminSubscriptionsPage) },
            { path: 'admin/transactions', element: withSuspense(AdminTransactionsPage) },
            { path: 'admin/refunds', element: withSuspense(AdminRefundsPage) },
            { path: 'admin/webhooks', element: withSuspense(AdminWebhooksPage) },
            { path: 'admin/analytics', element: withSuspense(AdminAnalyticsPage) },
            { path: 'reports/revenue', element: withSuspense(RevenueReportPage) },
            { path: 'reports/subscriptions', element: withSuspense(SubscriptionReportPage) },
            { path: 'reports/tax', element: withSuspense(TaxReportPage) },
            { path: 'platform-settings', element: withSuspense(BillingPlatformSettingsPage) },
        ],
    },
];

export default billingRoutes;
