import React from 'react';
import { Navigate } from 'react-router-dom';
import { BILLING_ROUTES, ADMIN_BILLING_ROUTES, buildBillingPath } from '../config/constants/billingRoutesConstants';

// ============================================================================
// USER BILLING PAGES
// ============================================================================

// Main billing pages
const BillingDashboard = React.lazy(() => import('../pages/billing/dashboards/BillingDashboard'));
const SubscriptionCurrent = React.lazy(() => import('../pages/billing/subscription/SubscriptionCurrent'));
const SubscriptionHistory = React.lazy(() => import('../pages/billing/subscription/SubscriptionHistory'));
const SubscriptionCancel = React.lazy(() => import('../pages/billing/subscription/SubscriptionCancel'));
const SubscriptionReactivate = React.lazy(() => import('../pages/billing/subscription/SubscriptionReactivate'));
const SubscriptionUpgrade = React.lazy(() => import('../pages/billing/subscription/SubscriptionUpgrade'));
const SubscriptionDowngrade = React.lazy(() => import('../pages/billing/subscription/SubscriptionDowngrade'));

// Plan pages
const PlanList = React.lazy(() => import('../pages/billing/plans/PlanList'));
const PlanDetail = React.lazy(() => import('../pages/billing/plans/PlanDetail'));
const PlanCompare = React.lazy(() => import('../pages/billing/plans/PlanCompare'));

// Checkout pages
const Checkout = React.lazy(() => import('../pages/billing/checkout/Checkout'));
const CheckoutSuccess = React.lazy(() => import('../pages/billing/checkout/CheckoutSuccess'));
const CheckoutCancel = React.lazy(() => import('../pages/billing/checkout/CheckoutCancel'));

// Customer Portal
const CustomerPortal = React.lazy(() => import('../pages/billing/dashboards/CustomerPortal'));
const CustomerPortalReturn = React.lazy(() => import('../pages/billing/dashboards/CustomerPortalReturn'));

// Invoice pages
const InvoiceList = React.lazy(() => import('../pages/billing/invoice/InvoiceList'));
const InvoiceDetail = React.lazy(() => import('../pages/billing/invoice/InvoiceDetail'));

// Payment pages
const PaymentList = React.lazy(() => import('../pages/billing/payment/PaymentList'));
const PaymentDetail = React.lazy(() => import('../pages/billing/payment/PaymentDetail'));

// Payment Method pages
const PaymentMethodList = React.lazy(() => import('../pages/billing/paymentMethod/PaymentMethodList'));
const PaymentMethodAdd = React.lazy(() => import('../pages/billing/paymentMethod/PaymentMethodAdd'));
const PaymentMethodEdit = React.lazy(() => import('../pages/billing/paymentMethod/PaymentMethodEdit'));

// Quota pages
const QuotaStatus = React.lazy(() => import('../pages/billing/Quota/QuotaStatus'));
const QuotaUsage = React.lazy(() => import('../pages/billing/Quota/QuotaUsage'));
const UsageAnalytics = React.lazy(() => import('../pages/billing/reports/UsageAnalytics'));

// Settings pages
const BillingSettings = React.lazy(() => import('../pages/billing/settings/BillingSettings'));
const NotificationSettings = React.lazy(() => import('../pages/billing/settings/NotificationSettings'));

// API Keys pages
const ApiKeyList = React.lazy(() => import('../pages/billing/api/ApiKeyList'));
const ApiKeyCreate = React.lazy(() => import('../pages/billing/api/ApiKeyCreate'));
const ApiKeyDetail = React.lazy(() => import('../pages/billing/api/ApiKeyDetail'));

// Webhook pages
const WebhookList = React.lazy(() => import('../pages/billing/webhook/WebhookList'));
const WebhookCreate = React.lazy(() => import('../pages/billing/webhook/WebhookCreate'));
const WebhookDetail = React.lazy(() => import('../pages/billing/webhook/WebhookDetail'));
const WebhookLogs = React.lazy(() => import('../pages/billing/webhook/WebhookLogs'));

