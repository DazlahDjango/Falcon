// config/navigation/kpiNav.js
/**
 * Navigation Configuration - KPI Subsystem Scoped
 * Dedicated module defining all role-specific navigation items for the KPI app.
 * Supporting Super Admin, Client Admin, KPI Champion, Executive, Manager/Supervisor, Staff, and Read-Only.
 */
import {
  FiDownload, FiCalendar, FiPieChart, FiTarget, FiActivity,
  FiFileText, FiCheckCircle, FiAlertCircle, FiUpload, FiSettings,
  FiLayers, FiBarChart2, FiGrid, FiUsers, FiPlus,
  FiClock, FiShield, FiEye, FiTrendingUp,
  FiRotateCcw, FiShare2, FiSliders, FiAward
} from 'react-icons/fi';

import { KPI_ROUTES } from '../constants/kpiRouteConstants';

// ============================================
// 1. SUPER ADMIN KPI NAV GROUPS (Platform Scope)
// ============================================
export const KPI_SUPER_ADMIN_NAV_GROUPS = {
  kpi_admin: [
    { path: KPI_ROUTES.ADMIN_CATEGORIES, name: 'Key Result Areas', icon: FiLayers },
    { path: KPI_ROUTES.SYSTEM_SETTINGS, name: 'Platform KPI Policy', icon: FiSliders },
    { path: KPI_ROUTES.REFERENCE_DATA, name: 'Reference Data', icon: FiUsers },
    { path: KPI_ROUTES.AUDIT_LOGS, name: 'KPI Audit Logs', icon: FiFileText },
    { path: KPI_ROUTES.KPI_MANAGEMENT, name: 'Organization KPIs', icon: FiTarget },
    { path: KPI_ROUTES.KPI_MY_KPIS, name: 'My KPIs', icon: FiUsers },
    { path: KPI_ROUTES.TARGETS, name: 'Targets', icon: FiCalendar },
    { path: KPI_ROUTES.ACTUALS, name: 'Actuals', icon: FiActivity },
    { path: KPI_ROUTES.VALIDATIONS, name: 'Validations', icon: FiCheckCircle },
    { path: KPI_ROUTES.ESCALATIONS, name: 'Escalations', icon: FiAlertCircle },
    { path: KPI_ROUTES.ACTUAL_ADJUSTMENTS, name: 'Adjustments', icon: FiRotateCcw },
  ],
  kpi_operations: [
    { path: KPI_ROUTES.CALCULATIONS, name: 'Calculation Console', icon: FiActivity },
    { path: KPI_ROUTES.BULK_UPLOAD, name: 'Bulk Imports', icon: FiUpload },
    { path: KPI_ROUTES.ANALYTICS_INSIGHTS, name: 'Analytics Insights', icon: FiTrendingUp },
    { path: KPI_ROUTES.SCORES, name: 'Score Dashboard', icon: FiBarChart2 },
    { path: KPI_ROUTES.SCORE_MY_SCORES, name: 'My Scores', icon: FiEye },
    { path: KPI_ROUTES.SCORE_TEAM_SCORES, name: 'Team Scores', icon: FiUsers },
    { path: KPI_ROUTES.SCORE_RED_ALERTS, name: 'Red Alerts', icon: FiAlertCircle },
    { path: KPI_ROUTES.AGGREGATED_SCORES, name: 'Aggregated Scores', icon: FiPieChart },
    { path: KPI_ROUTES.ORGANIZATION_HEALTH, name: 'Organization Health', icon: FiActivity },
    { path: KPI_ROUTES.KPI_REPORTS, name: 'Reports', icon: FiDownload },
    { path: KPI_ROUTES.KPI_HEATMAP, name: 'Heatmap', icon: FiGrid },
  ],
};

export const KPI_SUPER_ADMIN_GROUP_LABELS = {
  kpi_admin: '⚙️ KPI System Admin',
  kpi_operations: '⚡ Platform Operations',
};

