/**
 * Platform admin sidebar navigation — single source for Super Admin & Client Admin.
 * Config paths align with ConfigSidebar / config.routes (CONFIG_ROUTES).
 */
import {
  FiHome,
  FiBarChart2,
  FiUsers,
  FiShield,
  FiAlertCircle,
  FiDownload,
  FiSettings,
  FiDatabase,
  FiActivity,
  FiServer,
  FiGrid,
  FiDollarSign,
  FiFileText,
  FiBell,
  FiClock,
  FiTrendingUp,
  FiLock,
  FiHardDrive,
  FiRefreshCw,
  FiKey,
  FiList,
} from 'react-icons/fi';
import { MdBackup, MdOutlineDashboard } from 'react-icons/md';
import { HiOutlineStatusOnline } from 'react-icons/hi';
import { DASHBOARD_ROUTES } from '../constants/dashboardRouteConstants';
import { BILLING_ROUTES } from '../constants/billingRouteConstants';
import { ROUTES } from '../constants';

/** Full Config Manager menu (mirrors ConfigSidebar). */
export const CONFIG_NAV_ITEMS = [
  { path: '/config/dashboard', name: 'Config Dashboard', icon: MdOutlineDashboard },
  { path: '/config/registry', name: 'App Registry', icon: FiGrid },
  { path: '/config/backups', name: 'Backups', icon: MdBackup },
  { path: '/config/maintenance', name: 'Maintenance', icon: FiHardDrive },
  { path: '/config/disaster-recovery', name: 'Disaster Recovery', icon: FiShield },
  { path: '/config/health', name: 'Health Check', icon: HiOutlineStatusOnline },
  { path: '/config/schedules', name: 'Schedules', icon: FiClock },
  { path: '/config/quotas', name: 'Quotas', icon: FiBarChart2 },
  { path: '/config/encryption', name: 'Encryption', icon: FiKey },
  { path: '/config/audit-logs', name: 'Config Audit Logs', icon: FiList },
  { path: '/config/settings', name: 'Config Settings', icon: FiSettings },
];

export const SUPER_ADMIN_NAV_GROUPS = {
  main: [
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.OVERVIEW, name: 'Platform Overview', icon: FiHome, end: true },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.PLATFORM_METRICS, name: 'Metrics', icon: FiBarChart2 },
  ],
  platform: [
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.TENANTS, name: 'Tenants (PMS)', icon: FiServer },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.SUBSCRIPTIONS, name: 'Subscriptions', icon: FiDollarSign },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.BILLING, name: 'Billing Overview', icon: FiGrid },
  ],
  tenants: [
    { path: '/tenants', name: 'Tenant Management', icon: FiDatabase },
    { path: '/tenants/dashboard', name: 'Tenant Dashboard', icon: FiGrid },
    { path: '/tenants/connections', name: 'Connections', icon: FiActivity },
  ],
  billing: [
    { path: BILLING_ROUTES.ADMIN_BASE, name: 'Billing Admin', icon: FiDollarSign },
    { path: BILLING_ROUTES.ADMIN_PLANS, name: 'Plans', icon: FiGrid },
    { path: BILLING_ROUTES.ADMIN_SUBSCRIPTIONS, name: 'Subscriptions', icon: FiClock },
    { path: BILLING_ROUTES.ADMIN_TRANSACTIONS, name: 'Transactions', icon: FiFileText },
    { path: BILLING_ROUTES.ADMIN_REFUNDS, name: 'Refunds', icon: FiRefreshCw },
    { path: BILLING_ROUTES.ADMIN_WEBHOOKS, name: 'Webhooks', icon: FiBell },
    { path: BILLING_ROUTES.ADMIN_ANALYTICS, name: 'Analytics', icon: FiTrendingUp },
  ],
  applications: [
    { path: ROUTES.KPI_DASHBOARD, name: 'KPI Dashboard', icon: FiBarChart2 },
    { path: ROUTES.KPI_MANAGEMENT, name: 'KPI Management', icon: FiBarChart2 },
    { path: ROUTES.KPI_SETTINGS, name: 'KPI Operations', icon: FiSettings },
    { path: '/app/structure/dashboard/', name: 'Structure', icon: FiServer },
    { path: ROUTES.SECURITY, name: 'Accounts Security', icon: FiLock },
    { path: ROUTES.USERS, name: 'All Users', icon: FiUsers },
  ],
  config: CONFIG_NAV_ITEMS,
  system: [
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.SYSTEM_HEALTH, name: 'PMS System Health', icon: FiActivity },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.AUDIT_LOGS, name: 'Platform Audit Logs', icon: FiFileText },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.SETTINGS, name: 'PMS Settings', icon: FiSettings },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.REPORTS, name: 'Reports', icon: FiFileText },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.EXPORTS, name: 'Exports', icon: FiDownload },
  ],
};

export const CLIENT_ADMIN_NAV_GROUPS = {
  main: [
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.TENANT, name: 'Tenant Overview', icon: FiServer },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.KPI_BREAKDOWN, name: 'KPI Breakdown', icon: FiBarChart2 },
  ],
  oversight: [
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.COMPLIANCE, name: 'Compliance', icon: FiShield },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.APPROVALS, name: 'Pending Approvals', icon: FiClock },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.MISSING_DATA, name: 'Missing Data', icon: FiAlertCircle },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.USER_ACTIVITY, name: 'User Activity', icon: FiActivity },
  ],
  management: [
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.USERS, name: 'Users (PMS)', icon: FiUsers },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.ROLES, name: 'Roles & Permissions', icon: FiShield },
    { path: ROUTES.USERS, name: 'User Directory', icon: FiUsers },
    { path: ROUTES.ROLES, name: 'Role Management', icon: FiShield },
  ],
  compliance: [
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.REPORTS, name: 'Analytics', icon: FiTrendingUp },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.AUDIT_LOGS, name: 'Audit Logs', icon: FiFileText },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.EXPORTS, name: 'Exports', icon: FiDownload },
    { path: ROUTES.AUDIT, name: 'Accounts Audit', icon: FiActivity },
  ],
  config: [
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.SETTINGS, name: 'PMS Settings', icon: FiSettings },
    ...CONFIG_NAV_ITEMS.filter((item) =>
      ['/config/backups', '/config/maintenance', '/config/health', '/config/settings'].includes(item.path),
    ),
  ],
};

/** Default expanded state per group key. */
export const SUPER_ADMIN_DEFAULT_EXPANDED = {
  main: true,
  platform: true,
  tenants: false,
  billing: false,
  applications: false,
  config: false,
  system: true,
};

export const CLIENT_ADMIN_DEFAULT_EXPANDED = {
  main: true,
  oversight: true,
  management: true,
  compliance: false,
  config: false,
};

export const SUPER_ADMIN_GROUP_LABELS = {
  main: 'Main',
  platform: 'Platform',
  tenants: 'Tenant Ops',
  billing: 'Billing',
  applications: 'Applications',
  config: 'Config Manager',
  system: 'System',
};

export const CLIENT_ADMIN_GROUP_LABELS = {
  main: 'Main',
  oversight: 'Oversight',
  management: 'Management',
  compliance: 'Reports & Compliance',
  config: 'Configuration',
};
