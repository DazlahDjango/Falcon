import React from 'react';
import { Navigate } from 'react-router-dom';
import { BILLING_ROUTES, ADMIN_BILLING_ROUTES, buildBillingPath } from '../config/constants/billingRoutesConstants';

// Main billing pages
const BillingDashboard = React.lazy(() => import('../pages/billing'));
const SubscriptionCurrent = React.lazy(() => import('../pages/billing'));
const SubscriptionHistory = React.lazy(() => import('../pages/billing'));
const SubscriptionCancel = React.lazy(() => import('../pages/billing'));
const SubscriptionReactivate = React.lazy(() => import('../pages/billing'));
const SubscriptionUpgrade = React.lazy(() => import('../pages/billing'));
const SubscriptionDowngrade = React.lazy(() => import('../pages/billing'));

// Plan pages
const PlanList = React.lazy(() => import('../pages/billing/PlanList'));
const PlanDetail = React.lazy(() => import('../pages/billing/PlanDetail'));
const PlanCompare = React.lazy(() => import('../pages/billing/PlanCompare'));

// Checkout pages
const Checkout = React.lazy(() => import('../pages/billing/Checkout'));
const CheckoutSuccess = React.lazy(() => import('../pages/billing/CheckoutSuccess'));
const CheckoutCancel = React.lazy(() => import('../pages/billing/CheckoutCancel'));

// Customer Portal
const CustomerPortal = React.lazy(() => import('../pages/billing/CustomerPortal'));
const CustomerPortalReturn = React.lazy(() => import('../pages/billing/CustomerPortalReturn'));

// Invoice pages
const InvoiceList = React.lazy(() => import('../pages/billing/InvoiceList'));
const InvoiceDetail = React.lazy(() => import('../pages/billing/InvoiceDetail'));

// Payment pages
const PaymentList = React.lazy(() => import('../pages/billing/PaymentList'));
const PaymentDetail = React.lazy(() => import('../pages/billing/PaymentDetail'));

// Payment Method pages
const PaymentMethodList = React.lazy(() => import('../pages/billing/PaymentMethodList'));
const PaymentMethodAdd = React.lazy(() => import('../pages/billing/PaymentMethodAdd'));
const PaymentMethodEdit = React.lazy(() => import('../pages/billing/PaymentMethodEdit'));

// Quota pages
const QuotaStatus = React.lazy(() => import('../pages/billing/QuotaStatus'));
const QuotaUsage = React.lazy(() => import('../pages/billing/QuotaUsage'));
const UsageAnalytics = React.lazy(() => import('../pages/billing/UsageAnalytics'));

// Settings pages
const BillingSettings = React.lazy(() => import('../pages/billing/BillingSettings'));
const NotificationSettings = React.lazy(() => import('../pages/billing/NotificationSettings'));

// API Keys pages (for API access feature)
const ApiKeyList = React.lazy(() => import('../pages/billing/ApiKeyList'));
const ApiKeyCreate = React.lazy(() => import('../pages/billing/ApiKeyCreate'));
const ApiKeyDetail = React.lazy(() => import('../pages/billing/ApiKeyDetail'));

// Webhook pages (for webhook feature)
const WebhookList = React.lazy(() => import('../pages/billing/WebhookList'));
const WebhookCreate = React.lazy(() => import('../pages/billing/WebhookCreate'));
const WebhookDetail = React.lazy(() => import('../pages/billing/WebhookDetail'));
const WebhookLogs = React.lazy(() => import('../pages/billing/WebhookLogs'));

// Report pages
const InvoiceReport = React.lazy(() => import('../pages/billing/InvoiceReport'));
const PaymentReport = React.lazy(() => import('../pages/billing/PaymentReport'));
const UsageReport = React.lazy(() => import('../pages/billing/UsageReport'));
const ExportData = React.lazy(() => import('../pages/billing/ExportData'));

// ============================================================================
// Admin Billing Pages (Super Admin only)
// ============================================================================

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
// Regular user billing routes
const userBillingRoutes = [
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

// Admin billing routes (Super Admin only)
const adminBillingRoutes = [
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
export const billingRoutes = userBillingRoutes;
export const adminBillingRoutes = adminBillingRoutes;
export {
    BILLING_ROUTES,
    ADMIN_BILLING_ROUTES,
    buildBillingPath,
};

// For direct import in main router
export default billingRoutes;