// Report pages
const InvoiceReport = React.lazy(() => import('../pages/billing/reports/InvoiceReport'));
const PaymentReport = React.lazy(() => import('../pages/billing/reports/PaymentReport'));
const UsageReport = React.lazy(() => import('../pages/billing/reports/UsageReport'));
const ExportData = React.lazy(() => import('../pages/billing/reports/ExportData'));

// ============================================================================
// ADMIN BILLING PAGES (Super Admin only - Commented out until created)
// ============================================================================

/*
const TenantBillingList = React.lazy(() => import('../pages/admin/billing/TenantBillingList'));
const TenantBillingDetail = React.lazy(() => import('../pages/admin/billing/TenantBillingDetail'));
const TenantSubscriptionManage = React.lazy(() => import('../pages/admin/billing/TenantSubscriptionManage'));
const TenantQuotaManage = React.lazy(() => import('../pages/admin/billing/TenantQuotaManage'));

const PlanManagementList = React.lazy(() => import('../pages/admin/billing/PlanManagementList'));
const PlanCreate = React.lazy(() => import('../pages/admin/billing/PlanCreate'));
const PlanEdit = React.lazy(() => import('../pages/admin/billing/PlanEdit'));
const PlanFeaturesManage = React.lazy(() => import('../pages/admin/billing/PlanFeaturesManage'));

const AllSubscriptions = React.lazy(() => import('../pages/admin/billing/AllSubscriptions'));
const SubscriptionDetailAdmin = React.lazy(() => import('../pages/admin/billing/SubscriptionDetailAdmin'));

const AllInvoices = React.lazy(() => import('../pages/admin/billing/AllInvoices'));
const InvoiceManage = React.lazy(() => import('../pages/admin/billing/InvoiceManage'));

const AllPayments = React.lazy(() => import('../pages/admin/billing/AllPayments'));
const PaymentRefund = React.lazy(() => import('../pages/admin/billing/PaymentRefund'));

const QuotaPolicies = React.lazy(() => import('../pages/admin/billing/QuotaPolicies'));
const QuotaPolicyCreate = React.lazy(() => import('../pages/admin/billing/QuotaPolicyCreate'));
const QuotaPolicyEdit = React.lazy(() => import('../pages/admin/billing/QuotaPolicyEdit'));

const RevenueDashboard = React.lazy(() => import('../pages/admin/billing/RevenueDashboard'));
const MrrAnalytics = React.lazy(() => import('../pages/admin/billing/MrrAnalytics'));
const ChurnAnalytics = React.lazy(() => import('../pages/admin/billing/ChurnAnalytics'));
const LtvAnalytics = React.lazy(() => import('../pages/admin/billing/LtvAnalytics'));
const RevenueForecast = React.lazy(() => import('../pages/admin/billing/RevenueForecast'));

const BillingSystemSettings = React.lazy(() => import('../pages/admin/billing/BillingSystemSettings'));
const TaxSettings = React.lazy(() => import('../pages/admin/billing/TaxSettings'));
const InvoiceSettings = React.lazy(() => import('../pages/admin/billing/InvoiceSettings'));
const PaymentGatewaySettings = React.lazy(() => import('../pages/admin/billing/PaymentGatewaySettings'));
const EmailTemplates = React.lazy(() => import('../pages/admin/billing/EmailTemplates'));
const BillingAuditLogs = React.lazy(() => import('../pages/admin/billing/BillingAuditLogs'));
const BillingAuditDetail = React.lazy(() => import('../pages/admin/billing/BillingAuditDetail'));
*/