export const KPI_SUPER_ADMIN_DEFAULT_EXPANDED = {
  kpi_admin: true,
  kpi_operations: false,
};

// ============================================
// 2. CLIENT ADMIN KPI NAV GROUPS (Personal Contributor Suite - Like Staff)
// ============================================
export const KPI_CLIENT_ADMIN_NAV_GROUPS = {
  my_kpi: [
    { path: `${KPI_ROUTES.KPI_MY_KPIS}?scope=my`, name: 'My Performance Indicators', icon: FiTarget },
    { path: KPI_ROUTES.KPI_CREATE, name: 'Create KPI', icon: FiPlus },
    { path: KPI_ROUTES.BULK_UPLOAD, name: 'My Bulk Operations', icon: FiLayers },
    { path: KPI_ROUTES.ACTUAL_SUBMIT, name: 'Submit Monthly Actual', icon: FiPlus },
    { path: `${KPI_ROUTES.ACTUALS}?scope=my`, name: 'My Actual Submissions', icon: FiClock },
    { path: `${KPI_ROUTES.TARGETS}?scope=my`, name: 'My Target Phasing', icon: FiCalendar },
    { path: KPI_ROUTES.SCORE_MY_SCORES, name: 'My Performance Scores', icon: FiAward },
    { path: KPI_ROUTES.ESCALATIONS, name: 'Dispute Escalations', icon: FiAlertCircle },
  ],
};

export const KPI_CLIENT_ADMIN_GROUP_LABELS = {
  my_kpi: '📝 Performance & Submissions',
};

export const KPI_CLIENT_ADMIN_DEFAULT_EXPANDED = {
  my_kpi: true,
};

// ============================================
// 3. CHAMPION / HR ADMIN KPI NAV GROUPS (Full Organization Governance + Operations)
// ============================================
export const KPI_CHAMPION_NAV_GROUPS = {
  organization_kpis: [
    { path: `${KPI_ROUTES.KPI_MY_KPIS}?scope=my`, name: 'My Performance Indicators', icon: FiTarget },
    { path: KPI_ROUTES.ACTUAL_SUBMIT, name: 'Submit Monthly Actual', icon: FiPlus },
    { path: `${KPI_ROUTES.ACTUALS}?scope=my`, name: 'My Actual Submissions', icon: FiFileText },
    { path: `${KPI_ROUTES.TARGETS}?scope=my`, name: 'My Target Phasing', icon: FiCalendar },
    { path: KPI_ROUTES.SCORE_MY_SCORES, name: 'My Performance Scores', icon: FiAward },
    { path: KPI_ROUTES.BULK_UPLOAD, name: 'My Bulk Operations', icon: FiLayers },
    { path: KPI_ROUTES.ACTUAL_ADJUSTMENTS, name: 'Adjustment Requests', icon: FiRotateCcw },
    { path: KPI_ROUTES.ESCALATIONS, name: 'Dispute Escalations', icon: FiAlertCircle },
  ],
  kpi_management: [
    { path: KPI_ROUTES.KPI_MANAGEMENT, name: 'Organization KPIs', icon: FiTarget },
    { path: KPI_ROUTES.KPI_CREATE, name: 'Define New KPI', icon: FiPlus },
    { path: KPI_ROUTES.ADMIN_CATEGORIES, name: 'Category Tree (KRAs)', icon: FiLayers },
    { path: KPI_ROUTES.TARGETS, name: 'Annual Targets', icon: FiTrendingUp },
    { path: KPI_ROUTES.TARGET_CASCADE, name: 'Cascade Targets', icon: FiShare2 },
    { path: KPI_ROUTES.TARGET_CASCADE_RULES, name: 'Cascade Rules', icon: FiSliders },
    { path: KPI_ROUTES.BULK_UPLOAD, name: 'Bulk Import Wizard', icon: FiUpload },
  ],
  kpi_actuals_oversight: [
    { path: `${KPI_ROUTES.ACTUALS}?scope=all`, name: 'Tenant Actuals Matrix', icon: FiFileText },
    { path: KPI_ROUTES.VALIDATIONS, name: 'Validation Queue', icon: FiCheckCircle },
  ],
  kpi_analytics: [
    { path: KPI_ROUTES.ORGANIZATION_HEALTH, name: 'Organization Health', icon: FiActivity },
    { path: KPI_ROUTES.AGGREGATED_SCORES, name: 'Aggregated Scores', icon: FiBarChart2 },
    { path: KPI_ROUTES.ANALYTICS_INSIGHTS, name: 'Analytics Insights', icon: FiTrendingUp },
    { path: KPI_ROUTES.SCORE_RED_ALERTS, name: 'Red Alert KPIs', icon: FiAlertCircle },
    { path: KPI_ROUTES.REPORTS, name: 'Reports Center', icon: FiFileText },
  ],
  kpi_operations: [
    { path: KPI_ROUTES.CALCULATIONS, name: 'Score Calculations', icon: FiActivity },
    { path: KPI_ROUTES.SYSTEM_SETTINGS, name: 'KPI Subsystem Settings', icon: FiSettings },
    { path: KPI_ROUTES.AUDIT_LOGS, name: 'Audit History', icon: FiFileText },
  ],
};

