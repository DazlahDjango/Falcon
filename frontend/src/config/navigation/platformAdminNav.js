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
} from 'react-icons/fi';
import { MdBackup, MdOutlineDashboard, MdBusiness, MdDomain, MdSchema, MdQrCodeScanner } from 'react-icons/md';
import { HiOutlineStatusOnline } from 'react-icons/hi';
import { HiOutlineBuildingOffice, HiOutlineUserGroup } from 'react-icons/hi2';
import { BsBriefcase, BsPersonBadge, BsDiagram3 } from 'react-icons/bs';

import { DASHBOARD_ROUTES } from '../constants/dashboardRouteConstants';
import { BILLING_ROUTES } from '../constants/billingRouteConstants';
import { ROUTES } from '../constants';
import { KPI_ROUTES, KPI_ADMIN_ROUTES } from '../constants/kpiRouteConstants';

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
// SUPER ADMIN NAVIGATION GROUPS
// ============================================
export const SUPER_ADMIN_NAV_GROUPS = {
  main: [
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.OVERVIEW, name: 'Platform Overview', icon: FiHome, end: true },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.CUSTOM_OVERVIEW, name: 'Custom Overview', icon: FiHome },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.PLATFORM_METRICS, name: 'Platform Metrics', icon: FiBarChart2 },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.SYSTEM_HEALTH, name: 'PMS System Health', icon: FiActivity },
  ],
  tenants: [
    { path: '/tenants', name: 'All Tenants', icon: MdBusiness },
    { path: '/tenants/dashboard', name: 'Tenant Dashboard', icon: FiGrid },
    { path: '/tenants/platform-settings', name: 'Platform Settings', icon: FiSettings },
    { path: '/tenants/connections', name: 'Connection Dashboard', icon: FiActivity },
    { path: '/tenants/connections/metrics', name: 'Connection Metrics', icon: FiBarChart2 },
    { path: '/tenants/connections/health', name: 'Connection Health', icon: FiShield },
  ],
  billing: ADMIN_BILLING_NAV_ITEMS,
  
  // KPI Groups
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
  accounts: [
    { path: '/users', name: 'All Users', icon: FiUsers },
    { path: '/roles', name: 'All Roles', icon: FiShield },
    { path: '/sessions', name: 'Platform Sessions', icon: FiClock },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.AUDIT_LOGS, name: 'Platform Audit Logs', icon: FiFileText },
    { path: '/audit', name: 'Accounts Audit Logs', icon: FiActivity },
    { path: '/admin/users', name: 'Admin Users', icon: FiUsers },
    { path: '/admin/tenants', name: 'Admin Tenants', icon: FiLayers },
  ],
  mfa: MFA_NAV_ITEMS,
  config: CONFIG_NAV_ITEMS,
  settings: [
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.SETTINGS, name: 'PMS Settings', icon: FiSettings },
    { path: '/config/settings', name: 'Config Settings', icon: FiSettings },
    { path: '/reviews/settings', name: 'Reviews Settings', icon: FiSettings },
    { path: '/app/structure/settings', name: 'Structure Settings', icon: FiSettings },
    { path: '/security', name: 'Accounts Security', icon: FiLock },
    { path: '/admin/system', name: 'Admin System Settings', icon: FiServer },
    { path: '/settings', name: 'System Settings', icon: FiSettings },
    { path: '/notifications', name: 'Notification Settings', icon: FiBell },
  ],
};

// ============================================
// CLIENT ADMIN NAVIGATION GROUPS
// ============================================
export const CLIENT_ADMIN_NAV_GROUPS = {
  main: [
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.TENANT, name: 'Tenant Overview', icon: FiServer },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.KPI_BREAKDOWN, name: 'KPI Breakdown', icon: FiBarChart2 },
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
    { path: ROUTES.USERS, name: 'User Directory', icon: FiUsers },
    { path: ROUTES.ROLES, name: 'Role Management', icon: FiShield },
  ],
  mfa: MFA_NAV_ITEMS,
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

// ============================================
// EXPANDED STATES
// ============================================
export const SUPER_ADMIN_DEFAULT_EXPANDED = {
  main: true,
  tenants: false,
  billing: false,
  kpiAdmin: true,        // Expand KPI System Admin
  kpiManagement: true,   // Expand KPI Management
  kpiAnalytics: false,
  kpiOperations: false,
  kpiDashboards: false,
  structure: false,
  reviews: false,
  accounts: false,
  mfa: false,
  config: false,
  settings: false,
};

export const CLIENT_ADMIN_DEFAULT_EXPANDED = {
  main: true,
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
// GROUP LABELS
// ============================================
export const SUPER_ADMIN_GROUP_LABELS = {
  main: 'Main',
  tenants: 'Tenant Ops & Connections',
  billing: 'Billing Administration',
  kpiAdmin: '🏗️ KPI System Admin',
  kpiManagement: '📊 KPI Management',
  kpiAnalytics: '📈 Analytics & Reports',
  kpiOperations: '⚙️ Operations',
  kpiDashboards: '📺 Dashboards',
  structure: 'Organization Structure',
  reviews: 'Performance Reviews',
  accounts: 'Users & Platform Access',
  mfa: 'Multi-Factor Authentication',
  config: 'Configuration Manager',
  settings: 'System & Unified Settings',
};

export const CLIENT_ADMIN_GROUP_LABELS = {
  main: 'Main',
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
// HELPER FUNCTION TO CHECK IF ROUTE IS ACTIVE
// ============================================
export const isKpiRouteActive = (path, currentPath) => {
  if (path === currentPath) return true;
  
  const patterns = [
    /^\/kpi\/kpis\/[\w-]+$/,
    /^\/kpi\/kpis\/[\w-]+\/edit$/,
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
  
  return patterns.some(pattern => pattern.test(currentPath));
};