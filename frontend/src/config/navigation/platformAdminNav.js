// config/constants/navigationConstants.js
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
  FiGitBranch,
  FiLayers,
  FiCalendar,
  FiFlag,
  FiSliders,
  FiCheckCircle,
  FiMapPin,
  FiBriefcase,
  FiPackage,
  FiFolder,
  FiPieChart,
  FiSmartphone,
  FiCode,
  FiCreditCard,
  FiEye,
  FiRotateCcw,
  FiTarget,
  FiUserCheck,
  FiUserX,
  FiUser,
  FiGlobe,
  FiLink,
} from 'react-icons/fi';
import { MdBackup, MdOutlineDashboard, MdBusiness, MdDomain, MdSchema, MdQrCodeScanner } from 'react-icons/md';
import { HiOutlineStatusOnline } from 'react-icons/hi';
import { HiOutlineBuildingOffice, HiOutlineUserGroup } from 'react-icons/hi2';
import { BsBriefcase, BsPersonBadge, BsDiagram3 } from 'react-icons/bs';
import { ArrowRightLeft } from 'lucide-react';

import { DASHBOARD_ROUTES } from '../constants/dashboardRouteConstants';
import { BILLING_ROUTES } from '../constants/billingRouteConstants';
import { ROUTES } from '../constants/routeConstants';
import { KPI_ROUTES, KPI_ADMIN_ROUTES } from '../constants/kpiRouteConstants';
import { ACCOUNTS_ROUTES } from '../constants/accountsRouteConstants';
import { TENANT_ROUTES } from '../constants/tenantRouteConstants';

// ============================================
// MFA ROUTES
// ============================================
export const MFA_ROUTES = {
  DEVICES: '/security/mfa',
  BACKUP_CODES: '/security/backup-codes',
  ACTIVITY: '/security/mfa-activity',
  SETUP: '/mfa/setup',
  VERIFY: '/mfa/verify',
};

// ============================================
// TENANT NAVIGATION ITEMS
// ============================================
export const TENANT_NAV_ITEMS = {
  SUPER_ADMIN: [
    { path: TENANT_ROUTES.DASHBOARD, name: 'Dashboard', icon: FiHome },
    { path: TENANT_ROUTES.ADMIN_ORGANIZATIONS, name: 'Organizations', icon: MdBusiness },
    { path: TENANT_ROUTES.DOMAINS, name: 'Domains', icon: FiGlobe },
    { path: '/tenant/sectors', name: 'Sectors', icon: FiBriefcase },
    { path: TENANT_ROUTES.SCHEMAS, name: 'Schemas', icon: MdSchema },
    { path: TENANT_ROUTES.RESOURCES, name: 'Resources', icon: FiDatabase },
    { path: TENANT_ROUTES.CONNECTIONS, name: 'Connections', icon: FiLink },
    { path: TENANT_ROUTES.MIGRATIONS, name: 'Migrations', icon: ArrowRightLeft },
    { path: TENANT_ROUTES.SYSTEM_SETTINGS, name: 'System Settings', icon: FiSettings },
    { path: TENANT_ROUTES.HEALTH, name: 'Health', icon: FiActivity },
  ],
  CLIENT_ADMIN: [
    { path: TENANT_ROUTES.DASHBOARD, name: 'Dashboard', icon: FiHome },
    { path: TENANT_ROUTES.ORGANIZATIONS, name: 'Organization', icon: MdBusiness },
    { path: TENANT_ROUTES.DOMAINS, name: 'Domains', icon: FiGlobe },
    { path: TENANT_ROUTES.RESOURCES, name: 'Resources', icon: FiDatabase },
    { path: TENANT_ROUTES.CONNECTIONS, name: 'Connections', icon: FiLink },
    { path: TENANT_ROUTES.MIGRATIONS, name: 'Migrations', icon: ArrowRightLeft },
    { path: TENANT_ROUTES.SETTINGS, name: 'Settings', icon: FiSettings },
  ],
};

