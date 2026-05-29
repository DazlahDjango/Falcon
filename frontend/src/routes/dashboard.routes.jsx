import React from 'react';
import { Navigate } from 'react-router-dom';
import { DASHBOARD_ROUTES } from '../config/constants/dashboardRouteConstants';
import { DashboardShell } from '../components/dashboard/common/DashboardShell';
import DashboardIndexRedirect from '../components/dashboard/common/DashboardIndexRedirect';

const debugLazy = (importFn, componentName) => {
  return React.lazy(() => {
    console.log(`🔄 [DEBUG] Attempting to load: ${componentName}`);
    return importFn()
      .then(module => {
        console.log(`✅ [DEBUG] Module loaded for: ${componentName}`);
        console.log(`📦 [DEBUG] Available exports:`, Object.keys(module));
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
// Super Admin Routes - Using debugLazy to ensure correct imports and better error handling
const SuperAdminDashboard = debugLazy(() => import('../pages/dashboard'), 'SuperAdminDashboard');
const SuperAdminTenants = debugLazy(() => import('../pages/dashboard'), 'SuperAdminTenants');
const SuperAdminSystemHealth = debugLazy(() => import('../pages/dashboard'), 'SuperAdminSystemHealth');
const SuperAdminSubscriptions = debugLazy(() => import('../pages/dashboard'), 'SuperAdminSubscriptions');
const SuperAdminBilling = debugLazy(() => import('../pages/dashboard'), 'SuperAdminBilling');
const SuperAdminPlatformMetrics = debugLazy(() => import('../pages/dashboard'), 'SuperAdminPlatformMetrics');
const SuperAdminAuditLogs = debugLazy(() => import('../pages/dashboard'), 'SuperAdminAuditLogs');
const SuperAdminReports = debugLazy(() => import('../pages/dashboard'), 'SuperAdminReports');
const SuperAdminExports = debugLazy(() => import('../pages/dashboard'), 'SuperAdminExports');
const SuperAdminSettings = debugLazy(() => import('../pages/dashboard'), 'SuperAdminSettings');
// Client Admin Routes

const ExecutiveDashboard = React.lazy(() => import('../pages/dashboard/ExecutiveDashboard/ExecutiveDashboard'));
const ExecutiveDepartments = React.lazy(() => import('../pages/dashboard/ExecutiveDashboard/ExecutiveDepartments'));
const ExecutiveTeam = React.lazy(() => import('../pages/dashboard/ExecutiveDashboard/ExecutiveTeam'));
const ExecutiveTrends = React.lazy(() => import('../pages/dashboard/ExecutiveDashboard/ExecutiveTrends'));
const ExecutiveComparisons = React.lazy(() => import('../pages/dashboard/ExecutiveDashboard/ExecutiveComparisons'));
const ExecutiveAlerts = React.lazy(() => import('../pages/dashboard/ExecutiveDashboard/ExecutiveAlerts'));
const ExecutiveReports = React.lazy(() => import('../pages/dashboard/ExecutiveDashboard/ExecutiveReports'));
const ExecutiveExports = React.lazy(() => import('../pages/dashboard/ExecutiveDashboard/ExecutiveExports'));
const ExecutiveSettings = React.lazy(() => import('../pages/dashboard/ExecutiveDashboard/ExecutiveSettings'));

const ClientAdminDashboard = React.lazy(() => import('../pages/dashboard/ClientAdminDashboard/ClientAdminDashboard'));
const ClientAdminTenant = React.lazy(() => import('../pages/dashboard/ClientAdminDashboard/ClientAdminTenant'));
const ClientAdminCompliance = React.lazy(() => import('../pages/dashboard/ClientAdminDashboard/ClientAdminCompliance'));
const ClientAdminApprovals = React.lazy(() => import('../pages/dashboard/ClientAdminDashboard/ClientAdminApprovals'));
const ClientAdminMissingData = React.lazy(() => import('../pages/dashboard/ClientAdminDashboard/ClientAdminMissingData'));
const ClientAdminKpiBreakdown = React.lazy(() => import('../pages/dashboard/ClientAdminDashboard/ClientAdminKpiBreakdown'));
const ClientAdminUserActivity = React.lazy(() => import('../pages/dashboard/ClientAdminDashboard/ClientAdminUserActivity'));
const ClientAdminUsers = React.lazy(() => import('../pages/dashboard/ClientAdminDashboard/ClientAdminUsers'));
const ClientAdminRoles = React.lazy(() => import('../pages/dashboard/ClientAdminDashboard/ClientAdminRoles'));
const ClientAdminReports = React.lazy(() => import('../pages/dashboard/ClientAdminDashboard/ClientAdminReports'));
const ClientAdminExports = React.lazy(() => import('../pages/dashboard/ClientAdminDashboard/ClientAdminExports'));
const ClientAdminSettings = React.lazy(() => import('../pages/dashboard/ClientAdminDashboard/ClientAdminSettings'));
const ClientAdminAuditLogs = React.lazy(() => import('../pages/dashboard/ClientAdminDashboard/ClientAdminAuditLogs'));

const ManagerDashboard = React.lazy(() => import('../pages/dashboard/ManagerDashboard/ManagerDashboard'));
const TeamOverview = React.lazy(() => import('../pages/dashboard/ManagerDashboard/TeamOverview'));
const TeamMembersTable = React.lazy(() => import('../pages/dashboard/ManagerDashboard/TeamMembersTable'));

const StaffDashboard = React.lazy(() => import('../pages/dashboard/StaffDashboard/StaffDashboard'));
const MyKPIsPanel = React.lazy(() => import('../pages/dashboard/StaffDashboard/MyKPIsPanel'));
const MissionStatusPanel = React.lazy(() => import('../pages/dashboard/StaffDashboard/MissionStatusPanel'));

const ChampionDashboard = React.lazy(() => import('../pages/dashboard/ChampionDashboard/ChampionDashboard'));
const TemplateLibrary = React.lazy(() => import('../pages/dashboard/ChampionDashboard/TemplateLibrary'));

const ReadOnlyDashboard = React.lazy(() => import('../pages/dashboard/ReadOnlyDashboard/ReadOnlyDashboard'));

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px'
  }}>
    <div>Loading Super Admin dashboard...</div>
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
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.OVERVIEW, element: withSuspense(SuperAdminDashboard) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.TENANTS, element: withSuspense(SuperAdminTenants) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.SYSTEM_HEALTH, element: withSuspense(SuperAdminSystemHealth) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.SUBSCRIPTIONS, element: withSuspense(SuperAdminSubscriptions) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.BILLING, element: withSuspense(SuperAdminBilling) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.PLATFORM_METRICS, element: withSuspense(SuperAdminPlatformMetrics) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.AUDIT_LOGS, element: withSuspense(SuperAdminAuditLogs) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.REPORTS, element: withSuspense(SuperAdminReports) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.EXPORTS, element: withSuspense(SuperAdminExports) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.SETTINGS, element: withSuspense(SuperAdminSettings) },

      { path: DASHBOARD_ROUTES.EXECUTIVE.OVERVIEW, element: withSuspense(ExecutiveDashboard) },
      { path: DASHBOARD_ROUTES.EXECUTIVE.DEPARTMENTS, element: withSuspense(ExecutiveDepartments) },
      { path: DASHBOARD_ROUTES.EXECUTIVE.TEAM, element: withSuspense(ExecutiveTeam) },
      { path: DASHBOARD_ROUTES.EXECUTIVE.TRENDS, element: withSuspense(ExecutiveTrends) },
      { path: DASHBOARD_ROUTES.EXECUTIVE.COMPARISONS, element: withSuspense(ExecutiveComparisons) },
      { path: DASHBOARD_ROUTES.EXECUTIVE.ALERTS, element: withSuspense(ExecutiveAlerts) },
      { path: DASHBOARD_ROUTES.EXECUTIVE.REPORTS, element: withSuspense(ExecutiveReports) },
      { path: DASHBOARD_ROUTES.EXECUTIVE.EXPORTS, element: withSuspense(ExecutiveExports) },
      { path: DASHBOARD_ROUTES.EXECUTIVE.SETTINGS, element: withSuspense(ExecutiveSettings) },

      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.OVERVIEW, element: withSuspense(ClientAdminDashboard) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.TENANT, element: withSuspense(ClientAdminTenant) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.COMPLIANCE, element: withSuspense(ClientAdminCompliance) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.APPROVALS, element: withSuspense(ClientAdminApprovals) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.MISSING_DATA, element: withSuspense(ClientAdminMissingData) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.KPI_BREAKDOWN, element: withSuspense(ClientAdminKpiBreakdown) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.USER_ACTIVITY, element: withSuspense(ClientAdminUserActivity) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.USERS, element: withSuspense(ClientAdminUsers) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.ROLES, element: withSuspense(ClientAdminRoles) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.REPORTS, element: withSuspense(ClientAdminReports) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.EXPORTS, element: withSuspense(ClientAdminExports) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.AUDIT_LOGS, element: withSuspense(ClientAdminAuditLogs) },
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.SETTINGS, element: withSuspense(ClientAdminSettings) },

      { path: DASHBOARD_ROUTES.MANAGER.OVERVIEW, element: withSuspense(ManagerDashboard) },
      { path: DASHBOARD_ROUTES.MANAGER.TEAM, element: withSuspense(TeamOverview) },
      { path: DASHBOARD_ROUTES.MANAGER.APPROVALS, element: withSuspense(TeamMembersTable) },

      { path: DASHBOARD_ROUTES.STAFF.OVERVIEW, element: withSuspense(StaffDashboard) },
      { path: DASHBOARD_ROUTES.STAFF.KPIS, element: withSuspense(MyKPIsPanel) },
      { path: DASHBOARD_ROUTES.STAFF.MISSION_STATUS, element: withSuspense(MissionStatusPanel) },

      { path: DASHBOARD_ROUTES.CHAMPION.OVERVIEW, element: withSuspense(ChampionDashboard) },
      { path: DASHBOARD_ROUTES.CHAMPION.TEMPLATES, element: withSuspense(TemplateLibrary) },

      { path: DASHBOARD_ROUTES.READ_ONLY.OVERVIEW, element: withSuspense(ReadOnlyDashboard) },
    ],
  },
];

export default dashboardRoutes;