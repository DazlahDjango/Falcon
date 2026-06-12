// frontend/src/routes/dashboard.routes.js
import React from 'react';
import { DASHBOARD_ROUTES } from '../config/constants/dashboardRouteConstants';
import { DashboardShell } from '../components/dashboard/common/DashboardShell';
import DashboardIndexRedirect from '../components/dashboard/common/DashboardIndexRedirect';

// ============================================
// DEBUG HELPER
// ============================================
const debugLazy = (importFn, componentName) => {
  return React.lazy(() => {
    console.log(`🔄 [DEBUG] Attempting to load: ${componentName}`);

    return importFn()
      .then(module => {
        console.log(`✅ [DEBUG] Module loaded for: ${componentName}`);
        console.log(`📦 [DEBUG] Available exports:`, Object.keys(module));

        // Try named export first, then default
        const Component = module[componentName] || module.default;

        if (!Component) {
          console.error(`❌ [DEBUG] Component "${componentName}" not found!`);
          throw new Error(`${componentName} export not found. Available: ${Object.keys(module).join(', ')}`);
        }

        return { default: Component };
      })
      .catch(error => {
        console.error(`❌ [DEBUG] Failed to load ${componentName}:`, error);
        return {
          default: () => (
            <div style={{ padding: '20px', color: 'red', border: '1px solid red', margin: '20px' }}>
              <h3>Failed to load {componentName}</h3>
              <pre>{error.message}</pre>
            </div>
          )
        };
      });
  });
};

// ============================================
// SUPER ADMIN COMPONENTS
// ============================================
const SuperAdminDashboard = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminDashboard'
);
const SuperAdminDashboardCustom = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminDashboardCustom'
);
const SuperAdminTenants = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminTenants'
);
const SuperAdminSystemHealth = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminSystemHealth'
);
const SuperAdminSubscriptions = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminSubscriptions'
);
const SuperAdminBilling = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminBilling'
);
const SuperAdminPlatformMetrics = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminPlatformMetrics'
);
const SuperAdminAuditLogs = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminAuditLogs'
);
const SuperAdminReports = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminReports'
);
const SuperAdminExports = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminExports'
);
const SuperAdminSettings = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminSettings'
);

// ============================================
// CLIENT ADMIN COMPONENTS
// ============================================
const ClientAdminOverview = debugLazy(
  () => import('../pages/dashboard'),
  'ClientAdminOverview'
);
const ClientAdminTenant = debugLazy(
  () => import('../pages/dashboard'),
  'ClientAdminTenant'
);
const ClientAdminCompliance = debugLazy(
  () => import('../pages/dashboard'),
  'ClientAdminCompliance'
);
const ClientAdminApprovals = debugLazy(
  () => import('../pages/dashboard'),
  'ClientAdminApprovals'
);
const ClientAdminMissingData = debugLazy(
  () => import('../pages/dashboard'),
  'ClientAdminMissingData'
);
const ClientAdminKpiBreakdown = debugLazy(
  () => import('../pages/dashboard'),
  'ClientAdminKpiBreakdown'
);
const ClientAdminUsers = debugLazy(
  () => import('../pages/dashboard'),
  'ClientAdminUsers'
);
const ClientAdminRoles = debugLazy(
  () => import('../pages/dashboard'),
  'ClientAdminRoles'
);
const ClientAdminReports = debugLazy(
  () => import('../pages/dashboard'),
  'ClientAdminReports'
);
const ClientAdminExports = debugLazy(
  () => import('../pages/dashboard'),
  'ClientAdminExports'
);
const ClientAdminSettings = debugLazy(
  () => import('../pages/dashboard'),
  'ClientAdminSettings'
);
const ClientAdminAuditLogs = debugLazy(
  () => import('../pages/dashboard'),
  'ClientAdminAuditLogs'
);

// ============================================
// EXECUTIVE COMPONENTS
// ============================================
const ExecutiveOverview = debugLazy(
  () => import('../pages/dashboard'),
  'ExecutiveOverview'
);
const ExecutiveDepartments = debugLazy(
  () => import('../pages/dashboard'),
  'ExecutiveDepartments'
);
const ExecutiveTeam = debugLazy(
  () => import('../pages/dashboard'),
  'ExecutiveTeam'
);
const ExecutiveTrends = debugLazy(
  () => import('../pages/dashboard'),
  'ExecutiveTrends'
);
const ExecutiveComparisons = debugLazy(
  () => import('../pages/dashboard'),
  'ExecutiveComparisons'
);
const ExecutiveAlerts = debugLazy(
  () => import('../pages/dashboard'),
  'ExecutiveAlerts'
);
const ExecutiveReports = debugLazy(
  () => import('../pages/dashboard'),
  'ExecutiveReports'
);
const ExecutiveExports = debugLazy(
  () => import('../pages/dashboard'),
  'ExecutiveExports'
);