// ============================================
// TENANT NAVIGATION GROUPS - SUPER ADMIN
// ============================================
export const TENANT_SUPER_ADMIN_NAV_GROUPS = {
  main: [
    { path: TENANT_ROUTES.DASHBOARD, name: 'Dashboard', icon: FiHome, end: true },
  ],
  management: [
    { path: TENANT_ROUTES.ADMIN_ORGANIZATIONS, name: 'Organizations', icon: MdBusiness },
    { path: TENANT_ROUTES.DOMAINS, name: 'Domains', icon: FiGlobe },
    { path: '/tenant/sectors', name: 'Sectors', icon: FiBriefcase },
  ],
  infrastructure: [
    { path: TENANT_ROUTES.SCHEMAS, name: 'Schemas', icon: MdSchema },
    { path: TENANT_ROUTES.RESOURCES, name: 'Resources', icon: FiDatabase },
    { path: TENANT_ROUTES.CONNECTIONS, name: 'Connections', icon: FiLink },
    { path: TENANT_ROUTES.MIGRATIONS, name: 'Migrations', icon: ArrowRightLeft },
  ],
  system: [
    { path: TENANT_ROUTES.SYSTEM_SETTINGS, name: 'System Settings', icon: FiSettings },
    { path: TENANT_ROUTES.HEALTH, name: 'Health', icon: FiActivity },
  ],
};

// ============================================
// TENANT NAVIGATION GROUPS - CLIENT ADMIN
// ============================================
export const TENANT_CLIENT_ADMIN_NAV_GROUPS = {
  main: [
    { path: TENANT_ROUTES.DASHBOARD, name: 'Dashboard', icon: FiHome, end: true },
  ],
  management: [
    { path: TENANT_ROUTES.ORGANIZATIONS, name: 'Organization', icon: MdBusiness },
    { path: TENANT_ROUTES.DOMAINS, name: 'Domains', icon: FiGlobe },
  ],
  infrastructure: [
    { path: TENANT_ROUTES.RESOURCES, name: 'Resources', icon: FiDatabase },
    { path: TENANT_ROUTES.CONNECTIONS, name: 'Connections', icon: FiLink },
    { path: TENANT_ROUTES.MIGRATIONS, name: 'Migrations', icon: ArrowRightLeft },
  ],
  system: [
    { path: TENANT_ROUTES.SETTINGS, name: 'Settings', icon: FiSettings },
  ],
};

// ============================================
// TENANT GROUP LABELS
// ============================================
export const TENANT_SUPER_ADMIN_GROUP_LABELS = {
  main: 'Main',
  management: 'Management',
  infrastructure: 'Infrastructure',
  system: 'System',
};

export const TENANT_CLIENT_ADMIN_GROUP_LABELS = {
  main: 'Main',
  management: 'Management',
  infrastructure: 'Infrastructure',
  system: 'System',
};

// ============================================
// TENANT DEFAULT EXPANDED
// ============================================
export const TENANT_SUPER_ADMIN_DEFAULT_EXPANDED = {
  main: true,
  management: true,
  infrastructure: false,
  system: false,
};

export const TENANT_CLIENT_ADMIN_DEFAULT_EXPANDED = {
  main: true,
  management: true,
  infrastructure: false,
  system: false,
};

// ============================================
// CONFIG NAVIGATION
// ============================================
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

// ============================================
// MFA NAVIGATION
// ============================================
export const MFA_NAV_ITEMS = [
  { path: MFA_ROUTES.DEVICES, name: 'MFA Devices', icon: FiSmartphone },
  { path: MFA_ROUTES.BACKUP_CODES, name: 'Backup Codes', icon: FiCode },
  { path: MFA_ROUTES.ACTIVITY, name: 'MFA Activity', icon: FiActivity },
];

// ============================================
// CUSTOMER BILLING NAVIGATION
// ============================================
export const BILLING_NAV_ITEMS = [
  { path: BILLING_ROUTES.PORTAL, name: 'Billing Portal', icon: FiCreditCard },
  { path: BILLING_ROUTES.PLANS, name: 'Subscription Plans', icon: FiGrid },
  { path: BILLING_ROUTES.SUBSCRIPTIONS, name: 'My Subscription', icon: FiClock },
  { path: BILLING_ROUTES.INVOICES, name: 'Invoices', icon: FiFileText },
  { path: BILLING_ROUTES.TRANSACTIONS, name: 'Transactions', icon: FiActivity },
  { path: BILLING_ROUTES.PAYMENT_METHODS, name: 'Payment Methods', icon: FiCreditCard },
  { path: BILLING_ROUTES.USAGE, name: 'Usage Tracking', icon: FiBarChart2 },
  { path: BILLING_ROUTES.ANALYTICS, name: 'Billing Analytics', icon: FiTrendingUp },
  { path: BILLING_ROUTES.SETTINGS, name: 'Billing Settings', icon: FiSettings },
];