export const KPI_CHAMPION_GROUP_LABELS = {
  organization_kpis: '🏛️ Organization Performance',
  kpi_management: '🎯 Indicator & Target Management',
  kpi_actuals_oversight: '📋 Actuals & Validations',
  kpi_analytics: '📊 Strategic Analytics',
  kpi_operations: '⚙️ Operations & Settings',
};

export const KPI_CHAMPION_DEFAULT_EXPANDED = {
  organization_kpis: true,
  kpi_management: true,
  kpi_actuals_oversight: false,
  kpi_analytics: true,
  kpi_operations: false,
};

// ============================================
// 4. EXECUTIVE KPI NAV GROUPS (Strategic Governance & Executive Operations - Same as Champion)
// ============================================
export const KPI_EXECUTIVE_NAV_GROUPS = {
  organization_kpis: [
    { path: `${KPI_ROUTES.KPI_MY_KPIS}?scope=my`, name: 'My Performance Indicators', icon: FiTarget },
    { path: KPI_ROUTES.ACTUAL_SUBMIT, name: 'Submit Monthly Actual', icon: FiPlus },
    { path: `${KPI_ROUTES.ACTUALS}?scope=my`, name: 'My Actual Submissions', icon: FiFileText },
    { path: `${KPI_ROUTES.TARGETS}?scope=my`, name: 'My Target Phasing', icon: FiCalendar },
    { path: KPI_ROUTES.SCORE_MY_SCORES, name: 'My Performance Scores', icon: FiAward },
    { path: KPI_ROUTES.BULK_UPLOAD, name: 'My Bulk Operations', icon: FiLayers },
    { path: KPI_ROUTES.ACTUAL_ADJUSTMENTS, name: 'Adjustment Requests', icon: FiRotateCcw },
    { path: KPI_ROUTES.ESCALATIONS, name: 'Dispute Escalations', icon: FiAlertCircle },
  ],
  kpi_management: [
    { path: KPI_ROUTES.KPI_MANAGEMENT, name: 'Organization KPIs', icon: FiTarget },
    { path: KPI_ROUTES.KPI_CREATE, name: 'Define New KPI', icon: FiPlus },
    { path: KPI_ROUTES.ADMIN_CATEGORIES, name: 'Category Tree (KRAs)', icon: FiLayers },
    { path: KPI_ROUTES.TARGETS, name: 'Annual Targets', icon: FiTrendingUp },
    { path: KPI_ROUTES.TARGET_CASCADE, name: 'Cascade Targets', icon: FiShare2 },
    { path: KPI_ROUTES.TARGET_CASCADE_RULES, name: 'Cascade Rules', icon: FiSliders },
    { path: KPI_ROUTES.BULK_UPLOAD, name: 'Bulk Import Wizard', icon: FiUpload },
  ],
  kpi_actuals_oversight: [
    { path: `${KPI_ROUTES.ACTUALS}?scope=all`, name: 'Tenant Actuals Matrix', icon: FiFileText },
    { path: KPI_ROUTES.VALIDATIONS, name: 'Validation Queue', icon: FiCheckCircle },
  ],
  kpi_analytics: [
    { path: KPI_ROUTES.ORGANIZATION_HEALTH, name: 'Organization Health', icon: FiActivity },
    { path: KPI_ROUTES.AGGREGATED_SCORES, name: 'Aggregated Scores', icon: FiBarChart2 },
    { path: KPI_ROUTES.ANALYTICS_INSIGHTS, name: 'Analytics Insights', icon: FiTrendingUp },
    { path: KPI_ROUTES.SCORE_RED_ALERTS, name: 'Red Alert KPIs', icon: FiAlertCircle },
    { path: KPI_ROUTES.REPORTS, name: 'Reports Center', icon: FiFileText },
  ],
  kpi_operations: [
    { path: KPI_ROUTES.CALCULATIONS, name: 'Score Calculations', icon: FiActivity },
    { path: KPI_ROUTES.SYSTEM_SETTINGS, name: 'KPI Subsystem Settings', icon: FiSettings },
    { path: KPI_ROUTES.AUDIT_LOGS, name: 'Audit History', icon: FiFileText },
  ],
};

