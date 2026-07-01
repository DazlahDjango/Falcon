// src/config/navigation/platformAdminNav.js
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
  FiStar,
  FiAward,
  FiUsers as FiUserGroup,
  FiMessageSquare,
  FiTrendingUp as FiUpward,
  FiUser,
} from 'react-icons/fi';
import { MdBackup, MdOutlineDashboard, MdBusiness, MdDomain, MdSchema, MdQrCodeScanner, MdGavel } from 'react-icons/md';
import { HiOutlineStatusOnline } from 'react-icons/hi';
import { HiOutlineBuildingOffice, HiOutlineUserGroup } from 'react-icons/hi2';
import { BsBriefcase, BsPersonBadge, BsDiagram3 } from 'react-icons/bs';

import { DASHBOARD_ROUTES } from '../constants/dashboardRouteConstants';
import { BILLING_ROUTES } from '../constants/billingRouteConstants';
import { ROUTES } from '../constants';
import { KPI_ROUTES, KPI_ADMIN_ROUTES } from '../constants/kpiRouteConstants';
import { REVIEW_ROUTES } from '../constants/reviewRouteConstants';
import { STRUCTURE_ROUTES } from '../constants/structureRouteConstants';

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
// STRUCTURE NAVIGATION ITEMS
// ============================================
export const STRUCTURE_NAV_ITEMS = [
  // Dashboards
  { path: STRUCTURE_ROUTES.DASHBOARD, name: 'Structure Dashboard', icon: FiBarChart2 },
  { path: STRUCTURE_ROUTES.DASHBOARD_HEALTH, name: 'Structure Health', icon: FiActivity },
  
  // Organizational Units
  { path: STRUCTURE_ROUTES.ORG_UNITS, name: 'Organizational Units', icon: FiLayers },
  { path: STRUCTURE_ROUTES.DIVISIONS, name: 'Divisions', icon: FiGitBranch },
  { path: STRUCTURE_ROUTES.DEPARTMENTS, name: 'Departments', icon: HiOutlineBuildingOffice },
  { path: STRUCTURE_ROUTES.SECTIONS, name: 'Sections', icon: FiFolder },
  { path: STRUCTURE_ROUTES.UNITS, name: 'Units', icon: FiGrid },
  
  // Positions & Employments
  { path: STRUCTURE_ROUTES.POSITIONS, name: 'Positions', icon: BsBriefcase },
  { path: STRUCTURE_ROUTES.EMPLOYMENTS, name: 'Employments', icon: BsPersonBadge },
  { path: STRUCTURE_ROUTES.MY_EMPLOYMENT, name: 'My Employment', icon: FiUser },
  
  // Reporting
  { path: STRUCTURE_ROUTES.REPORTING_LINES, name: 'Reporting Lines', icon: BsDiagram3 },
  { path: STRUCTURE_ROUTES.MY_CHAIN, name: 'My Reporting Chain', icon: FiGitBranch },
  { path: STRUCTURE_ROUTES.ORGANIZATION_SPAN, name: 'Span of Control', icon: FiUsers },
  { path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENTS, name: 'Interim Assignments', icon: FiClock },
  
  // Resources
  { path: STRUCTURE_ROUTES.COST_CENTERS, name: 'Cost Centers', icon: FiDollarSign },
  { path: STRUCTURE_ROUTES.LOCATIONS, name: 'Locations', icon: FiMapPin },
  
  // Hierarchy
  { path: STRUCTURE_ROUTES.HIERARCHY_CURRENT, name: 'Current Hierarchy', icon: FiDatabase },
  { path: STRUCTURE_ROUTES.HIERARCHY_HISTORY, name: 'Version History', icon: FiClock },
  { path: STRUCTURE_ROUTES.HIERARCHY_VALIDATE, name: 'Validate Hierarchy', icon: FiCheckCircle },
  
  // Visualization
  { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Org Chart', icon: FiGitBranch },
  { path: STRUCTURE_ROUTES.ORG_CHART_TREE, name: 'Org Tree', icon: FiLayers },
  
  // Bulk Operations
  { path: STRUCTURE_ROUTES.BULK_DEPARTMENTS, name: 'Bulk Departments', icon: FiDatabase },
  { path: STRUCTURE_ROUTES.BULK_EMPLOYMENTS, name: 'Bulk Employments', icon: FiDatabase },
  { path: STRUCTURE_ROUTES.BULK_REPORTING, name: 'Bulk Reporting', icon: FiDatabase },
  
  // Settings
  { path: STRUCTURE_ROUTES.SYSTEM_SETTINGS, name: 'Structure Settings', icon: FiSettings },
  { path: STRUCTURE_ROUTES.REFERENCE_DATA, name: 'Reference Data', icon: FiDatabase },
];

// ============================================
// REVIEWS NAVIGATION ITEMS (Super Admin)
// ============================================
export const REVIEWS_NAV_ITEMS = [
  // Dashboards
  { path: REVIEW_ROUTES.REVIEW_DASHBOARD_STAFF, name: 'Staff Dashboard', icon: FiHome },
  { path: REVIEW_ROUTES.REVIEW_DASHBOARD_SUPERVISOR, name: 'Supervisor Dashboard', icon: FiUserGroup },
  { path: REVIEW_ROUTES.REVIEW_DASHBOARD_EXECUTIVE, name: 'Executive Dashboard', icon: FiTrendingUp },
  { path: REVIEW_ROUTES.REVIEW_DASHBOARD_ADMIN, name: 'Admin Dashboard', icon: FiShield },
  
  // Core Features
  { path: REVIEW_ROUTES.RATING_SCALES_LIST, name: 'Rating Scales', icon: FiSliders },
  { path: REVIEW_ROUTES.COMPETENCIES_LIST, name: 'Competencies', icon: FiTarget },
  { path: REVIEW_ROUTES.COMPETENCY_CATEGORIES, name: 'Competency Categories', icon: FiFolder },
  { path: REVIEW_ROUTES.REVIEW_CYCLES_LIST, name: 'Review Cycles', icon: FiCalendar },
  
  // Assessments
  { path: REVIEW_ROUTES.SELF_ASSESSMENT_FORM, name: 'Self Assessment', icon: FiCheckCircle },
  { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_QUEUE, name: 'Review Queue', icon: FiActivity },
  { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_PENDING_APPROVALS, name: 'Pending Approvals', icon: FiClock },
  { path: REVIEW_ROUTES.FINAL_RATINGS_LIST, name: 'Final Ratings', icon: FiStar },
  { path: REVIEW_ROUTES.RATING_DISTRIBUTION, name: 'Rating Distribution', icon: FiBarChart2 },
  
  // PIPs
  { path: REVIEW_ROUTES.PIPS_LIST, name: 'PIPs', icon: FiFlag },
  { path: REVIEW_ROUTES.PIPS_REPORT, name: 'PIP Reports', icon: FiFileText },
  
  // Feedback & Calibration
  { path: REVIEW_ROUTES.FEEDBACK_REQUESTS, name: '360 Feedback', icon: FiMessageSquare },
  { path: REVIEW_ROUTES.CALIBRATION_SESSIONS, name: 'Calibration Sessions', icon: MdGavel },
  { path: REVIEW_ROUTES.CALIBRATION_OUTLIERS, name: 'Calibration Outliers', icon: FiAlertCircle },
  
  // Coefficients & Promotions
  { path: REVIEW_ROUTES.COEFFICIENTS_LIST, name: 'Coefficients', icon: FiSliders },
  { path: REVIEW_ROUTES.PROMOTIONS_LIST, name: 'Promotions', icon: FiAward },
  { path: REVIEW_ROUTES.PROMOTIONS_STATS, name: 'Promotion Stats', icon: FiBarChart2 },
  
  // Templates
  { path: REVIEW_ROUTES.REVIEW_TEMPLATES_LIST, name: 'Review Templates', icon: FiFileText },
  
  // Reports & Settings
  { path: REVIEW_ROUTES.REPORTS, name: 'Reports', icon: FiDownload },
  { path: REVIEW_ROUTES.REPORTS_EMPLOYEE, name: 'Employee Reports', icon: FiUsers },
  { path: REVIEW_ROUTES.REPORTS_TEAM, name: 'Team Reports', icon: FiUserGroup },
  { path: REVIEW_ROUTES.REPORTS_CYCLE, name: 'Cycle Reports', icon: FiCalendar },
  { path: REVIEW_ROUTES.REPORTS_PIP, name: 'PIP Reports', icon: FiFlag },
  { path: REVIEW_ROUTES.REPORTS_CALIBRATION, name: 'Calibration Reports', icon: MdGavel },
  { path: REVIEW_ROUTES.REPORTS_EXPORT, name: 'Export Reports', icon: FiDownload },
  
  // Settings
  { path: REVIEW_ROUTES.SYSTEM_SETTINGS, name: 'System Settings', icon: FiSettings },
  { path: REVIEW_ROUTES.NOTIFICATION_PREFERENCES, name: 'Notification Preferences', icon: FiBell },
  { path: REVIEW_ROUTES.AUDIT_SETTINGS, name: 'Audit Settings', icon: FiShield },
  
  // Audit & Notifications
  { path: REVIEW_ROUTES.AUDIT_LOGS, name: 'Audit Logs', icon: FiList },
  { path: REVIEW_ROUTES.NOTIFICATIONS, name: 'Notifications', icon: FiBell },
];

// ============================================
// REVIEWS NAVIGATION ITEMS (Client Admin - limited)
// ============================================
export const CLIENT_ADMIN_REVIEWS_NAV_ITEMS = [
  // Dashboards
  { path: REVIEW_ROUTES.REVIEW_DASHBOARD_STAFF, name: 'Staff Dashboard', icon: FiHome },
  { path: REVIEW_ROUTES.REVIEW_DASHBOARD_SUPERVISOR, name: 'Supervisor Dashboard', icon: FiUserGroup },
  { path: REVIEW_ROUTES.REVIEW_DASHBOARD_EXECUTIVE, name: 'Executive Dashboard', icon: FiTrendingUp },
  
  // Core Features
  { path: REVIEW_ROUTES.RATING_SCALES_LIST, name: 'Rating Scales', icon: FiSliders },
  { path: REVIEW_ROUTES.COMPETENCIES_LIST, name: 'Competencies', icon: FiTarget },
  { path: REVIEW_ROUTES.REVIEW_CYCLES_LIST, name: 'Review Cycles', icon: FiCalendar },
  
  // Assessments
  { path: REVIEW_ROUTES.SELF_ASSESSMENT_FORM, name: 'Self Assessment', icon: FiCheckCircle },
  { path: REVIEW_ROUTES.FINAL_RATINGS_LIST, name: 'Final Ratings', icon: FiStar },
  
  // PIPs
  { path: REVIEW_ROUTES.PIPS_LIST, name: 'PIPs', icon: FiFlag },
  
  // Feedback & Calibration
  { path: REVIEW_ROUTES.FEEDBACK_REQUESTS, name: '360 Feedback', icon: FiMessageSquare },
  
  // Reports
  { path: REVIEW_ROUTES.REPORTS, name: 'Reports', icon: FiDownload },
  
  // Settings
  { path: REVIEW_ROUTES.SYSTEM_SETTINGS, name: 'System Settings', icon: FiSettings },
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
  
  // Structure Group - NEW
  structure: STRUCTURE_NAV_ITEMS,
  
  // Reviews - Full access for Super Admin
  reviews: REVIEWS_NAV_ITEMS,
  
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
    { path: STRUCTURE_ROUTES.SYSTEM_SETTINGS, name: 'Structure Settings', icon: FiSettings },
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
  
  // Structure Group - NEW for Client Admin
  structure: STRUCTURE_NAV_ITEMS,
  
  management: [
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.USERS, name: 'Users (PMS)', icon: FiUsers },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.ROLES, name: 'Roles & Permissions', icon: FiShield },
    { path: ROUTES.USERS, name: 'User Directory', icon: FiUsers },
    { path: ROUTES.ROLES, name: 'Role Management', icon: FiShield },
  ],
  
  // Reviews - Limited access for Client Admin
  reviews: CLIENT_ADMIN_REVIEWS_NAV_ITEMS,
  
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
  kpiAdmin: true,
  kpiManagement: true,
  kpiAnalytics: false,
  kpiOperations: false,
  kpiDashboards: false,
  structure: true,  // Structure expanded by default for Super Admin
  reviews: true,
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
  structure: true,  // Structure expanded by default for Client Admin
  management: true,
  reviews: true,
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
  structure: '🏛️ Organization Structure',  // Structure label for Super Admin
  reviews: '⭐ Performance Reviews',
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
  structure: '🏛️ Organization Structure',  // Structure label for Client Admin
  management: 'Management',
  reviews: '⭐ Performance Reviews',
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
  
  return patterns.some(pattern => pattern.test(currentPath));
};

// ============================================
// STRUCTURE SPECIFIC HELPERS
// ============================================
export const isStructureRouteActive = (path, currentPath) => {
  if (path === currentPath) return true;
  
  const patterns = [
    /^\/structure\/departments\/[\w-]+$/,
    /^\/structure\/divisions\/[\w-]+$/,
    /^\/structure\/sections\/[\w-]+$/,
    /^\/structure\/units\/[\w-]+$/,
    /^\/structure\/positions\/[\w-]+$/,
    /^\/structure\/employments\/[\w-]+$/,
    /^\/structure\/hierarchy\/[\w-]+$/,
    /^\/structure\/cost-centers\/[\w-]+$/,
    /^\/structure\/locations\/[\w-]+$/,
    /^\/structure\/reporting\/[\w-]+$/,
    /^\/structure\/interim\/[\w-]+$/,
  ];
  
  return patterns.some(pattern => pattern.test(currentPath));
};