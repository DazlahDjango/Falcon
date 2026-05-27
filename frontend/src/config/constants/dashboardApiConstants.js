// frontend/src/config/constants/dashboardApiConstants.js

const API_VERSION = 'v1'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

export const DASHBOARD_API = {
  BASE: `${API_BASE}/dashboard`,
  
  // ===================== EXECUTIVE DASHBOARD =====================
  EXECUTIVE: {
    BASE: `${API_BASE}/dashboard/executive`,
    DATA: `${API_BASE}/dashboard/executive/data`,
    DEPARTMENTS: `${API_BASE}/dashboard/executive/departments`,
    TRENDS: `${API_BASE}/dashboard/executive/trends`,
    ISSUES: `${API_BASE}/dashboard/executive/issues`,
    EXPORT: `${API_BASE}/dashboard/executive/export`,
    REFRESH: `${API_BASE}/dashboard/executive/refresh`,
    DRILL_DOWN: (userId) => `${API_BASE}/dashboard/executive/drill-down/${userId}`,
    DEPARTMENT_DETAILS: (deptId) => `${API_BASE}/dashboard/executive/departments/${deptId}`,
    KPI_DETAILS: (kpiId) => `${API_BASE}/dashboard/executive/kpis/${kpiId}`
  },
  
  // ===================== CLIENT ADMIN DASHBOARD =====================
  CLIENT_ADMIN: {
    BASE: `${API_BASE}/dashboard/client-admin`,
    DATA: `${API_BASE}/dashboard/client-admin/data`,
    COMPLIANCE: `${API_BASE}/dashboard/client-admin/compliance`,
    PENDING_APPROVALS: `${API_BASE}/dashboard/client-admin/pending-approvals`,
    MISSING_DATA: `${API_BASE}/dashboard/client-admin/missing-data`,
    USER_ACTIVITY: `${API_BASE}/dashboard/client-admin/user-activity`,
    EXPORT: `${API_BASE}/dashboard/client-admin/export`,
    REFRESH: `${API_BASE}/dashboard/client-admin/refresh`,
    KPI_BREAKDOWN: `${API_BASE}/dashboard/client-admin/kpi-breakdown`,
    TENANT_SETTINGS: `${API_BASE}/dashboard/client-admin/settings`,
    USERS_LIST: `${API_BASE}/dashboard/client-admin/users`,
    USER_DETAILS: (userId) => `${API_BASE}/dashboard/client-admin/users/${userId}`,
    ROLE_MANAGEMENT: `${API_BASE}/dashboard/client-admin/roles`
  },
  
  // ===================== SUPER ADMIN DASHBOARD =====================
  SUPER_ADMIN: {
    BASE: `${API_BASE}/dashboard/super-admin`,
    DATA: `${API_BASE}/dashboard/super-admin/data`,
    TENANTS: `${API_BASE}/dashboard/super-admin/tenants`,
    TENANT_DETAILS: (tenantId) => `${API_BASE}/dashboard/super-admin/tenants/${tenantId}`,
    REFRESH_TENANT: (tenantId) => `${API_BASE}/dashboard/super-admin/tenants/${tenantId}/refresh`,
    SYSTEM_HEALTH: `${API_BASE}/dashboard/super-admin/system-health`,
    SUBSCRIPTION_ALERTS: `${API_BASE}/dashboard/super-admin/subscription-alerts`,
    PLATFORM_METRICS: `${API_BASE}/dashboard/super-admin/platform-metrics`,
    BILLING_OVERVIEW: `${API_BASE}/dashboard/super-admin/billing`,
    EXPORT: `${API_BASE}/dashboard/super-admin/export`,
    REFRESH: `${API_BASE}/dashboard/super-admin/refresh`
  },
  
  // ===================== MANAGER DASHBOARD =====================
  MANAGER: {
    BASE: `${API_BASE}/dashboard/manager`,
    DATA: `${API_BASE}/dashboard/manager`,
    TEAM_MEMBERS: `${API_BASE}/dashboard/manager/team`,
    TEAM_SUMMARY: `${API_BASE}/dashboard/manager/team-summary`,
    APPROVE: `${API_BASE}/dashboard/manager/approve`,
    REJECT: `${API_BASE}/dashboard/manager/reject`,
    PENDING_APPROVALS: `${API_BASE}/dashboard/manager/pending`,
    DRILL_DOWN: (userId) => `${API_BASE}/dashboard/manager/user/${userId}`,
    EXPORT: `${API_BASE}/dashboard/manager/export`,
    REFRESH: `${API_BASE}/dashboard/manager/refresh`
  },

  // ===================== STAFF DASHBOARD =====================
  STAFF: {
    BASE: `${API_BASE}/dashboard/staff`,
    DATA: `${API_BASE}/dashboard/staff`,
    SUBMIT_KPI: `${API_BASE}/dashboard/staff/submit`,
    PENDING_SUBMISSIONS: `${API_BASE}/dashboard/staff/pending`,
    MISSION_STATUS: `${API_BASE}/dashboard/staff/mission-status`,
    TASKS: `${API_BASE}/dashboard/staff/tasks`,
    EXPORT: `${API_BASE}/dashboard/staff/export`,
    REFRESH: `${API_BASE}/dashboard/staff/refresh`
  },

  // ===================== CHAMPION DASHBOARD =====================
  CHAMPION: {
    BASE: `${API_BASE}/dashboard/champion`,
    DATA: `${API_BASE}/dashboard/champion`,
    EDITABLE_DASHBOARD: (userId) => `${API_BASE}/dashboard/champion/user/${userId}`,
    UPDATE_CONFIG: `${API_BASE}/dashboard/champion/update`,
    AVAILABLE_KPIS: (userId) => `${API_BASE}/dashboard/champion/user/${userId}/available-kpis`,
    ASSIGNED_KPIS: (userId) => `${API_BASE}/dashboard/champion/user/${userId}/assigned-kpis`,
    TEMPLATES: `${API_BASE}/dashboard/champion/templates`,
    APPLY_TEMPLATE: (templateId) => `${API_BASE}/dashboard/champion/templates/${templateId}/apply`,
    EXPORT: `${API_BASE}/dashboard/champion/export`,
    REFRESH: `${API_BASE}/dashboard/champion/refresh`
  },

  // ===================== READ-ONLY DASHBOARD =====================
  READ_ONLY: {
    BASE: `${API_BASE}/dashboard/read-only`,
    DATA: `${API_BASE}/dashboard/read-only`,
    EXPORT: `${API_BASE}/dashboard/read-only/export`,
    REFRESH: `${API_BASE}/dashboard/read-only/refresh`
  },

  // ===================== DRILL-DOWN API =====================
  DRILL_DOWN: {
    BASE: `${API_BASE}/dashboard/drill-down`,
    USER: (userId) => `${API_BASE}/dashboard/drill-down/${userId}`,
    TEAM: (userId) => `${API_BASE}/dashboard/drill-down/${userId}/team`
  },
  
  // ===================== HIERARCHY =====================
  HIERARCHY: {
    BASE: `${API_BASE}/dashboard/hierarchy`,
    TEAM: `${API_BASE}/dashboard/hierarchy/team`,
    TEAM_AGGREGATE: `${API_BASE}/dashboard/hierarchy/team-aggregate`,
    DRILL_DOWN: (userId) => `${API_BASE}/dashboard/hierarchy/drill-down/${userId}`,
    ORG_TREE: `${API_BASE}/dashboard/hierarchy/org-tree`,
    REPORTING_CHAIN: `${API_BASE}/dashboard/hierarchy/reporting-chain`,
    TEAM_MEMBERS: (userId) => `${API_BASE}/dashboard/hierarchy/team/${userId}`
  },
  
  // ===================== DASHBOARD CONFIGURATIONS =====================
  CONFIGS: {
    BASE: `${API_BASE}/dashboard/configs`,
    LIST: `${API_BASE}/dashboard/configs`,
    DETAIL: (id) => `${API_BASE}/dashboard/configs/${id}`,
    DEFAULT: (dashboardType) => `${API_BASE}/dashboard/configs/default/${dashboardType}`,
    CLONE: (id) => `${API_BASE}/dashboard/configs/${id}/clone`,
    SET_DEFAULT: (id) => `${API_BASE}/dashboard/configs/${id}/set-default`
  },
  
  // ===================== WIDGETS =====================
  WIDGETS: {
    BASE: `${API_BASE}/dashboard/widgets`,
    LIST: `${API_BASE}/dashboard/widgets`,
    DETAIL: (id) => `${API_BASE}/dashboard/widgets/${id}`,
    BY_DASHBOARD: (dashboardId) => `${API_BASE}/dashboard/widgets/by-dashboard/${dashboardId}`,
    BULK_POSITION: `${API_BASE}/dashboard/widgets/bulk-position`
  },
  
  // ===================== FAVORITES =====================
  FAVORITES: {
    BASE: `${API_BASE}/dashboard/favorites`,
    LIST: `${API_BASE}/dashboard/favorites`,
    DETAIL: (id) => `${API_BASE}/dashboard/favorites/${id}`,
    REORDER: `${API_BASE}/dashboard/favorites/reorder`
  },
  
  // ===================== ALERTS =====================
  ALERTS: {
    BASE: `${API_BASE}/dashboard/alerts`,
    LIST: `${API_BASE}/dashboard/alerts`,
    DETAIL: (id) => `${API_BASE}/dashboard/alerts/${id}`,
    SUPPRESS: (id) => `${API_BASE}/dashboard/alerts/${id}/suppress`,
    TRIGGER: (id) => `${API_BASE}/dashboard/alerts/${id}/trigger`
  },
  
  // ===================== EXPORTS =====================
  EXPORTS: {
    BASE: `${API_BASE}/dashboard/exports`,
    LIST: `${API_BASE}/dashboard/exports`,
    DETAIL: (id) => `${API_BASE}/dashboard/exports/${id}`,
    TRIGGER: (id) => `${API_BASE}/dashboard/exports/${id}/trigger`,
    DOWNLOAD: (id) => `${API_BASE}/dashboard/exports/${id}/download`,
    HISTORY: `${API_BASE}/dashboard/exports/history`
  },
  
  // ===================== COMPARISONS =====================
  COMPARISONS: {
    BASE: `${API_BASE}/dashboard/comparisons`,
    LIST: `${API_BASE}/dashboard/comparisons`,
    DETAIL: (id) => `${API_BASE}/dashboard/comparisons/${id}`,
    CALCULATE: (id) => `${API_BASE}/dashboard/comparisons/${id}/calculate`
  },
  
  // ===================== VIEW PRESETS =====================
  VIEW_PRESETS: {
    BASE: `${API_BASE}/dashboard/view-presets`,
    LIST: `${API_BASE}/dashboard/view-presets`,
    DETAIL: (id) => `${API_BASE}/dashboard/view-presets/${id}`,
    SET_DEFAULT: (id) => `${API_BASE}/dashboard/view-presets/${id}/set-default`
  }
}

