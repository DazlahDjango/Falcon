export const DASHBOARD_ROUTES = {
  // Base
  DASHBOARD: '/dashboard',
  
  // Executive Dashboard Routes
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
  
  // Client Admin Dashboard Routes
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
  
  // Super Admin Dashboard Routes
  SUPER_ADMIN: {
    BASE: '/dashboard/super-admin',
    OVERVIEW: '/dashboard/super-admin/overview',
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
  
  // Shared Routes
  NOTIFICATIONS: '/dashboard/notifications',
  PROFILE: '/dashboard/profile',
  HELP: '/dashboard/help'
}

export const DASHBOARD_BREADCRUMBS = {
  [DASHBOARD_ROUTES.EXECUTIVE.OVERVIEW]: ['Dashboard', 'Executive', 'Overview'],
  [DASHBOARD_ROUTES.EXECUTIVE.DEPARTMENTS]: ['Dashboard', 'Executive', 'Departments'],
  [DASHBOARD_ROUTES.EXECUTIVE.TEAM]: ['Dashboard', 'Executive', 'Organization'],
  [DASHBOARD_ROUTES.EXECUTIVE.TRENDS]: ['Dashboard', 'Executive', 'KPIs & Trends'],
  [DASHBOARD_ROUTES.EXECUTIVE.COMPARISONS]: ['Dashboard', 'Executive', 'Comparisons'],
  [DASHBOARD_ROUTES.EXECUTIVE.ALERTS]: ['Dashboard', 'Executive', 'Alerts'],
  [DASHBOARD_ROUTES.EXECUTIVE.REPORTS]: ['Dashboard', 'Executive', 'Reports'],
  
  [DASHBOARD_ROUTES.CLIENT_ADMIN.OVERVIEW]: ['Dashboard', 'Client Admin', 'Overview'],
  [DASHBOARD_ROUTES.CLIENT_ADMIN.TENANT]: ['Dashboard', 'Client Admin', 'Tenant'],
  [DASHBOARD_ROUTES.CLIENT_ADMIN.COMPLIANCE]: ['Dashboard', 'Client Admin', 'Compliance'],
  [DASHBOARD_ROUTES.CLIENT_ADMIN.APPROVALS]: ['Dashboard', 'Client Admin', 'Approvals'],
  [DASHBOARD_ROUTES.CLIENT_ADMIN.USERS]: ['Dashboard', 'Client Admin', 'Users'],
  
  [DASHBOARD_ROUTES.SUPER_ADMIN.OVERVIEW]: ['Dashboard', 'Super Admin', 'Overview'],
  [DASHBOARD_ROUTES.SUPER_ADMIN.TENANTS]: ['Dashboard', 'Super Admin', 'Tenants'],
  [DASHBOARD_ROUTES.SUPER_ADMIN.SYSTEM_HEALTH]: ['Dashboard', 'Super Admin', 'System Health'],
  [DASHBOARD_ROUTES.SUPER_ADMIN.BILLING]: ['Dashboard', 'Super Admin', 'Billing']
}

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
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.TENANTS, label: 'Tenants', icon: 'TenantsIcon' },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.SYSTEM_HEALTH, label: 'System Health', icon: 'HealthIcon' },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.SUBSCRIPTIONS, label: 'Subscriptions', icon: 'SubscriptionIcon' },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.BILLING, label: 'Billing', icon: 'BillingIcon' },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.PLATFORM_METRICS, label: 'Platform Metrics', icon: 'MetricsIcon' },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.AUDIT_LOGS, label: 'Audit Logs', icon: 'AuditIcon' },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.REPORTS, label: 'Reports', icon: 'ReportIcon' },
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.SETTINGS, label: 'Settings', icon: 'SettingsIcon' }
  ]
}

export const getDashboardRoutesByRole = (role) => {
  switch (role) {
    case 'executive':
      return DASHBOARD_ROUTES.EXECUTIVE
    case 'client_admin':
      return DASHBOARD_ROUTES.CLIENT_ADMIN
    case 'super_admin':
      return DASHBOARD_ROUTES.SUPER_ADMIN
    default:
      return DASHBOARD_ROUTES.EXECUTIVE
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
    default:
      return DASHBOARD_NAV_ITEMS.EXECUTIVE
  }
}