// Regular user billing routes
export const billingRoutes = [
    // Dashboard
    { path: BILLING_ROUTES.INDEX, element: <Navigate to={BILLING_ROUTES.DASHBOARD} replace /> },
    { path: BILLING_ROUTES.DASHBOARD, element: <BillingDashboard /> },
    
    // Subscription
    { path: BILLING_ROUTES.SUBSCRIPTION_CURRENT, element: <SubscriptionCurrent /> },
    { path: BILLING_ROUTES.SUBSCRIPTION_HISTORY, element: <SubscriptionHistory /> },
    { path: BILLING_ROUTES.SUBSCRIPTION_CANCEL, element: <SubscriptionCancel /> },
    { path: BILLING_ROUTES.SUBSCRIPTION_REACTIVATE, element: <SubscriptionReactivate /> },
    { path: BILLING_ROUTES.SUBSCRIPTION_UPGRADE, element: <SubscriptionUpgrade /> },
    { path: BILLING_ROUTES.SUBSCRIPTION_DOWNGRADE, element: <SubscriptionDowngrade /> },
    
    // Plans
    { path: BILLING_ROUTES.PLANS, element: <PlanList /> },
    { path: BILLING_ROUTES.PLAN_DETAIL(), element: <PlanDetail /> },
    { path: BILLING_ROUTES.PLAN_COMPARE, element: <PlanCompare /> },
    
    // Checkout
    { path: BILLING_ROUTES.CHECKOUT, element: <Checkout /> },
    { path: BILLING_ROUTES.CHECKOUT_SUCCESS, element: <CheckoutSuccess /> },
    { path: BILLING_ROUTES.CHECKOUT_CANCEL, element: <CheckoutCancel /> },
    
    // Customer Portal
    { path: BILLING_ROUTES.CUSTOMER_PORTAL, element: <CustomerPortal /> },
    { path: BILLING_ROUTES.CUSTOMER_PORTAL_RETURN, element: <CustomerPortalReturn /> },
    
    // Invoices
    { path: BILLING_ROUTES.INVOICES, element: <InvoiceList /> },
    { path: BILLING_ROUTES.INVOICE_DETAIL(), element: <InvoiceDetail /> },
    
    // Payments
    { path: BILLING_ROUTES.PAYMENTS, element: <PaymentList /> },
    { path: BILLING_ROUTES.PAYMENT_DETAIL(), element: <PaymentDetail /> },
    
    // Payment Methods
    { path: BILLING_ROUTES.PAYMENT_METHODS, element: <PaymentMethodList /> },
    { path: BILLING_ROUTES.PAYMENT_METHOD_ADD, element: <PaymentMethodAdd /> },
    { path: BILLING_ROUTES.PAYMENT_METHOD_EDIT(), element: <PaymentMethodEdit /> },
    
    // Quota
    { path: BILLING_ROUTES.QUOTA, element: <QuotaStatus /> },
    { path: BILLING_ROUTES.QUOTA_USAGE, element: <QuotaUsage /> },
    { path: BILLING_ROUTES.USAGE_ANALYTICS, element: <UsageAnalytics /> },
    
    // Settings
    { path: BILLING_ROUTES.BILLING_SETTINGS, element: <BillingSettings /> },
    { path: BILLING_ROUTES.NOTIFICATION_SETTINGS, element: <NotificationSettings /> },
    
    // API Keys (feature-gated)
    { path: BILLING_ROUTES.API_KEYS, element: <ApiKeyList /> },
    { path: BILLING_ROUTES.API_KEY_CREATE, element: <ApiKeyCreate /> },
    { path: BILLING_ROUTES.API_KEY_DETAIL(), element: <ApiKeyDetail /> },
    
    // Webhooks (feature-gated)
    { path: BILLING_ROUTES.WEBHOOKS, element: <WebhookList /> },
    { path: BILLING_ROUTES.WEBHOOK_CREATE, element: <WebhookCreate /> },
    { path: BILLING_ROUTES.WEBHOOK_DETAIL(), element: <WebhookDetail /> },
    { path: BILLING_ROUTES.WEBHOOK_LOGS(), element: <WebhookLogs /> },
    
    // Reports
    { path: BILLING_ROUTES.INVOICE_REPORT, element: <InvoiceReport /> },
    { path: BILLING_ROUTES.PAYMENT_REPORT, element: <PaymentReport /> },
    { path: BILLING_ROUTES.USAGE_REPORT, element: <UsageReport /> },
    { path: BILLING_ROUTES.EXPORT_DATA, element: <ExportData /> },
];

// Admin billing routes (Super Admin only - placeholder array for now)
export const adminBillingRoutes = [];

