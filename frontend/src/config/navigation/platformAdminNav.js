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
  FiSmartphone,        // ← NEW for MFA devices
  FiCode,              // ← NEW for backup codes
} from 'react-icons/fi';
import { MdBackup, MdOutlineDashboard, MdBusiness, MdDomain, MdSchema, MdQrCodeScanner } from 'react-icons/md';
import { HiOutlineStatusOnline } from 'react-icons/hi';
import { HiOutlineBuildingOffice, HiOutlineUserGroup } from 'react-icons/hi2';
import { BsBriefcase, BsPersonBadge, BsDiagram3 } from 'react-icons/bs';

import { DASHBOARD_ROUTES } from '../constants/dashboardRouteConstants';
import { BILLING_ROUTES } from '../constants/billingRouteConstants';
import { ROUTES } from '../constants';

// ============================================
// MFA ROUTES (NEW)
// ============================================
export const MFA_ROUTES = {
  DEVICES: '/security/mfa',
  BACKUP_CODES: '/security/backup-codes',
  ACTIVITY: '/security/mfa-activity',
  SETUP: '/mfa/setup',
  VERIFY: '/mfa/verify',
};

// ============================================
// KPI ADMIN ROUTES (NEW)
// ============================================
export const KPI_ADMIN_ROUTES = {
  OVERVIEW: '/kpi/admin/overview',
  SECTORS: '/kpi/admin/sectors',
  FRAMEWORKS: '/kpi/admin/frameworks',
  CATEGORIES: '/kpi/admin/categories',
  TEMPLATES: '/kpi/admin/templates',
};

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

// ============================================
// MFA NAVIGATION ITEMS (NEW)
// ============================================
export const MFA_NAV_ITEMS = [
  { path: MFA_ROUTES.DEVICES, name: 'MFA Devices', icon: FiSmartphone },
  { path: MFA_ROUTES.BACKUP_CODES, name: 'Backup Codes', icon: FiCode },
  { path: MFA_ROUTES.ACTIVITY, name: 'MFA Activity', icon: FiActivity },
];