// ============================================
// MANAGER COMPONENTS
// ============================================
const ManagerOverview = debugLazy(
  () => import('../pages/dashboard'),
  'ManagerOverview'
);
const ManagerTeam = debugLazy(
  () => import('../pages/dashboard'),
  'ManagerTeam'
);
const ManagerApprovals = debugLazy(
  () => import('../pages/dashboard'),
  'ManagerApprovals'
);
const ManagerReports = debugLazy(
  () => import('../pages/dashboard'),
  'ManagerReports'
);

// ============================================
// STAFF COMPONENTS
// ============================================
const StaffOverview = debugLazy(
  () => import('../pages/dashboard'),
  'StaffOverview'
);
const StaffKpis = debugLazy(
  () => import('../pages/dashboard'),
  'StaffKpis'
);
const StaffMissionStatus = debugLazy(
  () => import('../pages/dashboard'),
  'StaffMissionStatus'
);
const StaffTasks = debugLazy(
  () => import('../pages/dashboard'),
  'StaffTasks'
);
const StaffSubmissions = debugLazy(
  () => import('../pages/dashboard'),
  'StaffSubmissions'
);
const StaffHistory = debugLazy(
  () => import('../pages/dashboard'),
  'StaffHistory'
);

// ============================================
// CHAMPION COMPONENTS
// ============================================
const ChampionOverview = debugLazy(
  () => import('../pages/dashboard'),
  'ChampionOverview'
);
const ChampionTemplates = debugLazy(
  () => import('../pages/dashboard'),
  'ChampionTemplates'
);
const ChampionConfiguration = debugLazy(
  () => import('../pages/dashboard'),
  'ChampionConfiguration'
);

// ============================================
// READ-ONLY COMPONENTS
// ============================================
const ReadOnlyOverview = debugLazy(
  () => import('../pages/dashboard'),
  'ReadOnlyOverview'
);
const ReadOnlyExecutiveView = debugLazy(
  () => import('../pages/dashboard'),
  'ReadOnlyExecutiveView'
);
const ReadOnlyManagerView = debugLazy(
  () => import('../pages/dashboard'),
  'ReadOnlyManagerView'
);
const ReadOnlyStaffView = debugLazy(
  () => import('../pages/dashboard'),
  'ReadOnlyStaffView'
);
const ReadOnlyExports = debugLazy(
  () => import('../pages/dashboard'),
  'ReadOnlyExports'
);

// Loading fallback
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px'
  }}>
    <div>Loading Dashboard...</div>
  </div>
);

const withSuspense = (Component) => (
  <React.Suspense fallback={<LoadingFallback />}>
    <Component />
  </React.Suspense>
);

