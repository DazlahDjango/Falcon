// config/navigation/reportsNav.js
/**
 * Navigation Configuration - Reporting Subsystem Scoped
 * Dedicated module defining all role-specific navigation items for the Reporting app.
 * Supporting Super Admin, Client Admin, Executive, Manager/Supervisor, Staff, Champion, and Read-Only.
 */
import {
  FiFileText,
  FiGrid,
  FiPlus,
  FiLayers,
  FiClock,
  FiDownload,
  FiActivity,
  FiShare2,
  FiShield,
  FiCopy,
  FiTrendingUp,
  FiBarChart2,
  FiSliders,
  FiSettings,
  FiEye,
  FiHome,
  FiUser,
  FiUsers,
  FiCheckCircle,
  FiAlertTriangle,
} from 'react-icons/fi';

import { DASHBOARD_ROUTES } from '../constants/dashboardRouteConstants';
import { REPORT_ROUTES } from '../constants/reportRouteConstants';

// ============================================
// 1. SUPER ADMIN REPORT NAV GROUPS (Platform Scope)
// ============================================
export const REPORTS_SUPER_ADMIN_NAV_GROUPS = {
  reports_main: [
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.OVERVIEW, name: 'Platform Overview', icon: FiHome, end: true },
    { path: REPORT_ROUTES.ADMIN_OVERVIEW, name: 'Report Platform Admin', icon: FiFileText },
  ],
  reports_studio: [
    { path: REPORT_ROUTES.REPORTS, name: 'All Reports', icon: FiFileText },
    { path: REPORT_ROUTES.REPORT_CREATE, name: 'Create Report', icon: FiPlus },
    { path: REPORT_ROUTES.TEMPLATES, name: 'Template Library', icon: FiCopy },
    { path: REPORT_ROUTES.TEMPLATE_CREATE, name: 'Create Template', icon: FiPlus },
  ],
  reports_dashboards: [
    { path: REPORT_ROUTES.DASHBOARDS, name: 'Dashboards Console', icon: FiGrid },
    { path: REPORT_ROUTES.DASHBOARD_CREATE, name: 'Create Dashboard', icon: FiPlus },
    { path: REPORT_ROUTES.WIDGETS, name: 'Widgets Registry', icon: FiSliders },
  ],
  reports_automation: [
    { path: REPORT_ROUTES.SCHEDULES, name: 'Scheduled Jobs', icon: FiClock },
    { path: REPORT_ROUTES.EXECUTIONS, name: 'Execution Logs', icon: FiActivity },
    { path: REPORT_ROUTES.EXPORTS, name: 'Exports Manager', icon: FiDownload },
  ],
  reports_governance: [
    { path: REPORT_ROUTES.ANALYTICS, name: 'Platform Analytics', icon: FiBarChart2 },
    { path: REPORT_ROUTES.SHARES, name: 'Shared Links', icon: FiShare2 },
    { path: REPORT_ROUTES.FILTERS, name: 'Global Filters', icon: FiSliders },
    { path: REPORT_ROUTES.AUDITS, name: 'Report Audit Logs', icon: FiShield },
    { path: REPORT_ROUTES.ADMIN_SETTINGS, name: 'Platform Settings', icon: FiSettings },
  ],
};

export const REPORTS_SUPER_ADMIN_GROUP_LABELS = {
  reports_main: '📊 Reporting Main',
  reports_studio: '📝 Report Studio & Templates',
  reports_dashboards: '🖥️ Dashboards & Widgets',
  reports_automation: '⚡ Automation & Exports',
  reports_governance: '🛡️ Governance & Analytics',
};

export const REPORTS_SUPER_ADMIN_DEFAULT_EXPANDED = {
  reports_main: true,
  reports_studio: true,
  reports_dashboards: false,
  reports_automation: false,
  reports_governance: false,
};

