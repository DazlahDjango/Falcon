// config/navigation/billingNav.js
/**
 * Navigation Configuration - Billing Subsystem Scoped
 * Dedicated module defining role-specific navigation groups and items for Billing & Subscriptions.
 * Tailored for Super Admin (Platform Oversight & Revenue) and Client Admin (Organization Subscriptions & Invoices).
 */
import {
  FiCreditCard,
  FiGrid,
  FiActivity,
  FiDollarSign,
  FiFileText,
  FiLayers,
  FiRefreshCw,
  FiShield,
  FiSliders,
  FiZap,
  FiSettings,
  FiPackage,
  FiBarChart2,
  FiAlertCircle,
  FiClock,
  FiAward,
} from 'react-icons/fi';
import { BILLING_ROUTES } from '../constants/billingRouteConstants';

// ============================================
// 1. SUPER ADMIN BILLING NAV GROUPS (Platform Scope)
// ============================================
export const BILLING_SUPER_ADMIN_NAV_GROUPS = {
  billing_admin_overview: [
    { path: BILLING_ROUTES.ADMIN_DASHBOARD, name: 'Billing Overview', icon: FiGrid },
    { path: BILLING_ROUTES.ADMIN_ANALYTICS, name: 'Revenue Analytics', icon: FiBarChart2 },
  ],
  billing_admin_subscriptions: [
    { path: BILLING_ROUTES.ADMIN_PLANS, name: 'Subscription Plans', icon: FiPackage },
    { path: BILLING_ROUTES.ADMIN_SUBSCRIPTIONS, name: 'Tenant Subscriptions', icon: FiLayers },
    { path: BILLING_ROUTES.ADMIN_ENTERPRISE, name: 'Enterprise Overrides', icon: FiAward },
  ],
  billing_admin_transactions: [
    { path: BILLING_ROUTES.ADMIN_TRANSACTIONS, name: 'All Transactions', icon: FiDollarSign },
    { path: BILLING_ROUTES.ADMIN_REFUNDS, name: 'Refunds & Failures', icon: FiAlertCircle },
  ],
  billing_admin_system: [
    { path: BILLING_ROUTES.ADMIN_WEBHOOKS, name: 'PayStack Webhooks', icon: FiRefreshCw },
    { path: BILLING_ROUTES.PLATFORM_SETTINGS, name: 'Platform Settings', icon: FiSliders },
  ],
};

export const BILLING_SUPER_ADMIN_GROUP_LABELS = {
  billing_admin_overview: '💳 Billing & Revenue',
  billing_admin_subscriptions: '📦 Plans & Subscriptions',
  billing_admin_transactions: '💰 Payments & Refunds',
  billing_admin_system: '⚙️ Gateways & System Config',
};

export const BILLING_SUPER_ADMIN_DEFAULT_EXPANDED = {
  billing_admin_overview: true,
  billing_admin_subscriptions: true,
  billing_admin_transactions: true,
  billing_admin_system: false,
};

// ============================================
// 2. CLIENT ADMIN BILLING NAV GROUPS (Organization Scope)
// ============================================
export const BILLING_CLIENT_ADMIN_NAV_GROUPS = {
  billing_client_main: [
    { path: BILLING_ROUTES.PORTAL, name: 'Billing Portal', icon: FiGrid },
    { path: BILLING_ROUTES.SUBSCRIPTIONS, name: 'My Subscription', icon: FiLayers },
    { path: BILLING_ROUTES.PLANS, name: 'Plans & Pricing', icon: FiPackage },
  ],
  billing_client_payments: [
    { path: BILLING_ROUTES.INVOICES, name: 'Invoices & Receipts', icon: FiFileText },
    { path: BILLING_ROUTES.PAYMENT_METHODS, name: 'Payment Methods', icon: FiCreditCard },
    { path: BILLING_ROUTES.TRANSACTIONS, name: 'Transaction History', icon: FiClock },
  ],
  billing_client_usage: [
    { path: BILLING_ROUTES.USAGE, name: 'Resource Usage', icon: FiZap },
    { path: BILLING_ROUTES.SETTINGS, name: 'Billing Settings', icon: FiSettings },
  ],
};

export const BILLING_CLIENT_ADMIN_GROUP_LABELS = {
  billing_client_main: '💳 Subscriptions & Plans',
  billing_client_payments: '🧾 Invoices & Payments',
  billing_client_usage: '⚡ Usage & Preferences',
};

export const BILLING_CLIENT_ADMIN_DEFAULT_EXPANDED = {
  billing_client_main: true,
  billing_client_payments: true,
  billing_client_usage: false,
};

// ============================================
// HELPER FUNCTION TO CHECK IF BILLING ROUTE IS ACTIVE
// ============================================
export const isBillingRouteActive = (path, currentPath) => {
  if (path === currentPath) return true;
  if (path !== '/' && path !== '/billing' && currentPath.startsWith(path)) return true;
  return false;
};

export default {
  BILLING_SUPER_ADMIN_NAV_GROUPS,
  BILLING_SUPER_ADMIN_GROUP_LABELS,
  BILLING_SUPER_ADMIN_DEFAULT_EXPANDED,
  BILLING_CLIENT_ADMIN_NAV_GROUPS,
  BILLING_CLIENT_ADMIN_GROUP_LABELS,
  BILLING_CLIENT_ADMIN_DEFAULT_EXPANDED,
  isBillingRouteActive,
};
