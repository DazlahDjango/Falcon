// frontend/src/config/constants/dashboardRouteConstants.js

import { DASHBOARD_TYPES } from './dashboardConstants'

// ===================== DASHBOARD ROUTES =====================

export const DASHBOARD_ROUTES = {
  // Base
  DASHBOARD: '/dashboard',
  
  // ===================== EXECUTIVE DASHBOARD ROUTES =====================
  EXECUTIVE: {
    BASE: '/dashboard/executive',
    OVERVIEW: '/dashboard/executive/overview',
    DEPARTMENTS: '/dashboard/executive/departments',
    TEAM: '/dashboard/executive/team',
    TRENDS: '/dashboard/executive/trends',
    COMPARISONS: '/dashboard/executive/comparisons',
    ALERTS: '/dashboard/executive/alerts',
    REPORTS: '/dashboard/executive/reports',
    EXPORTS: '/dashboard/executive/exports',
    SETTINGS: '/dashboard/executive/settings',
    DRILL_DOWN: (userId) => `/dashboard/executive/drill-down/${userId}`,
    DEPARTMENT_DETAILS: (deptId) => `/dashboard/executive/departments/${deptId}`
  },
  
  // ===================== CLIENT ADMIN DASHBOARD ROUTES =====================
  CLIENT_ADMIN: {
    BASE: '/dashboard/client-admin',
    OVERVIEW: '/dashboard/client-admin/overview',
    TENANT: '/dashboard/client-admin/tenant',
    COMPLIANCE: '/dashboard/client-admin/compliance',
    APPROVALS: '/dashboard/client-admin/approvals',
    MISSING_DATA: '/dashboard/client-admin/missing-data',
    KPI_BREAKDOWN: '/dashboard/client-admin/kpi-breakdown',
    USER_ACTIVITY: '/dashboard/client-admin/user-activity',
    USERS: '/dashboard/client-admin/users',
    ROLES: '/dashboard/client-admin/roles',
    REPORTS: '/dashboard/client-admin/reports',
    EXPORTS: '/dashboard/client-admin/exports',
    SETTINGS: '/dashboard/client-admin/settings',
    AUDIT_LOGS: '/dashboard/client-admin/audit-logs',
    USER_DETAILS: (userId) => `/dashboard/client-admin/users/${userId}`,
    ROLE_DETAILS: (roleId) => `/dashboard/client-admin/roles/${roleId}`
  },
  
  // ===================== SUPER ADMIN DASHBOARD ROUTES =====================
  SUPER_ADMIN: {
    BASE: '/dashboard/super-admin',
    OVERVIEW: '/dashboard/super-admin/overview',
    CUSTOM_OVERVIEW: '/dashboard/super-admin/custom-overview',
    TENANTS: '/dashboard/super-admin/tenants',
    SYSTEM_HEALTH: '/dashboard/super-admin/system-health',
    SUBSCRIPTIONS: '/dashboard/super-admin/subscriptions',
    BILLING: '/dashboard/super-admin/billing',
    PLATFORM_METRICS: '/dashboard/super-admin/platform-metrics',
    AUDIT_LOGS: '/dashboard/super-admin/audit-logs',
    REPORTS: '/dashboard/super-admin/reports',
    EXPORTS: '/dashboard/super-admin/exports',
    SETTINGS: '/dashboard/super-admin/settings',
    TENANT_DETAILS: (tenantId) => `/dashboard/super-admin/tenants/${tenantId}`,
    SUBSCRIPTION_DETAILS: (subId) => `/dashboard/super-admin/subscriptions/${subId}`
  },
  
  // ===================== MANAGER DASHBOARD ROUTES =====================
  MANAGER: {
    BASE: '/dashboard/manager',
    OVERVIEW: '/dashboard/manager/overview',
    TEAM: '/dashboard/manager/team',
    APPROVALS: '/dashboard/manager/approvals',
    TEAM_MEMBER: (userId) => `/dashboard/manager/team/${userId}`,
    APPROVAL_DETAILS: (submissionId) => `/dashboard/manager/approvals/${submissionId}`,
    REPORTS: '/dashboard/manager/reports',
    EXPORTS: '/dashboard/manager/exports'
  },

  // ===================== STAFF DASHBOARD ROUTES =====================
  STAFF: {
    BASE: '/dashboard/staff',
    OVERVIEW: '/dashboard/staff/overview',
    KPIS: '/dashboard/staff/kpis',
    MISSION_STATUS: '/dashboard/staff/mission-status',
    TASKS: '/dashboard/staff/tasks',
    SUBMISSIONS: '/dashboard/staff/submissions',
    HISTORY: '/dashboard/staff/history',
    KPI_DETAILS: (kpiId) => `/dashboard/staff/kpis/${kpiId}`
  },

  // ===================== CHAMPION DASHBOARD ROUTES =====================
  CHAMPION: {
    BASE: '/dashboard/champion',
    OVERVIEW: '/dashboard/champion/overview',
    EDIT_DASHBOARD: (userId) => `/dashboard/champion/edit/${userId}`,
    TEMPLATES: '/dashboard/champion/templates',
    TEMPLATE_DETAILS: (templateId) => `/dashboard/champion/templates/${templateId}`,
    CREATE_TEMPLATE: '/dashboard/champion/templates/create',
    BULK_ASSIGN: '/dashboard/champion/bulk-assign',
    CONFIGURATION: '/dashboard/champion/configuration'
  },

  // ===================== READ-ONLY DASHBOARD ROUTES =====================
  READ_ONLY: {
    BASE: '/dashboard/read-only',
    OVERVIEW: '/dashboard/read-only/overview',
    EXECUTIVE_VIEW: '/dashboard/read-only/executive',
    MANAGER_VIEW: '/dashboard/read-only/manager',
    STAFF_VIEW: '/dashboard/read-only/staff',
    EXPORTS: '/dashboard/read-only/exports'
  },

  // ===================== DRILL-DOWN ROUTES =====================
  DRILL_DOWN: {
    BASE: '/dashboard/drill-down',
    USER: (userId) => `/dashboard/drill-down/user/${userId}`,
    TEAM: (userId) => `/dashboard/drill-down/team/${userId}`,
    HIERARCHY: (userId) => `/dashboard/drill-down/hierarchy/${userId}`
  },
  
  // ===================== SHARED ROUTES =====================
  NOTIFICATIONS: '/dashboard/notifications',
  PROFILE: '/dashboard/profile',
  HELP: '/dashboard/help'
}