// ============================================
// 2. CLIENT ADMIN REPORT NAV GROUPS (Organization Scope)
// ============================================
export const REPORTS_CLIENT_ADMIN_NAV_GROUPS = {
  reports_main: [
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
    { path: REPORT_ROUTES.DASHBOARDS, name: 'Organization Dashboards', icon: FiGrid },
  ],
  reports_management: [
    { path: REPORT_ROUTES.REPORTS, name: 'Reports Directory', icon: FiFileText },
    { path: REPORT_ROUTES.REPORT_CREATE, name: 'Define New Report', icon: FiPlus },
    { path: REPORT_ROUTES.MY_REPORTS, name: 'My Saved Reports', icon: FiUser },
    { path: REPORT_ROUTES.FILTERS, name: 'Saved Filters', icon: FiSliders },
  ],
  reports_templates: [
    { path: REPORT_ROUTES.TEMPLATES, name: 'Report Templates', icon: FiCopy },
    { path: REPORT_ROUTES.TEMPLATE_PREBUILT, name: 'Prebuilt Gallery', icon: FiLayers },
  ],
  reports_automation: [
    { path: REPORT_ROUTES.SCHEDULES, name: 'Automated Schedules', icon: FiClock },
    { path: REPORT_ROUTES.SCHEDULE_CREATE, name: 'New Schedule', icon: FiPlus },
    { path: REPORT_ROUTES.EXPORTS, name: 'Export Center', icon: FiDownload },
    { path: REPORT_ROUTES.EXECUTIONS, name: 'Execution History', icon: FiActivity },
  ],
  reports_analytics: [
    { path: REPORT_ROUTES.ANALYTICS, name: 'Reporting Analytics', icon: FiTrendingUp },
    { path: REPORT_ROUTES.SHARES, name: 'Shared Reports', icon: FiShare2 },
    { path: REPORT_ROUTES.AUDITS, name: 'Audit History', icon: FiShield },
  ],
};

export const REPORTS_CLIENT_ADMIN_GROUP_LABELS = {
  reports_main: '📊 Reporting',
  reports_management: '📋 Report Management',
  reports_templates: '📑 Templates Gallery',
  reports_automation: '⏱️ Schedules & Delivery',
  reports_analytics: '📈 Analytics & Audits',
};

export const REPORTS_CLIENT_ADMIN_DEFAULT_EXPANDED = {
  reports_main: true,
  reports_management: true,
  reports_templates: false,
  reports_automation: false,
  reports_analytics: false,
};

// ============================================
// 3. EXECUTIVE REPORT NAV GROUPS (Executive Scope)
// ============================================
export const REPORTS_EXECUTIVE_NAV_GROUPS = {
  reports_main: [
    { path: DASHBOARD_ROUTES.EXECUTIVE.OVERVIEW, name: 'Executive Home', icon: FiHome, end: true },
    { path: REPORT_ROUTES.DASHBOARDS, name: 'Executive Dashboards', icon: FiGrid },
  ],
  reports_view: [
    { path: REPORT_ROUTES.REPORTS, name: 'Reports Directory', icon: FiFileText },
    { path: REPORT_ROUTES.PUBLIC_REPORTS, name: 'Published Reports', icon: FiEye },
    { path: REPORT_ROUTES.SHARED_WITH_ME, name: 'Shared with Me', icon: FiShare2 },
  ],
  reports_analytics: [
    { path: REPORT_ROUTES.ANALYTICS, name: '360° Analytics Hub', icon: FiTrendingUp },
    { path: REPORT_ROUTES.ANALYTICS_TREND, name: 'Trend Analysis', icon: FiBarChart2 },
    { path: REPORT_ROUTES.ANALYTICS_PERFORMANCE, name: 'Performance Overview', icon: FiActivity },
    { path: REPORT_ROUTES.ANALYTICS_ANOMALY, name: 'Anomaly Detection', icon: FiAlertTriangle },
  ],
  reports_export: [
    { path: REPORT_ROUTES.EXPORTS, name: 'Export History', icon: FiDownload },
  ],
};

export const REPORTS_EXECUTIVE_GROUP_LABELS = {
  reports_main: '📊 Executive Reporting',
  reports_view: '👁️ Reports Directory',
  reports_analytics: '📈 Analytics & Insights',
  reports_export: '📥 Exports',
};

export const REPORTS_EXECUTIVE_DEFAULT_EXPANDED = {
  reports_main: true,
  reports_view: true,
  reports_analytics: false,
  reports_export: false,
};