// ============================================
// ADMIN BILLING NAVIGATION (Super Admin only)
// ============================================
export const ADMIN_BILLING_NAV_ITEMS = [
  { path: BILLING_ROUTES.ADMIN_BASE, name: 'Billing Dashboard', icon: FiDollarSign },
  { path: BILLING_ROUTES.ADMIN_PLANS, name: 'Manage Plans', icon: FiGrid },
  { path: BILLING_ROUTES.ADMIN_SUBSCRIPTIONS, name: 'Tenant Subscriptions', icon: FiUsers },
  { path: BILLING_ROUTES.ADMIN_TRANSACTIONS, name: 'All Transactions', icon: FiFileText },
  { path: BILLING_ROUTES.ADMIN_REFUNDS, name: 'Refunds', icon: FiRotateCcw },
  { path: BILLING_ROUTES.ADMIN_WEBHOOKS, name: 'Webhook Logs', icon: FiBell },
  { path: BILLING_ROUTES.ADMIN_ANALYTICS, name: 'Revenue Analytics', icon: FiTrendingUp },
  { path: BILLING_ROUTES.ADMIN_ENTERPRISE, name: 'Enterprise Overrides', icon: FiShield },
  { path: BILLING_ROUTES.AUDIT_LOGS, name: 'Billing Audit Logs', icon: FiList },
  { path: BILLING_ROUTES.SYSTEM_SETTINGS, name: 'Billing Settings', icon: FiSettings },
];

// ============================================
// KPI ADMIN ROUTES (using constants)
// ============================================
export const KPI_ADMIN_NAV_ITEMS = [
  { path: KPI_ADMIN_ROUTES.OVERVIEW, name: 'KPI Admin Overview', icon: FiPieChart },
  { path: KPI_ADMIN_ROUTES.SECTORS, name: 'Sectors', icon: FiBriefcase },
  { path: KPI_ADMIN_ROUTES.FRAMEWORKS, name: 'Frameworks', icon: FiPackage },
  { path: KPI_ADMIN_ROUTES.CATEGORIES, name: 'Categories', icon: FiFolder },
  { path: KPI_ADMIN_ROUTES.TEMPLATES, name: 'Templates', icon: FiFileText },
];

// ============================================
// KPI MANAGEMENT NAVIGATION (using constants)
// ============================================
export const KPI_MANAGEMENT_NAV_ITEMS = [
  { path: KPI_ROUTES.KPI_MANAGEMENT, name: 'All KPIs', icon: FiTarget },
  { path: KPI_ROUTES.KPI_MY_KPIS, name: 'My KPIs', icon: FiUsers },
  { path: KPI_ROUTES.TARGETS, name: 'Targets', icon: FiCalendar },
  { path: KPI_ROUTES.ACTUALS, name: 'Actuals', icon: FiActivity },
  { path: KPI_ROUTES.KPI_VALIDATION, name: 'Validations', icon: FiCheckCircle },
  { path: KPI_ROUTES.ESCALATIONS, name: 'Escalations', icon: FiAlertCircle },
  { path: KPI_ROUTES.ACTUAL_ADJUSTMENTS, name: 'Adjustments', icon: FiRotateCcw },
];

// ============================================
// KPI ANALYTICS NAVIGATION (using constants)
// ============================================
export const KPI_ANALYTICS_NAV_ITEMS = [
  { path: KPI_ROUTES.ANALYTICS_INSIGHTS, name: 'Analytics Insights', icon: FiTrendingUp },
  { path: KPI_ROUTES.SCORES, name: 'Score Dashboard', icon: FiBarChart2 },
  { path: KPI_ROUTES.SCORE_MY_SCORES, name: 'My Scores', icon: FiEye },
  { path: KPI_ROUTES.SCORE_TEAM_SCORES, name: 'Team Scores', icon: FiUsers },
  { path: KPI_ROUTES.SCORE_RED_ALERTS, name: 'Red Alerts', icon: FiAlertCircle },
  { path: KPI_ROUTES.AGGREGATED_SCORES, name: 'Aggregated Scores', icon: FiPieChart },
  { path: KPI_ROUTES.ORGANIZATION_HEALTH, name: 'Organization Health', icon: FiActivity },
  { path: KPI_ROUTES.KPI_REPORTS, name: 'Reports', icon: FiDownload },
  { path: KPI_ROUTES.KPI_HEATMAP, name: 'Heatmap', icon: FiGrid },
];