export const KPI_EXECUTIVE_GROUP_LABELS = {
  organization_kpis: '🏛️ Organization Performance',
  kpi_management: '🎯 Indicator & Target Management',
  kpi_actuals_oversight: '📋 Actuals & Validations',
  kpi_analytics: '📊 Strategic Analytics',
  kpi_operations: '⚙️ Operations & Settings',
};

export const KPI_EXECUTIVE_DEFAULT_EXPANDED = {
  organization_kpis: true,
  kpi_management: true,
  kpi_actuals_oversight: false,
  kpi_analytics: true,
  kpi_operations: false,
};

// ============================================
// 5. MANAGER / SUPERVISOR KPI NAV GROUPS (Team Leader)
// ============================================
export const KPI_MANAGER_NAV_GROUPS = {
  team_kpi: [
    { path: `${KPI_ROUTES.KPI_LIST}?scope=team`, name: 'Team Performance Indicators', icon: FiTarget },
    { path: KPI_ROUTES.VALIDATIONS, name: 'Direct Report Approvals', icon: FiCheckCircle },
    { path: `${KPI_ROUTES.ACTUALS}?scope=team`, name: 'Team Actual Submissions', icon: FiFileText },
    { path: `${KPI_ROUTES.TARGETS}?scope=team`, name: 'Team Target Phasing', icon: FiTrendingUp },
    { path: KPI_ROUTES.SCORE_TEAM_SCORES, name: 'Team Scores', icon: FiUsers },
    { path: KPI_ROUTES.SCORE_RED_ALERTS, name: 'Team Red Alerts', icon: FiAlertCircle },
  ],
  my_kpi: [
    { path: `${KPI_ROUTES.KPI_MY_KPIS}?scope=my`, name: 'My KPIs', icon: FiTarget },
    { path: KPI_ROUTES.BULK_UPLOAD, name: 'My Bulk Operations', icon: FiLayers },
    { path: `${KPI_ROUTES.ACTUALS}?scope=my`, name: 'My Actual Submissions', icon: FiFileText },
    { path: `${KPI_ROUTES.TARGETS}?scope=my`, name: 'My Target Phasing', icon: FiCalendar },
    { path: KPI_ROUTES.SCORE_MY_SCORES, name: 'My Scores', icon: FiAward },
    { path: KPI_ROUTES.ACTUAL_ADJUSTMENTS, name: 'Adjustment Requests', icon: FiRotateCcw },
  ],
};

export const KPI_MANAGER_GROUP_LABELS = {
  team_kpi: '👥 Team KPI Management',
  my_kpi: '👤 My KPI Performance',
};

