// frontend/src/routes/dashboard.routes.js
import React from "react";
import { DASHBOARD_ROUTES } from "../config/constants/dashboardRouteConstants";

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

const SuperAdminDashboard = React.lazy(() => import('../pages/dashboard/SuperAdminDashboard/SuperAdminDashboard'));
const SuperAdminTenants = React.lazy(() => import('../pages/dashboard/SuperAdminDashboard/SuperAdminTenants'));
const SuperAdminSystemHealth = React.lazy(() => import('../pages/dashboard/SuperAdminDashboard/SuperAdminSystemHealth'));
const SuperAdminSubscriptions = React.lazy(() => import('../pages/dashboard/SuperAdminDashboard/SuperAdminSubscriptions'));
const SuperAdminBilling = React.lazy(() => import('../pages/dashboard/SuperAdminDashboard/SuperAdminBilling'));
const SuperAdminPlatformMetrics = React.lazy(() => import('../pages/dashboard/SuperAdminDashboard/SuperAdminPlatformMetrics'));
const SuperAdminAuditLogs = React.lazy(() => import('../pages/dashboard/SuperAdminDashboard/SuperAdminAuditLogs'));
const SuperAdminReports = React.lazy(() => import('../pages/dashboard/SuperAdminDashboard/SuperAdminReports'));
const SuperAdminExports = React.lazy(() => import('../pages/dashboard/SuperAdminDashboard/SuperAdminExports'));
const SuperAdminSettings = React.lazy(() => import('../pages/dashboard/SuperAdminDashboard/SuperAdminSettings'));

// Loading component
const LoadingFallback = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div>Loading Dashboard...</div>
    </div>
);

const withSuspense = (Component) => (
    <React.Suspense fallback={<LoadingFallback />}>
        <Component />
    </React.Suspense>
);

const dashboardRoutes = [
    // Executive Dashboard Routes
    { path: DASHBOARD_ROUTES.EXECUTIVE.OVERVIEW, element: withSuspense(ExecutiveDashboard) },
    { path: DASHBOARD_ROUTES.EXECUTIVE.DEPARTMENTS, element: withSuspense(ExecutiveDepartments) },
    { path: DASHBOARD_ROUTES.EXECUTIVE.TEAM, element: withSuspense(ExecutiveTeam) },
    { path: DASHBOARD_ROUTES.EXECUTIVE.TRENDS, element: withSuspense(ExecutiveTrends) },
    { path: DASHBOARD_ROUTES.EXECUTIVE.COMPARISONS, element: withSuspense(ExecutiveComparisons) },
    { path: DASHBOARD_ROUTES.EXECUTIVE.ALERTS, element: withSuspense(ExecutiveAlerts) },
    { path: DASHBOARD_ROUTES.EXECUTIVE.REPORTS, element: withSuspense(ExecutiveReports) },
    { path: DASHBOARD_ROUTES.EXECUTIVE.EXPORTS, element: withSuspense(ExecutiveExports) },
    { path: DASHBOARD_ROUTES.EXECUTIVE.SETTINGS, element: withSuspense(ExecutiveSettings) },
    
    // Client Admin Dashboard Routes
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
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.SETTINGS, element: withSuspense(ClientAdminSettings) },
    
    // Super Admin Dashboard Routes
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
    
    // Redirects
    { path: '/dashboard', element: <Navigate to={DASHBOARD_ROUTES.EXECUTIVE.OVERVIEW} replace /> },
];

export default dashboardRoutes;