const dashboardRoutes = [
  {
    path: '/dashboard',
    element: <DashboardShell />,
    children: [
      { index: true, element: <DashboardIndexRedirect /> },
      
      // SUPER ADMIN ROUTES
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.OVERVIEW, element: withSuspense(SuperAdminDashboard) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.CUSTOM_OVERVIEW, element: withSuspense(SuperAdminDashboardCustom) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.TENANTS, element: withSuspense(SuperAdminTenants) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.SYSTEM_HEALTH, element: withSuspense(SuperAdminSystemHealth) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.SUBSCRIPTIONS, element: withSuspense(SuperAdminSubscriptions) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.BILLING, element: withSuspense(SuperAdminBilling) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.PLATFORM_METRICS, element: withSuspense(SuperAdminPlatformMetrics) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.AUDIT_LOGS, element: withSuspense(SuperAdminAuditLogs) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.REPORTS, element: withSuspense(SuperAdminReports) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.EXPORTS, element: withSuspense(SuperAdminExports) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.SETTINGS, element: withSuspense(SuperAdminSettings) },
      
      // CLIENT ADMIN ROUTES
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.OVERVIEW, element: withSuspense(ClientAdminOverview) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.TENANT, element: withSuspense(ClientAdminTenant) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.COMPLIANCE, element: withSuspense(ClientAdminCompliance) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.APPROVALS, element: withSuspense(ClientAdminApprovals) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.MISSING_DATA, element: withSuspense(ClientAdminMissingData) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.KPI_BREAKDOWN, element: withSuspense(ClientAdminKpiBreakdown) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.USERS, element: withSuspense(ClientAdminUsers) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.ROLES, element: withSuspense(ClientAdminRoles) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.REPORTS, element: withSuspense(ClientAdminReports) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.EXPORTS, element: withSuspense(ClientAdminExports) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.SETTINGS, element: withSuspense(ClientAdminSettings) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.AUDIT_LOGS, element: withSuspense(ClientAdminAuditLogs) },
      
      // EXECUTIVE ROUTES
      { path: DASHBOARD_ROUTES.EXECUTIVE.OVERVIEW, element: withSuspense(ExecutiveOverview) },
      { path: DASHBOARD_ROUTES.EXECUTIVE.DEPARTMENTS, element: withSuspense(ExecutiveDepartments) },
      { path: DASHBOARD_ROUTES.EXECUTIVE.TEAM, element: withSuspense(ExecutiveTeam) },
      { path: DASHBOARD_ROUTES.EXECUTIVE.TRENDS, element: withSuspense(ExecutiveTrends) },
      { path: DASHBOARD_ROUTES.EXECUTIVE.COMPARISONS, element: withSuspense(ExecutiveComparisons) },
      { path: DASHBOARD_ROUTES.EXECUTIVE.ALERTS, element: withSuspense(ExecutiveAlerts) },
      { path: DASHBOARD_ROUTES.EXECUTIVE.REPORTS, element: withSuspense(ExecutiveReports) },
      { path: DASHBOARD_ROUTES.EXECUTIVE.EXPORTS, element: withSuspense(ExecutiveExports) },
      
      // MANAGER ROUTES
      { path: DASHBOARD_ROUTES.MANAGER.OVERVIEW, element: withSuspense(ManagerOverview) },
      { path: DASHBOARD_ROUTES.MANAGER.TEAM, element: withSuspense(ManagerTeam) },
      { path: DASHBOARD_ROUTES.MANAGER.APPROVALS, element: withSuspense(ManagerApprovals) },
      { path: DASHBOARD_ROUTES.MANAGER.REPORTS, element: withSuspense(ManagerReports) },
      
      // STAFF ROUTES
      { path: DASHBOARD_ROUTES.STAFF.OVERVIEW, element: withSuspense(StaffOverview) },
      { path: DASHBOARD_ROUTES.STAFF.KPIS, element: withSuspense(StaffKpis) },
      { path: DASHBOARD_ROUTES.STAFF.MISSION_STATUS, element: withSuspense(StaffMissionStatus) },
      { path: DASHBOARD_ROUTES.STAFF.TASKS, element: withSuspense(StaffTasks) },
      { path: DASHBOARD_ROUTES.STAFF.SUBMISSIONS, element: withSuspense(StaffSubmissions) },
      { path: DASHBOARD_ROUTES.STAFF.HISTORY, element: withSuspense(StaffHistory) },
      
      // CHAMPION ROUTES
      { path: DASHBOARD_ROUTES.CHAMPION.OVERVIEW, element: withSuspense(ChampionOverview) },
      { path: DASHBOARD_ROUTES.CHAMPION.TEMPLATES, element: withSuspense(ChampionTemplates) },
      { path: DASHBOARD_ROUTES.CHAMPION.CONFIGURATION, element: withSuspense(ChampionConfiguration) },
      
      // READ-ONLY ROUTES
      { path: DASHBOARD_ROUTES.READ_ONLY.OVERVIEW, element: withSuspense(ReadOnlyOverview) },
      { path: DASHBOARD_ROUTES.READ_ONLY.EXECUTIVE_VIEW, element: withSuspense(ReadOnlyExecutiveView) },
      { path: DASHBOARD_ROUTES.READ_ONLY.MANAGER_VIEW, element: withSuspense(ReadOnlyManagerView) },
      { path: DASHBOARD_ROUTES.READ_ONLY.STAFF_VIEW, element: withSuspense(ReadOnlyStaffView) },
      { path: DASHBOARD_ROUTES.READ_ONLY.EXPORTS, element: withSuspense(ReadOnlyExports) },
    ],
  },
];

export default dashboardRoutes;