export const WEBSOCKET_PATHS = {
  DASHBOARD: (dashboardType) => `${WS_BASE}/dashboard/${dashboardType}`,
  NOTIFICATIONS: `${WS_BASE}/notifications`
}

export const DASHBOARD_QUERY_KEYS = {
  EXECUTIVE_DATA: 'executiveDashboardData',
  CLIENT_ADMIN_DATA: 'clientAdminDashboardData',
  SUPER_ADMIN_DATA: 'superAdminDashboardData',
  MANAGER_DATA: 'managerDashboardData',
  STAFF_DATA: 'staffDashboardData',
  CHAMPION_DATA: 'championDashboardData',
  READ_ONLY_DATA: 'readOnlyDashboardData',
  TEAM_DATA: 'teamData',
  TEAM_AGGREGATE: 'teamAggregate',
  ORG_TREE: 'orgTree',
  REPORTING_CHAIN: 'reportingChain',
  DASHBOARD_CONFIGS: 'dashboardConfigs',
  WIDGETS: 'widgets',
  FAVORITES: 'favorites',
  ALERTS: 'alerts',
  EXPORTS: 'exports',
  COMPARISONS: 'comparisons',
  VIEW_PRESETS: 'viewPresets',
  TENANT_DETAILS: 'tenantDetails',
  TENANTS_LIST: 'tenantsList'
}