// ===================== DASHBOARD BREADCRUMBS =====================

export const DASHBOARD_BREADCRUMBS = {
  // Executive
  [DASHBOARD_ROUTES.EXECUTIVE.OVERVIEW]: ['Dashboard', 'Executive', 'Overview'],
  [DASHBOARD_ROUTES.EXECUTIVE.DEPARTMENTS]: ['Dashboard', 'Executive', 'Departments'],
  [DASHBOARD_ROUTES.EXECUTIVE.TEAM]: ['Dashboard', 'Executive', 'Organization'],
  [DASHBOARD_ROUTES.EXECUTIVE.TRENDS]: ['Dashboard', 'Executive', 'KPIs & Trends'],
  [DASHBOARD_ROUTES.EXECUTIVE.COMPARISONS]: ['Dashboard', 'Executive', 'Comparisons'],
  [DASHBOARD_ROUTES.EXECUTIVE.ALERTS]: ['Dashboard', 'Executive', 'Alerts'],
  [DASHBOARD_ROUTES.EXECUTIVE.REPORTS]: ['Dashboard', 'Executive', 'Reports'],
  
  // Client Admin
  [DASHBOARD_ROUTES.CLIENT_ADMIN.OVERVIEW]: ['Dashboard', 'Client Admin', 'Overview'],
  [DASHBOARD_ROUTES.CLIENT_ADMIN.TENANT]: ['Dashboard', 'Client Admin', 'Tenant'],
  [DASHBOARD_ROUTES.CLIENT_ADMIN.COMPLIANCE]: ['Dashboard', 'Client Admin', 'Compliance'],
  [DASHBOARD_ROUTES.CLIENT_ADMIN.APPROVALS]: ['Dashboard', 'Client Admin', 'Approvals'],
  [DASHBOARD_ROUTES.CLIENT_ADMIN.USERS]: ['Dashboard', 'Client Admin', 'Users'],
  
  // Super Admin
  [DASHBOARD_ROUTES.SUPER_ADMIN.OVERVIEW]: ['Dashboard', 'Super Admin', 'Overview'],
  [DASHBOARD_ROUTES.SUPER_ADMIN.CUSTOM_OVERVIEW]: ['Dashboard', 'Super Admin', 'Custom Overview'],
  [DASHBOARD_ROUTES.SUPER_ADMIN.TENANTS]: ['Dashboard', 'Super Admin', 'Tenants'],
  [DASHBOARD_ROUTES.SUPER_ADMIN.SYSTEM_HEALTH]: ['Dashboard', 'Super Admin', 'System Health'],
  [DASHBOARD_ROUTES.SUPER_ADMIN.BILLING]: ['Dashboard', 'Super Admin', 'Billing'],
  
  // Manager
  [DASHBOARD_ROUTES.MANAGER.OVERVIEW]: ['Dashboard', 'Manager', 'Overview'],
  [DASHBOARD_ROUTES.MANAGER.TEAM]: ['Dashboard', 'Manager', 'Team'],
  [DASHBOARD_ROUTES.MANAGER.APPROVALS]: ['Dashboard', 'Manager', 'Approvals'],

  // Staff
  [DASHBOARD_ROUTES.STAFF.OVERVIEW]: ['Dashboard', 'My Dashboard', 'Overview'],
  [DASHBOARD_ROUTES.STAFF.KPIS]: ['Dashboard', 'My Dashboard', 'KPIs'],
  [DASHBOARD_ROUTES.STAFF.MISSION_STATUS]: ['Dashboard', 'My Dashboard', 'Mission Status'],

  // Champion
  [DASHBOARD_ROUTES.CHAMPION.OVERVIEW]: ['Dashboard', 'Champion', 'Overview'],
  [DASHBOARD_ROUTES.CHAMPION.TEMPLATES]: ['Dashboard', 'Champion', 'Templates'],

  // Read-Only
  [DASHBOARD_ROUTES.READ_ONLY.OVERVIEW]: ['Dashboard', 'Read-Only', 'Overview'],
  [DASHBOARD_ROUTES.READ_ONLY.EXECUTIVE_VIEW]: ['Dashboard', 'Read-Only', 'Executive View']
}