// ============================================
// KPI OPERATIONS NAVIGATION (using constants)
// ============================================
export const KPI_OPERATIONS_NAV_ITEMS = [
  { path: KPI_ROUTES.BULK_UPLOAD, name: 'Bulk Upload', icon: FiDatabase },
  { path: KPI_ROUTES.CALCULATIONS, name: 'Calculations', icon: FiServer },
  { path: KPI_ROUTES.AUDIT_LOGS, name: 'Audit Logs', icon: FiList },
  { path: KPI_ROUTES.SYSTEM_SETTINGS, name: 'System Settings', icon: FiSettings },
  { path: KPI_ROUTES.REFERENCE_DATA, name: 'Reference Data', icon: FiDatabase },
  { path: KPI_ROUTES.NOTIFICATION_PREFERENCES, name: 'Notifications', icon: FiBell },
];

// ============================================
// KPI DASHBOARDS NAVIGATION (using constants)
// ============================================
export const KPI_DASHBOARDS_NAV_ITEMS = [
  { path: KPI_ROUTES.DASHBOARD, name: 'Individual Dashboard', icon: FiHome },
  { path: KPI_ROUTES.MANAGER_DASHBOARD, name: 'Manager Dashboard', icon: FiUsers },
  { path: KPI_ROUTES.EXECUTIVE_DASHBOARD, name: 'Executive Dashboard', icon: FiTrendingUp },
  { path: KPI_ROUTES.CHAMPION_DASHBOARD, name: 'Champion Dashboard', icon: FiShield },
];

// ============================================
// ACCOUNTS NAVIGATION ITEMS - Using ACCOUNTS_ROUTES
// ============================================
export const ACCOUNTS_SUPER_ADMIN_NAV_ITEMS = [
  { path: ACCOUNTS_ROUTES.USERS, name: 'All Users', icon: FiUsers },
  { path: ACCOUNTS_ROUTES.ADMIN_USERS, name: 'Manage Users', icon: FiUserCheck },
  { path: ACCOUNTS_ROUTES.ROLES, name: 'Roles', icon: FiShield },
  { path: ACCOUNTS_ROUTES.ADMIN_ROLES, name: 'Manage Roles', icon: FiKey },
  { path: ACCOUNTS_ROUTES.PERMISSIONS, name: 'Permissions', icon: FiLock },
  { path: ACCOUNTS_ROUTES.ADMIN_PERMISSIONS, name: 'Manage Permissions', icon: FiGrid },
  { path: ACCOUNTS_ROUTES.ADMIN_TENANTS, name: 'Manage Tenants', icon: FiBriefcase },
  { path: ACCOUNTS_ROUTES.SESSIONS, name: 'Sessions', icon: FiClock },
  { path: ACCOUNTS_ROUTES.ACTIVE_SESSIONS, name: 'Active Sessions', icon: FiActivity },
  { path: ACCOUNTS_ROUTES.AUDIT_LOGS, name: 'Audit Logs', icon: FiFileText },
  { path: ACCOUNTS_ROUTES.AUDIT_SECURITY_EVENTS, name: 'Security Events', icon: FiAlertCircle },
  { path: ACCOUNTS_ROUTES.AUDIT_COMPLIANCE, name: 'Compliance Report', icon: FiDownload },
  { path: ACCOUNTS_ROUTES.SECURITY_LOGIN_ATTEMPTS, name: 'Login Attempts', icon: FiUserX },
  { path: ACCOUNTS_ROUTES.SECURITY_LOCKOUT_SUMMARY, name: 'Lockout Summary', icon: FiLock },
  { path: ACCOUNTS_ROUTES.SECURITY_MFA_POLICY, name: 'MFA Policy', icon: FiShield },
  { path: ACCOUNTS_ROUTES.ADMIN_MFA, name: 'MFA Management', icon: FiSmartphone },
  { path: ACCOUNTS_ROUTES.MFA_DEVICES, name: 'My MFA Devices', icon: FiSmartphone },
  { path: ACCOUNTS_ROUTES.MFA_BACKUP_CODES, name: 'Backup Codes', icon: FiCode },
  { path: ACCOUNTS_ROUTES.ADMIN_SYSTEM, name: 'System Settings', icon: FiServer },
  { path: ACCOUNTS_ROUTES.SYSTEM_SETTINGS, name: 'System Policy', icon: FiSettings },
  { path: ACCOUNTS_ROUTES.TENANT_SETTINGS, name: 'Tenant Settings', icon: FiSettings },
  { path: ACCOUNTS_ROUTES.MY_PROFILE, name: 'My Profile', icon: FiUser },
  { path: ACCOUNTS_ROUTES.MY_SETTINGS, name: 'My Settings', icon: FiSettings },
  { path: ACCOUNTS_ROUTES.CHANGE_PASSWORD, name: 'Change Password', icon: FiLock },
];