// ============================================
// 4. MANAGER REPORT NAV GROUPS (Manager/Supervisor Scope)
// ============================================
export const REPORTS_MANAGER_NAV_GROUPS = {
  reports_main: [
    { path: DASHBOARD_ROUTES.MANAGER.OVERVIEW, name: 'Manager Home', icon: FiHome, end: true },
    { path: REPORT_ROUTES.DASHBOARDS, name: 'Team Dashboards', icon: FiGrid },
  ],
  reports_management: [
    { path: REPORT_ROUTES.REPORTS, name: 'Team Reports', icon: FiFileText },
    { path: REPORT_ROUTES.REPORT_CREATE, name: 'Create Team Report', icon: FiPlus },
    { path: REPORT_ROUTES.MY_REPORTS, name: 'My Reports', icon: FiUser },
  ],
  reports_schedules: [
    { path: REPORT_ROUTES.SCHEDULES, name: 'Scheduled Reports', icon: FiClock },
    { path: REPORT_ROUTES.SCHEDULE_CREATE, name: 'Schedule Report', icon: FiPlus },
    { path: REPORT_ROUTES.MY_EXPORTS, name: 'My Exports', icon: FiDownload },
  ],
  reports_analytics: [
    { path: REPORT_ROUTES.ANALYTICS, name: 'Department Analytics', icon: FiTrendingUp },
    { path: REPORT_ROUTES.SHARES, name: 'Shared Reports', icon: FiShare2 },
  ],
};

export const REPORTS_MANAGER_GROUP_LABELS = {
  reports_main: '📊 Reporting',
  reports_management: '📋 Team Reports',
  reports_schedules: '⏱️ Schedules & Exports',
  reports_analytics: '📈 Team Analytics',
};

export const REPORTS_MANAGER_DEFAULT_EXPANDED = {
  reports_main: true,
  reports_management: true,
  reports_schedules: false,
  reports_analytics: false,
};

// ============================================
// 5. CHAMPION REPORT NAV GROUPS (Champion Scope)
// ============================================
export const REPORTS_CHAMPION_NAV_GROUPS = {
  reports_main: [
    { path: DASHBOARD_ROUTES.CHAMPION.OVERVIEW, name: 'Champion Home', icon: FiHome, end: true },
    { path: REPORT_ROUTES.DASHBOARDS, name: 'Reporting Dashboards', icon: FiGrid },
  ],
  reports_builder: [
    { path: REPORT_ROUTES.REPORTS, name: 'Reports Directory', icon: FiFileText },
    { path: REPORT_ROUTES.REPORT_CREATE, name: 'Report Studio', icon: FiPlus },
    { path: REPORT_ROUTES.TEMPLATES, name: 'Template Library', icon: FiCopy },
    { path: REPORT_ROUTES.TEMPLATE_CREATE, name: 'Build Template', icon: FiPlus },
    { path: REPORT_ROUTES.WIDGETS, name: 'Custom Widgets', icon: FiSliders },
  ],
  reports_automation: [
    { path: REPORT_ROUTES.SCHEDULES, name: 'Automated Schedules', icon: FiClock },
    { path: REPORT_ROUTES.EXECUTIONS, name: 'Execution History', icon: FiActivity },
    { path: REPORT_ROUTES.EXPORTS, name: 'Export Center', icon: FiDownload },
  ],
  reports_analytics: [
    { path: REPORT_ROUTES.ANALYTICS, name: 'Advanced Analytics', icon: FiTrendingUp },
    { path: REPORT_ROUTES.ANALYTICS_TREND, name: 'Trend Insights', icon: FiBarChart2 },
    { path: REPORT_ROUTES.ANALYTICS_COMPARATIVE, name: 'Comparative Analysis', icon: FiActivity },
  ],
};

export const REPORTS_CHAMPION_GROUP_LABELS = {
  reports_main: '📊 Reporting',
  reports_builder: '🛠️ Report & Template Studio',
  reports_automation: '⚡ Automation & Exports',
  reports_analytics: '📈 Analytics',
};

export const REPORTS_CHAMPION_DEFAULT_EXPANDED = {
  reports_main: true,
  reports_builder: true,
  reports_automation: false,
  reports_analytics: false,
};