// ===================== DASHBOARD NAVIGATION ITEMS =====================

export const DASHBOARD_NAV_ITEMS = {
  EXECUTIVE: [
    { path: DASHBOARD_ROUTES.EXECUTIVE.OVERVIEW, label: 'Overview', icon: 'DashboardIcon', end: true },
    { path: DASHBOARD_ROUTES.EXECUTIVE.DEPARTMENTS, label: 'Departments', icon: 'DepartmentIcon' },
    { path: DASHBOARD_ROUTES.EXECUTIVE.TEAM, label: 'Organization', icon: 'TeamIcon' },
    { path: DASHBOARD_ROUTES.EXECUTIVE.TRENDS, label: 'KPIs & Trends', icon: 'TrendingUpIcon' },
    { path: DASHBOARD_ROUTES.EXECUTIVE.COMPARISONS, label: 'Comparisons', icon: 'CompareIcon' },
    { path: DASHBOARD_ROUTES.EXECUTIVE.ALERTS, label: 'Alerts', icon: 'AlertIcon' },
    { path: DASHBOARD_ROUTES.EXECUTIVE.REPORTS, label: 'Reports', icon: 'ReportIcon' },
    { path: DASHBOARD_ROUTES.EXECUTIVE.EXPORTS, label: 'Exports', icon: 'ExportIcon' }
  ],
  
  CLIENT_ADMIN: [
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.OVERVIEW, label: 'Overview', icon: 'DashboardIcon', end: true },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.TENANT, label: 'Tenant Overview', icon: 'TenantIcon' },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.COMPLIANCE, label: 'Compliance', icon: 'CheckCircleIcon' },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.APPROVALS, label: 'Approvals', icon: 'PendingIcon' },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.MISSING_DATA, label: 'Missing Data', icon: 'WarningIcon' },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.KPI_BREAKDOWN, label: 'KPI Breakdown', icon: 'KpiIcon' },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.USERS, label: 'Users', icon: 'UsersIcon' },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.REPORTS, label: 'Reports', icon: 'ReportIcon' },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.AUDIT_LOGS, label: 'Audit Logs', icon: 'AuditIcon' },
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.SETTINGS, label: 'Settings', icon: 'SettingsIcon' }
  ],
  
  SUPER_ADMIN: [
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.OVERVIEW, label: 'Overview', icon: 'DashboardIcon', end: true },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.CUSTOM_OVERVIEW, label: 'Custom Overview', icon: 'DashboardIcon' },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.TENANTS, label: 'Tenants', icon: 'TenantsIcon' },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.SYSTEM_HEALTH, label: 'System Health', icon: 'HealthIcon' },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.SUBSCRIPTIONS, label: 'Subscriptions', icon: 'SubscriptionIcon' },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.BILLING, label: 'Billing', icon: 'BillingIcon' },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.PLATFORM_METRICS, label: 'Platform Metrics', icon: 'MetricsIcon' },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.AUDIT_LOGS, label: 'Audit Logs', icon: 'AuditIcon' },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.REPORTS, label: 'Reports', icon: 'ReportIcon' },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.SETTINGS, label: 'Settings', icon: 'SettingsIcon' }
  ],
  
  MANAGER: [
    { path: DASHBOARD_ROUTES.MANAGER.OVERVIEW, label: 'Overview', icon: 'DashboardIcon', end: true },
    { path: DASHBOARD_ROUTES.MANAGER.TEAM, label: 'My Team', icon: 'TeamIcon' },
    { path: DASHBOARD_ROUTES.MANAGER.APPROVALS, label: 'Approvals', icon: 'PendingIcon' },
    { path: DASHBOARD_ROUTES.MANAGER.REPORTS, label: 'Reports', icon: 'ReportIcon' }
  ],

  STAFF: [
    { path: DASHBOARD_ROUTES.STAFF.OVERVIEW, label: 'Overview', icon: 'DashboardIcon', end: true },
    { path: DASHBOARD_ROUTES.STAFF.KPIS, label: 'My KPIs', icon: 'KpiIcon' },
    { path: DASHBOARD_ROUTES.STAFF.MISSION_STATUS, label: 'Mission Status', icon: 'MissionIcon' },
    { path: DASHBOARD_ROUTES.STAFF.TASKS, label: 'Tasks', icon: 'TaskIcon' },
    { path: DASHBOARD_ROUTES.STAFF.HISTORY, label: 'History', icon: 'HistoryIcon' }
  ],

  CHAMPION: [
    { path: DASHBOARD_ROUTES.CHAMPION.OVERVIEW, label: 'Overview', icon: 'DashboardIcon', end: true },
    { path: DASHBOARD_ROUTES.CHAMPION.TEMPLATES, label: 'Templates', icon: 'TemplateIcon' },
    { path: DASHBOARD_ROUTES.CHAMPION.CONFIGURATION, label: 'Configuration', icon: 'SettingsIcon' }
  ],

  READ_ONLY: [
    { path: DASHBOARD_ROUTES.READ_ONLY.OVERVIEW, label: 'Overview', icon: 'DashboardIcon', end: true },
    { path: DASHBOARD_ROUTES.READ_ONLY.EXECUTIVE_VIEW, label: 'Executive View', icon: 'ExecutiveIcon' },
    { path: DASHBOARD_ROUTES.READ_ONLY.MANAGER_VIEW, label: 'Manager View', icon: 'ManagerIcon' },
    { path: DASHBOARD_ROUTES.READ_ONLY.STAFF_VIEW, label: 'Staff View', icon: 'StaffIcon' }
  ]
}