export const ACCOUNTS_CLIENT_ADMIN_NAV_ITEMS = [
  { path: ACCOUNTS_ROUTES.USERS, name: 'Users', icon: FiUsers },
  { path: ACCOUNTS_ROUTES.ROLES, name: 'Roles', icon: FiShield },
  { path: ACCOUNTS_ROUTES.SESSIONS, name: 'Sessions', icon: FiClock },
  { path: ACCOUNTS_ROUTES.AUDIT_LOGS, name: 'Audit Logs', icon: FiFileText },
  { path: ACCOUNTS_ROUTES.AUDIT_SECURITY_EVENTS, name: 'Security Events', icon: FiAlertCircle },
  { path: ACCOUNTS_ROUTES.AUDIT_COMPLIANCE, name: 'Compliance Report', icon: FiDownload },
  { path: ACCOUNTS_ROUTES.SECURITY_LOGIN_ATTEMPTS, name: 'Login Attempts', icon: FiUserX },
  { path: ACCOUNTS_ROUTES.SECURITY_LOCKOUT_SUMMARY, name: 'Lockout Summary', icon: FiLock },
  { path: ACCOUNTS_ROUTES.SECURITY_MFA_POLICY, name: 'MFA Policy', icon: FiShield },
  { path: ACCOUNTS_ROUTES.ADMIN_MFA, name: 'MFA Management', icon: FiSmartphone },
  { path: ACCOUNTS_ROUTES.MFA_DEVICES, name: 'My MFA Devices', icon: FiSmartphone },
  { path: ACCOUNTS_ROUTES.MFA_BACKUP_CODES, name: 'Backup Codes', icon: FiCode },
  { path: ACCOUNTS_ROUTES.TENANT_SETTINGS, name: 'Tenant Settings', icon: FiSettings },
  { path: ACCOUNTS_ROUTES.MY_PROFILE, name: 'My Profile', icon: FiUser },
  { path: ACCOUNTS_ROUTES.MY_SETTINGS, name: 'My Settings', icon: FiSettings },
  { path: ACCOUNTS_ROUTES.CHANGE_PASSWORD, name: 'Change Password', icon: FiLock },
];