export const KPI_MANAGER_DEFAULT_EXPANDED = {
  team_kpi: true,
  my_kpi: false,
};

// ============================================
// 6. STAFF KPI NAV GROUPS (Individual Contributor)
// ============================================
export const KPI_STAFF_NAV_GROUPS = {
  my_kpi: [
    { path: `${KPI_ROUTES.KPI_MY_KPIS}?scope=my`, name: 'My Performance Indicators', icon: FiTarget },
    { path: KPI_ROUTES.KPI_CREATE, name: 'Create KPI', icon: FiPlus },
    { path: KPI_ROUTES.BULK_UPLOAD, name: 'My Bulk Operations', icon: FiLayers },
    { path: KPI_ROUTES.ACTUAL_SUBMIT, name: 'Submit Monthly Actual', icon: FiPlus },
    { path: `${KPI_ROUTES.ACTUALS}?scope=my`, name: 'Submission History', icon: FiClock },
    { path: `${KPI_ROUTES.TARGETS}?scope=my`, name: 'My Target Phasing', icon: FiCalendar },
    { path: KPI_ROUTES.SCORE_MY_SCORES, name: 'My Performance Scores', icon: FiAward },
    { path: KPI_ROUTES.ESCALATIONS, name: 'Dispute Escalations', icon: FiAlertCircle },
  ],
};

export const KPI_STAFF_GROUP_LABELS = {
  my_kpi: '📝 Performance & Submissions',
};

export const KPI_STAFF_DEFAULT_EXPANDED = {
  my_kpi: true,
};

// ============================================
// 7. READ-ONLY KPI NAV GROUPS (Audit / View-Only)
// ============================================
export const KPI_READ_ONLY_NAV_GROUPS = {
  kpi_views: [
    { path: KPI_ROUTES.KPI_MANAGEMENT, name: 'KPI Catalog (View)', icon: FiEye },
    { path: KPI_ROUTES.SCORES, name: 'Score Tables (View)', icon: FiBarChart2 },
    { path: KPI_ROUTES.ORGANIZATION_HEALTH, name: 'Org Health (View)', icon: FiActivity },
  ],
};

export const KPI_READ_ONLY_GROUP_LABELS = {
  kpi_views: '👁️ View-Only Performance',
};

export const KPI_READ_ONLY_DEFAULT_EXPANDED = {
  kpi_views: true,
};

// ============================================
// HELPER FUNCTION
// ============================================
export const isKpiRouteActive = (path, currentPath) => {
  if (path === currentPath) return true;
  if (path !== '/' && path !== '/kpi' && currentPath.startsWith(path)) return true;
  return false;
};

export default {
  KPI_SUPER_ADMIN_NAV_GROUPS,
  KPI_SUPER_ADMIN_GROUP_LABELS,
  KPI_SUPER_ADMIN_DEFAULT_EXPANDED,
  KPI_CLIENT_ADMIN_NAV_GROUPS,
  KPI_CLIENT_ADMIN_GROUP_LABELS,
  KPI_CLIENT_ADMIN_DEFAULT_EXPANDED,
  KPI_CHAMPION_NAV_GROUPS,
  KPI_CHAMPION_GROUP_LABELS,
  KPI_CHAMPION_DEFAULT_EXPANDED,
  KPI_EXECUTIVE_NAV_GROUPS,
  KPI_EXECUTIVE_GROUP_LABELS,
  KPI_EXECUTIVE_DEFAULT_EXPANDED,
  KPI_MANAGER_NAV_GROUPS,
  KPI_MANAGER_GROUP_LABELS,
  KPI_MANAGER_DEFAULT_EXPANDED,
  KPI_STAFF_NAV_GROUPS,
  KPI_STAFF_GROUP_LABELS,
  KPI_STAFF_DEFAULT_EXPANDED,
  KPI_READ_ONLY_NAV_GROUPS,
  KPI_READ_ONLY_GROUP_LABELS,
  KPI_READ_ONLY_DEFAULT_EXPANDED,
  isKpiRouteActive,
};