// ===================== HELPER FUNCTIONS =====================

export const getDashboardRoutesByRole = (role) => {
  switch (role) {
    case 'executive':
      return DASHBOARD_ROUTES.EXECUTIVE
    case 'client_admin':
      return DASHBOARD_ROUTES.CLIENT_ADMIN
    case 'super_admin':
      return DASHBOARD_ROUTES.SUPER_ADMIN
    case 'manager':
    case 'supervisor':
      return DASHBOARD_ROUTES.MANAGER
    case 'staff':
      return DASHBOARD_ROUTES.STAFF
    case 'dashboard_champion':
      return DASHBOARD_ROUTES.CHAMPION
    case 'read_only':
      return DASHBOARD_ROUTES.READ_ONLY
    default:
      return DASHBOARD_ROUTES.STAFF
  }
}

export const getNavItemsByRole = (role) => {
  switch (role) {
    case 'executive':
      return DASHBOARD_NAV_ITEMS.EXECUTIVE
    case 'client_admin':
      return DASHBOARD_NAV_ITEMS.CLIENT_ADMIN
    case 'super_admin':
      return DASHBOARD_NAV_ITEMS.SUPER_ADMIN
    case 'manager':
    case 'supervisor':
      return DASHBOARD_NAV_ITEMS.MANAGER
    case 'staff':
      return DASHBOARD_NAV_ITEMS.STAFF
    case 'dashboard_champion':
      return DASHBOARD_NAV_ITEMS.CHAMPION
    case 'read_only':
      return DASHBOARD_NAV_ITEMS.READ_ONLY
    default:
      return DASHBOARD_NAV_ITEMS.STAFF
  }
}

export const getDefaultRouteByRole = (role) => {
  const routes = getDashboardRoutesByRole(role)
  return routes.OVERVIEW || routes.BASE
}