// ============================================
// SUPER ADMIN NAVIGATION GROUPS - UPDATED WITH TENANT
// ============================================
export const SUPER_ADMIN_NAV_GROUPS = {
  main: [
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.OVERVIEW, name: 'Platform Overview', icon: FiHome, end: true },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.CUSTOM_OVERVIEW, name: 'Custom Overview', icon: FiHome },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.PLATFORM_METRICS, name: 'Platform Metrics', icon: FiBarChart2 },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.SYSTEM_HEALTH, name: 'PMS System Health', icon: FiActivity },
  ],

  tenant_main: [
    { path: TENANT_ROUTES.DASHBOARD, name: 'Tenant Dashboard', icon: FiHome, end: true },
  ],
  tenant_management: [
    { path: TENANT_ROUTES.ADMIN_ORGANIZATIONS, name: 'Organizations', icon: MdBusiness },
    { path: TENANT_ROUTES.DOMAINS, name: 'Domains', icon: FiGlobe },
    { path: '/tenant/sectors', name: 'Sectors', icon: FiBriefcase },
  ],
  tenant_infrastructure: [
    { path: TENANT_ROUTES.SCHEMAS, name: 'Schemas', icon: MdSchema },
    { path: TENANT_ROUTES.RESOURCES, name: 'Resources', icon: FiDatabase },
    { path: TENANT_ROUTES.RESOURCE_DASHBOARD, name: 'Resource Dashboard', icon: FiBarChart2 },
    { path: TENANT_ROUTES.RESOURCE_ANALYTICS, name: 'Resource Analytics', icon: FiActivity },
    { path: TENANT_ROUTES.CONNECTIONS, name: 'Connections', icon: FiLink },
    { path: TENANT_ROUTES.MIGRATIONS, name: 'Migrations', icon: ArrowRightLeft },
    { path: TENANT_ROUTES.PROVISIONING, name: 'Provisioning', icon: FiDownload },
  ],
  tenant_system: [
    { path: TENANT_ROUTES.SYSTEM_SETTINGS, name: 'System Settings', icon: FiSettings },
    { path: TENANT_ROUTES.HEALTH, name: 'Health', icon: FiActivity },
  ],
  billing: ADMIN_BILLING_NAV_ITEMS,
  kpiAdmin: KPI_ADMIN_NAV_ITEMS,
  kpiManagement: KPI_MANAGEMENT_NAV_ITEMS,
  kpiAnalytics: KPI_ANALYTICS_NAV_ITEMS,
  kpiOperations: KPI_OPERATIONS_NAV_ITEMS,
  kpiDashboards: KPI_DASHBOARDS_NAV_ITEMS,
  structure: [
    { path: '/app/structure/dashboard/', name: 'Structure Dashboard', icon: FiTrendingUp },
    { path: '/app/structure/departments', name: 'Departments', icon: HiOutlineBuildingOffice },
    { path: '/app/structure/teams', name: 'Teams', icon: HiOutlineUserGroup },
    { path: '/app/structure/positions', name: 'Positions', icon: BsBriefcase },
    { path: '/app/structure/employments', name: 'Employments', icon: BsPersonBadge },
    { path: '/app/structure/reporting-lines', name: 'Reporting Lines', icon: BsDiagram3 },
    { path: '/app/structure/cost-centers', name: 'Cost Centers', icon: FiDollarSign },
    { path: '/app/structure/locations', name: 'Locations', icon: FiMapPin },
    { path: '/app/structure/org-chart', name: 'Organization Chart', icon: FiGitBranch },
    { path: '/app/structure/department-trees', name: 'Department Tree', icon: FiGitBranch },
    { path: '/app/structure/team-hierarchies', name: 'Team Hierarchy', icon: FiGitBranch },
    { path: '/app/structure/hierarchy/versions', name: 'Version History', icon: FiDatabase },
  ],
  reviews: [
    { path: '/reviews/dashboard', name: 'Reviews Dashboard', icon: FiBarChart2 },
    { path: '/reviews/cycles', name: 'Review Cycles', icon: FiCalendar },
    { path: '/reviews/self-assessment', name: 'Self Assessment', icon: FiCheckCircle },
    { path: '/reviews/review-queue', name: 'Review Queue', icon: FiActivity },
    { path: '/reviews/final-ratings', name: 'Final Ratings', icon: FiBarChart2 },
    { path: '/reviews/pips', name: 'Performance Plans', icon: FiFlag },
    { path: '/reviews/feedback', name: '360 Feedback', icon: FiUsers },
    { path: '/reviews/calibration', name: 'Calibration', icon: FiSliders },
    { path: '/reviews/reports', name: 'Reviews Reports', icon: FiFileText },
  ],
  accounts: ACCOUNTS_SUPER_ADMIN_NAV_ITEMS,
  mfa: MFA_NAV_ITEMS,
  config: CONFIG_NAV_ITEMS,
  settings: [
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.SETTINGS, name: 'PMS Settings', icon: FiSettings },
    { path: '/config/settings', name: 'Config Settings', icon: FiSettings },
    { path: '/reviews/settings', name: 'Reviews Settings', icon: FiSettings },
    { path: '/app/structure/settings', name: 'Structure Settings', icon: FiSettings },
    { path: ACCOUNTS_ROUTES.SECURITY, name: 'Accounts Security', icon: FiLock },
    { path: ACCOUNTS_ROUTES.ADMIN_SYSTEM, name: 'Admin System Settings', icon: FiServer },
    { path: ACCOUNTS_ROUTES.SYSTEM_SETTINGS, name: 'System Settings', icon: FiSettings },
    { path: ACCOUNTS_ROUTES.MY_SETTINGS, name: 'Notification Settings', icon: FiBell },
  ],
};