/*
const adminBillingRouteList = [
    // Tenant management
    { path: ADMIN_BILLING_ROUTES.TENANTS, element: <TenantBillingList /> },
    { path: ADMIN_BILLING_ROUTES.TENANT_DETAIL(), element: <TenantBillingDetail /> },
    { path: ADMIN_BILLING_ROUTES.TENANT_SUBSCRIPTION(), element: <TenantSubscriptionManage /> },
    { path: ADMIN_BILLING_ROUTES.TENANT_QUOTA(), element: <TenantQuotaManage /> },
    
    // Plan management
    { path: ADMIN_BILLING_ROUTES.PLANS_MANAGEMENT, element: <PlanManagementList /> },
    { path: ADMIN_BILLING_ROUTES.PLAN_CREATE, element: <PlanCreate /> },
    { path: ADMIN_BILLING_ROUTES.PLAN_EDIT(), element: <PlanEdit /> },
    { path: ADMIN_BILLING_ROUTES.PLAN_FEATURES_MANAGE(), element: <PlanFeaturesManage /> },
    
    // Subscription management
    { path: ADMIN_BILLING_ROUTES.ALL_SUBSCRIPTIONS, element: <AllSubscriptions /> },
    { path: ADMIN_BILLING_ROUTES.SUBSCRIPTION_DETAIL(), element: <SubscriptionDetailAdmin /> },
    
    // Invoice management
    { path: ADMIN_BILLING_ROUTES.ALL_INVOICES, element: <AllInvoices /> },
    { path: ADMIN_BILLING_ROUTES.INVOICE_MANAGE(), element: <InvoiceManage /> },
    
    // Payment management
    { path: ADMIN_BILLING_ROUTES.ALL_PAYMENTS, element: <AllPayments /> },
    { path: ADMIN_BILLING_ROUTES.PAYMENT_REFUND(), element: <PaymentRefund /> },
    
    // Quota policies
    { path: ADMIN_BILLING_ROUTES.QUOTA_POLICIES, element: <QuotaPolicies /> },
    { path: ADMIN_BILLING_ROUTES.QUOTA_POLICY_CREATE, element: <QuotaPolicyCreate /> },
    { path: ADMIN_BILLING_ROUTES.QUOTA_POLICY_EDIT(), element: <QuotaPolicyEdit /> },
    
    // Revenue analytics
    { path: ADMIN_BILLING_ROUTES.REVENUE_DASHBOARD, element: <RevenueDashboard /> },
    { path: ADMIN_BILLING_ROUTES.MRR_ANALYTICS, element: <MrrAnalytics /> },
    { path: ADMIN_BILLING_ROUTES.CHURN_ANALYTICS, element: <ChurnAnalytics /> },
    { path: ADMIN_BILLING_ROUTES.LTV_ANALYTICS, element: <LtvAnalytics /> },
    { path: ADMIN_BILLING_ROUTES.REVENUE_FORECAST, element: <RevenueForecast /> },
    
    // System settings
    { path: ADMIN_BILLING_ROUTES.BILLING_SYSTEM_SETTINGS, element: <BillingSystemSettings /> },
    { path: ADMIN_BILLING_ROUTES.TAX_SETTINGS, element: <TaxSettings /> },
    { path: ADMIN_BILLING_ROUTES.INVOICE_SETTINGS, element: <InvoiceSettings /> },
    { path: ADMIN_BILLING_ROUTES.PAYMENT_GATEWAY_SETTINGS, element: <PaymentGatewaySettings /> },
    { path: ADMIN_BILLING_ROUTES.EMAIL_TEMPLATES, element: <EmailTemplates /> },
    
    // Audit logs
    { path: ADMIN_BILLING_ROUTES.BILLING_AUDIT_LOGS, element: <BillingAuditLogs /> },
    { path: ADMIN_BILLING_ROUTES.BILLING_AUDIT_DETAIL(), element: <BillingAuditDetail /> },
];
*/

export {
    BILLING_ROUTES,
    ADMIN_BILLING_ROUTES,
    buildBillingPath,
};

// For direct import in main router
export default billingRoutes;