export const DASHBOARD_MUTATION_KEYS = {
  CREATE_CONFIG: 'createDashboardConfig',
  UPDATE_CONFIG: 'updateDashboardConfig',
  DELETE_CONFIG: 'deleteDashboardConfig',
  CLONE_CONFIG: 'cloneDashboardConfig',
  SET_DEFAULT_CONFIG: 'setDefaultDashboardConfig',
  CREATE_WIDGET: 'createWidget',
  UPDATE_WIDGET: 'updateWidget',
  DELETE_WIDGET: 'deleteWidget',
  BULK_UPDATE_WIDGETS: 'bulkUpdateWidgets',
  ADD_FAVORITE: 'addFavorite',
  REMOVE_FAVORITE: 'removeFavorite',
  REORDER_FAVORITES: 'reorderFavorites',
  CREATE_ALERT: 'createAlert',
  UPDATE_ALERT: 'updateAlert',
  DELETE_ALERT: 'deleteAlert',
  SUPPRESS_ALERT: 'suppressAlert',
  CREATE_EXPORT: 'createExport',
  UPDATE_EXPORT: 'updateExport',
  DELETE_EXPORT: 'deleteExport',
  TRIGGER_EXPORT: 'triggerExport',
  CREATE_COMPARISON: 'createComparison',
  UPDATE_COMPARISON: 'updateComparison',
  DELETE_COMPARISON: 'deleteComparison',
  CALCULATE_COMPARISON: 'calculateComparison',
  CREATE_PRESET: 'createViewPreset',
  UPDATE_PRESET: 'updateViewPreset',
  DELETE_PRESET: 'deleteViewPreset',
  SET_DEFAULT_PRESET: 'setDefaultPreset',
  REFRESH_DASHBOARD: 'refreshDashboard',
  REFRESH_TENANT: 'refreshTenant',
  SUBMIT_KPI: 'submitKpi',
  APPROVE_SUBMISSION: 'approveSubmission',
  REJECT_SUBMISSION: 'rejectSubmission',
  UPDATE_CHAMPION_CONFIG: 'updateChampionConfig'
}

export const DASHBOARD_ENDPOINTS = {
  executive: DASHBOARD_API.EXECUTIVE,
  clientAdmin: DASHBOARD_API.CLIENT_ADMIN,
  superAdmin: DASHBOARD_API.SUPER_ADMIN,
  manager: DASHBOARD_API.MANAGER,
  staff: DASHBOARD_API.STAFF,
  champion: DASHBOARD_API.CHAMPION,
  readOnly: DASHBOARD_API.READ_ONLY,
  drillDown: DASHBOARD_API.DRILL_DOWN,
  hierarchy: DASHBOARD_API.HIERARCHY,
  configs: DASHBOARD_API.CONFIGS,
  widgets: DASHBOARD_API.WIDGETS,
  favorites: DASHBOARD_API.FAVORITES,
  alerts: DASHBOARD_API.ALERTS,
  exports: DASHBOARD_API.EXPORTS,
  comparisons: DASHBOARD_API.COMPARISONS,
  viewPresets: DASHBOARD_API.VIEW_PRESETS
}