// ============================================
// CLIENT ADMIN NAVIGATION GROUPS - UPDATED WITH TENANT
// ============================================
export const CLIENT_ADMIN_NAV_GROUPS = {
  main: [
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.TENANT, name: 'Tenant Overview', icon: FiServer },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.KPI_BREAKDOWN, name: 'KPI Breakdown', icon: FiBarChart2 },
  ],
  tenant_main: [
    { path: TENANT_ROUTES.DASHBOARD, name: 'Dashboard', icon: FiHome, end: true },
  ],
  tenant_management: [
    { path: TENANT_ROUTES.ORGANIZATIONS, name: 'Organization', icon: MdBusiness },
    { path: TENANT_ROUTES.DOMAINS, name: 'Domains', icon: FiGlobe },
  ],
  tenant_infrastructure: [
    { path: TENANT_ROUTES.RESOURCES, name: 'Resources', icon: FiDatabase },
    { path: TENANT_ROUTES.CONNECTIONS, name: 'Connections', icon: FiLink },
    { path: TENANT_ROUTES.MIGRATIONS, name: 'Migrations', icon: ArrowRightLeft },
  ],
  tenant_system: [
    { path: TENANT_ROUTES.SETTINGS, name: 'Settings', icon: FiSettings },
  ],
  billing: BILLING_NAV_ITEMS,
  oversight: [
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.COMPLIANCE, name: 'Compliance', icon: FiShield },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.APPROVALS, name: 'Pending Approvals', icon: FiClock },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.MISSING_DATA, name: 'Missing Data', icon: FiAlertCircle },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.USER_ACTIVITY, name: 'User Activity', icon: FiActivity },
  ],
  kpiAdmin: KPI_ADMIN_NAV_ITEMS,
  kpiManagement: KPI_MANAGEMENT_NAV_ITEMS,
  kpiAnalytics: KPI_ANALYTICS_NAV_ITEMS,
  kpiOperations: KPI_OPERATIONS_NAV_ITEMS,
  management: [
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.USERS, name: 'Users (PMS)', icon: FiUsers },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.ROLES, name: 'Roles & Permissions', icon: FiShield },
    { path: ACCOUNTS_ROUTES.USERS, name: 'User Directory', icon: FiUsers },
    { path: ACCOUNTS_ROUTES.ROLES, name: 'Role Management', icon: FiShield },
  ],
  mfa: MFA_NAV_ITEMS,
  compliance: [
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.REPORTS, name: 'Analytics', icon: FiTrendingUp },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.AUDIT_LOGS, name: 'Audit Logs', icon: FiFileText },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.EXPORTS, name: 'Exports', icon: FiDownload },
    { path: ACCOUNTS_ROUTES.AUDIT_LOGS, name: 'Accounts Audit', icon: FiActivity },
  ],
  config: [
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.SETTINGS, name: 'PMS Settings', icon: FiSettings },
    ...CONFIG_NAV_ITEMS.filter((item) =>
      ['/config/backups', '/config/maintenance', '/config/health', '/config/settings'].includes(item.path),
    ),
  ],
};

// ============================================
// EXPANDED STATES - UPDATED WITH TENANT
// ============================================
export const SUPER_ADMIN_DEFAULT_EXPANDED = {
  main: true,
  tenant_main: true,
  tenant_management: true,
  tenant_infrastructure: false,
  tenant_system: false,
  billing: false,
  kpiAdmin: true,
  kpiManagement: true,
  kpiAnalytics: false,
  kpiOperations: false,
  kpiDashboards: false,
  structure: false,
  reviews: false,
  accounts: true,
  mfa: false,
  config: false,
  settings: false,
};

export const CLIENT_ADMIN_DEFAULT_EXPANDED = {
  main: true,
  tenant_main: true,
  tenant_management: true,
  tenant_infrastructure: false,
  tenant_system: false,
  billing: false,
  oversight: true,
  kpiAdmin: false,
  kpiManagement: true,
  kpiAnalytics: false,
  kpiOperations: false,
  management: true,
  mfa: false,
  compliance: false,
  config: false,
};