// ============================================
// 6. STAFF REPORT NAV GROUPS (Individual Contributor Scope)
// ============================================
export const REPORTS_STAFF_NAV_GROUPS = {
  reports_main: [
    { path: DASHBOARD_ROUTES.STAFF.OVERVIEW, name: 'Staff Home', icon: FiHome, end: true },
    { path: REPORT_ROUTES.MY_DASHBOARDS, name: 'My Dashboard', icon: FiGrid },
    { path: REPORT_ROUTES.MY_REPORTS, name: 'My Reports', icon: FiUser },
  ],
  reports_view: [
    { path: REPORT_ROUTES.REPORTS, name: 'Browse Reports', icon: FiFileText },
    { path: REPORT_ROUTES.SHARED_WITH_ME, name: 'Shared with Me', icon: FiShare2 },
    { path: REPORT_ROUTES.MY_EXPORTS, name: 'My Exports', icon: FiDownload },
  ],
};

export const REPORTS_STAFF_GROUP_LABELS = {
  reports_main: '📊 My Reports',
  reports_view: '👁️ Browse & Shared',
};

export const REPORTS_STAFF_DEFAULT_EXPANDED = {
  reports_main: true,
  reports_view: true,
};

// ============================================
// 7. READ-ONLY REPORT NAV GROUPS (Viewer/Auditor Scope)
// ============================================
export const REPORTS_READ_ONLY_NAV_GROUPS = {
  reports_main: [
    { path: DASHBOARD_ROUTES.READ_ONLY.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
    { path: REPORT_ROUTES.DASHBOARDS, name: 'Dashboards View', icon: FiGrid },
  ],
  reports_view: [
    { path: REPORT_ROUTES.REPORTS, name: 'Reports Directory', icon: FiFileText },
    { path: REPORT_ROUTES.PUBLIC_REPORTS, name: 'Public Reports', icon: FiEye },
    { path: REPORT_ROUTES.SHARED_WITH_ME, name: 'Shared Reports', icon: FiShare2 },
    { path: REPORT_ROUTES.EXPORTS, name: 'Export History', icon: FiDownload },
  ],
};

export const REPORTS_READ_ONLY_GROUP_LABELS = {
  reports_main: '📊 Reports View',
  reports_view: '👁️ Shared & Public',
};

export const REPORTS_READ_ONLY_DEFAULT_EXPANDED = {
  reports_main: true,
  reports_view: true,
};

// ============================================
// ACTIVE ROUTE HELPER
// ============================================
export const isReportsRouteActive = (pathname) => {
  return pathname.startsWith(REPORT_ROUTES.BASE);
};

export default {
  REPORTS_SUPER_ADMIN_NAV_GROUPS,
  REPORTS_SUPER_ADMIN_GROUP_LABELS,
  REPORTS_SUPER_ADMIN_DEFAULT_EXPANDED,
  REPORTS_CLIENT_ADMIN_NAV_GROUPS,
  REPORTS_CLIENT_ADMIN_GROUP_LABELS,
  REPORTS_CLIENT_ADMIN_DEFAULT_EXPANDED,
  REPORTS_EXECUTIVE_NAV_GROUPS,
  REPORTS_EXECUTIVE_GROUP_LABELS,
  REPORTS_EXECUTIVE_DEFAULT_EXPANDED,
  REPORTS_MANAGER_NAV_GROUPS,
  REPORTS_MANAGER_GROUP_LABELS,
  REPORTS_MANAGER_DEFAULT_EXPANDED,
  REPORTS_CHAMPION_NAV_GROUPS,
  REPORTS_CHAMPION_GROUP_LABELS,
  REPORTS_CHAMPION_DEFAULT_EXPANDED,
  REPORTS_STAFF_NAV_GROUPS,
  REPORTS_STAFF_GROUP_LABELS,
  REPORTS_STAFF_DEFAULT_EXPANDED,
  REPORTS_READ_ONLY_NAV_GROUPS,
  REPORTS_READ_ONLY_GROUP_LABELS,
  REPORTS_READ_ONLY_DEFAULT_EXPANDED,
  isReportsRouteActive,
};