// ============================================
// SUPER ADMIN NAVIGATION (UPDATED)
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
  billing: [
    { path: BILLING_ROUTES.ADMIN_BASE, name: 'Billing Admin', icon: FiDollarSign },
    { path: BILLING_ROUTES.ADMIN_PLANS, name: 'Plans', icon: FiGrid },
    { path: BILLING_ROUTES.ADMIN_SUBSCRIPTIONS, name: 'Subscriptions', icon: FiClock },
    { path: BILLING_ROUTES.ADMIN_TRANSACTIONS, name: 'Transactions', icon: FiFileText },
    { path: BILLING_ROUTES.ADMIN_REFUNDS, name: 'Refunds', icon: FiRefreshCw },
    { path: BILLING_ROUTES.ADMIN_WEBHOOKS, name: 'Webhooks', icon: FiBell },
    { path: BILLING_ROUTES.ADMIN_ANALYTICS, name: 'Analytics', icon: FiTrendingUp },
  ],

  // ============================================
  // KPI ADMIN SECTION (NEW - FOR SUPER ADMIN)
  // ============================================
  kpiAdmin: [
    { path: KPI_ADMIN_ROUTES.OVERVIEW, name: 'KPI Admin Overview', icon: FiPieChart },
    { path: KPI_ADMIN_ROUTES.SECTORS, name: 'Sectors', icon: FiBriefcase },
    { path: KPI_ADMIN_ROUTES.FRAMEWORKS, name: 'Frameworks', icon: FiPackage },
    { path: KPI_ADMIN_ROUTES.CATEGORIES, name: 'Categories', icon: FiFolder },
    { path: KPI_ADMIN_ROUTES.TEMPLATES, name: 'Templates', icon: FiFileText },
  ],

  // ============================================
  // EXISTING KPI SECTION (User-facing KPIs)
  // ============================================
  kpi: [
    { path: ROUTES.KPI_DASHBOARD, name: 'KPI Dashboard', icon: FiBarChart2 },
    { path: ROUTES.KPI_MANAGEMENT, name: 'KPI Management', icon: FiBarChart2 },
    { path: ROUTES.KPI_ANALYTICS, name: 'KPI Analytics', icon: FiTrendingUp },
    { path: ROUTES.KPI_SETTINGS, name: 'KPI Operations', icon: FiSettings },
  ],

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

  // ============================================
  // MFA SECTION (NEW - FOR ALL AUTHENTICATED USERS)
  // ============================================
  mfa: [
    { path: MFA_ROUTES.DEVICES, name: 'MFA Devices', icon: FiSmartphone },
    { path: MFA_ROUTES.BACKUP_CODES, name: 'Backup Codes', icon: FiCode },
    { path: MFA_ROUTES.ACTIVITY, name: 'MFA Activity', icon: FiActivity },
  ],

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
// CLIENT ADMIN NAVIGATION (UPDATED)
// ============================================
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

  // ============================================
  // KPI ADMIN SECTION (NEW - FOR CLIENT ADMIN)
  // ============================================
  kpiAdmin: [
    { path: KPI_ADMIN_ROUTES.OVERVIEW, name: 'KPI Admin Overview', icon: FiPieChart },
    { path: KPI_ADMIN_ROUTES.SECTORS, name: 'Sectors', icon: FiBriefcase },
    { path: KPI_ADMIN_ROUTES.FRAMEWORKS, name: 'Frameworks', icon: FiPackage },
    { path: KPI_ADMIN_ROUTES.CATEGORIES, name: 'Categories', icon: FiFolder },
    { path: KPI_ADMIN_ROUTES.TEMPLATES, name: 'Templates', icon: FiFileText },
  ],

  management: [
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.USERS, name: 'Users (PMS)', icon: FiUsers },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.ROLES, name: 'Roles & Permissions', icon: FiShield },
    { path: ROUTES.USERS, name: 'User Directory', icon: FiUsers },
    { path: ROUTES.ROLES, name: 'Role Management', icon: FiShield },
  ],

  // ============================================
  // MFA SECTION (NEW - FOR CLIENT ADMIN)
  // ============================================
  mfa: [
    { path: MFA_ROUTES.DEVICES, name: 'MFA Devices', icon: FiSmartphone },
    { path: MFA_ROUTES.BACKUP_CODES, name: 'Backup Codes', icon: FiCode },
    { path: MFA_ROUTES.ACTIVITY, name: 'MFA Activity', icon: FiActivity },
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

// ============================================
// EXPANDED STATES (UPDATED)
// ============================================
export const SUPER_ADMIN_DEFAULT_EXPANDED = {
  main: true,
  tenants: false,
  billing: false,
  kpiAdmin: false,
  kpi: false,
  structure: false,
  reviews: false,
  accounts: false,
  mfa: false,        // ← NEW
  config: false,
  settings: false,
};

export const CLIENT_ADMIN_DEFAULT_EXPANDED = {
  main: true,
  oversight: true,
  kpiAdmin: false,
  management: true,
  mfa: false,        // ← NEW
  compliance: false,
  config: false,
};

// ============================================
// GROUP LABELS (UPDATED)
// ============================================
export const SUPER_ADMIN_GROUP_LABELS = {
  main: 'Main',
  tenants: 'Tenant Ops & Connections',
  billing: 'Billing Admin',
  kpiAdmin: 'KPI System Admin',
  kpi: 'KPI Management (User)',
  structure: 'Organization Structure',
  reviews: 'Performance Reviews',
  accounts: 'Users & Platform Access',
  mfa: 'Multi-Factor Authentication',     // ← NEW
  config: 'Configuration Manager',
  settings: 'System & Unified Settings',
};

export const CLIENT_ADMIN_GROUP_LABELS = {
  main: 'Main',
  oversight: 'Oversight',
  kpiAdmin: 'KPI System Admin',
  management: 'Management',
  mfa: 'Multi-Factor Authentication',     // ← NEW
  compliance: 'Reports & Compliance',
  config: 'Configuration',
};