// ============================================
// GROUP LABELS - UPDATED WITH TENANT
// ============================================
export const SUPER_ADMIN_GROUP_LABELS = {
  main: 'Main',
  tenant_main: '🏢 TENANT MANAGEMENT',
  tenant_management: 'Management',
  tenant_infrastructure: 'Infrastructure',
  tenant_system: 'System',
  billing: 'Billing Administration',
  kpiAdmin: '🏗️ KPI System Admin',
  kpiManagement: '📊 KPI Management',
  kpiAnalytics: '📈 Analytics & Reports',
  kpiOperations: '⚙️ Operations',
  kpiDashboards: '📺 Dashboards',
  structure: 'Organization Structure',
  reviews: 'Performance Reviews',
  accounts: '👥 Accounts Management',
  mfa: 'Multi-Factor Authentication',
  config: 'Configuration Manager',
  settings: 'System & Unified Settings',
};

export const CLIENT_ADMIN_GROUP_LABELS = {
  main: 'Main',
  tenant_main: '🏢 ORGANIZATION',
  tenant_management: 'Management',
  tenant_infrastructure: 'Infrastructure',
  tenant_system: 'System',
  billing: 'Billing & Payments',
  oversight: 'Oversight',
  kpiAdmin: '🏗️ KPI System Admin',
  kpiManagement: '📊 KPI Management',
  kpiAnalytics: '📈 Analytics & Reports',
  kpiOperations: '⚙️ Operations',
  management: 'Management',
  mfa: 'Multi-Factor Authentication',
  compliance: 'Reports & Compliance',
  config: 'Configuration',
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export const isKpiRouteActive = (path, currentPath) => {
  if (path === currentPath) return true;

  const patterns = [
    /^\/kpi\/detail\/[\w-]+$/,
    /^\/kpi\/edit\/[\w-]+$/,
    /^\/kpi\/targets\/[\w-]+\/phasing$/,
    /^\/kpi\/users\/[\w-]+\/kpis$/,
    /^\/kpi\/users\/[\w-]+\/targets$/,
    /^\/kpi\/users\/[\w-]+\/scores$/,
    /^\/kpi\/users\/[\w-]+\/actuals$/,
    /^\/kpi\/admin\/sectors\/[\w-]+\/edit$/,
    /^\/kpi\/admin\/frameworks\/[\w-]+\/edit$/,
    /^\/kpi\/admin\/categories\/[\w-]+\/edit$/,
    /^\/kpi\/admin\/templates\/[\w-]+\/edit$/,
  ];

  return patterns.some((pattern) => pattern.test(currentPath));
};

export const isAccountsRouteActive = (path, currentPath) => {
  if (path === currentPath) return true;

  const patterns = [
    /^\/users\/[\w-]+$/,
    /^\/users\/[\w-]+\/edit$/,
    /^\/roles\/[\w-]+$/,
    /^\/roles\/[\w-]+\/edit$/,
    /^\/permissions\/[\w-]+$/,
    /^\/sessions\/[\w-]+$/,
    /^\/audit-logs\/[\w-]+$/,
    /^\/admin\/users\/[\w-]+$/,
    /^\/admin\/tenants\/[\w-]+$/,
    /^\/admin\/mfa\/users\/[\w-]+$/,
    /^\/profiles\/[\w-]+$/,
    /^\/profiles\/[\w-]+\/edit$/,
  ];

  return patterns.some((pattern) => pattern.test(currentPath));
};

export const isTenantRouteActive = (path, currentPath) => {
  if (path === currentPath) return true;

  const patterns = [
    /^\/tenant\/organizations\/[\w-]+$/,
    /^\/tenant\/organizations\/[\w-]+\/edit$/,
    /^\/tenant\/organizations\/[\w-]+\/onboard$/,
    /^\/tenant\/organizations\/[\w-]+\/usage$/,
    /^\/tenant\/organizations\/[\w-]+\/provisioning$/,
    /^\/tenant\/domains\/[\w-]+$/,
    /^\/tenant\/domains\/[\w-]+\/edit$/,
    /^\/tenant\/domains\/[\w-]+\/verify$/,
    /^\/tenant\/schemas\/[\w-]+$/,
    /^\/tenant\/schemas\/[\w-]+\/provision$/,
    /^\/tenant\/resources\/[\w-]+$/,
    /^\/tenant\/resources\/[\w-]+\/edit$/,
    /^\/tenant\/connections\/[\w-]+$/,
    /^\/tenant\/migrations\/[\w-]+$/,
    /^\/tenant\/sectors\/[\w-]+\/edit$/,
    /^\/tenant\/admin\/organizations\/[\w-]+$/,
  ];

  return patterns.some((pattern) => pattern.test(currentPath));
};