// frontend/src/routes/tenant.routes.js
import React from 'react';
import { Navigate } from 'react-router-dom';

// Lazy load components with named export wrappers
const TenantListPage = React.lazy(() => import('../pages/tenant/TenantListPage').then((module) => ({ default: module.TenantListPage })));
const TenantDashboardPage = React.lazy(() => import('../pages/tenant/TenantDashboardPage').then((module) => ({ default: module.TenantDashboardPage })));
const TenantDetailPage = React.lazy(() => import('../pages/tenant/TenantDetailPage').then((module) => ({ default: module.TenantDetailPage })));
const TenantCreatePage = React.lazy(() => import('../pages/tenant/TenantCreatePage').then((module) => ({ default: module.TenantCreatePage })));
const TenantEditPage = React.lazy(() => import('../pages/tenant/TenantEditPage').then((module) => ({ default: module.TenantEditPage })));
const TenantSettingsPage = React.lazy(() => import('../pages/tenant/TenantSettingsPage').then((module) => ({ default: module.TenantSettingsPage })));
const TenantPlatformSettingsPage = React.lazy(() => import('../pages/tenant/TenantPlatformSettingsPage').then((module) => ({ default: module.TenantPlatformSettingsPage })));
const TenantResourcesPage = React.lazy(() => import('../pages/tenant/TenantResourcesPage').then((module) => ({ default: module.TenantResourcesPage })));
const TenantUsagePage = React.lazy(() => import('../pages/tenant/TenantUsagePage').then((module) => ({ default: module.TenantUsagePage })));
const TenantProvisioningPage = React.lazy(() => import('../pages/tenant/TenantProvisioningPage').then((module) => ({ default: module.TenantProvisioningPage })));
const TenantAuditPage = React.lazy(() => import('../pages/tenant/TenantAuditPage').then((module) => ({ default: module.TenantAuditPage })));
const TenantMigrationsPage = React.lazy(() => import('../pages/tenant/TenantMigrationsPage').then((module) => ({ default: module.TenantMigrationsPage })));
const TenantSchemaPage = React.lazy(() => import('../pages/tenant/TenantSchemaPage').then((module) => ({ default: module.TenantSchemaPage })));

// Connections
const ConnectionDashboardPage = React.lazy(() => import('../pages/tenant/connections/ConnectionDashboardPage').then((module) => ({ default: module.ConnectionDashboardPage })));
const ConnectionMetricsPage = React.lazy(() => import('../pages/tenant/connections/ConnectionMetricsPage').then((module) => ({ default: module.ConnectionMetricsPage })));
const ConnectionHealthPage = React.lazy(() => import('../pages/tenant/connections/ConnectionHealthPage').then((module) => ({ default: module.ConnectionHealthPage })));
const TenantConnectionsPage = React.lazy(() => import('../pages/tenant/connections/TenantConnectionsPage').then((module) => ({ default: module.TenantConnectionsPage })));

// Domain & Backup
const TenantDomainsPage = React.lazy(() => import('../pages/tenant/TenantDomainsPage').then((module) => ({ default: module.TenantDomainsPage })));
const TenantBackupsPage = React.lazy(() => import('../pages/tenant/TenantBackupsPage').then((module) => ({ default: module.TenantBackupsPage })));

// Loading component
const LoadingFallback = () => (
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '16rem' 
    }}>
        <div>Loading...</div>
    </div>
);

const withSuspense = (Component) => (
    <React.Suspense fallback={<LoadingFallback />}>
        <Component />
    </React.Suspense>
);

const tenantRoutes = [
    {
        path: 'tenants',
        children: [
            // Core routes
            { index: true, element: withSuspense(TenantListPage) },
            { path: 'dashboard', element: withSuspense(TenantDashboardPage) },
            { path: 'platform-settings', element: withSuspense(TenantPlatformSettingsPage) },
            { path: 'create', element: withSuspense(TenantCreatePage) },
            
            // Dynamic tenant routes (using :tenantId parameter)
            { path: ':tenantId', element: withSuspense(TenantDetailPage) },
            { path: ':tenantId/edit', element: withSuspense(TenantEditPage) },
            { path: ':tenantId/settings', element: withSuspense(TenantSettingsPage) },
            { path: ':tenantId/resources', element: withSuspense(TenantResourcesPage) },
            { path: ':tenantId/usage', element: withSuspense(TenantUsagePage) },
            { path: ':tenantId/provisioning', element: withSuspense(TenantProvisioningPage) },
            { path: ':tenantId/audit', element: withSuspense(TenantAuditPage) },
            { path: ':tenantId/migrations', element: withSuspense(TenantMigrationsPage) },
            { path: ':tenantId/schema', element: withSuspense(TenantSchemaPage) },
            { path: ':tenantId/domains', element: withSuspense(TenantDomainsPage) },
            { path: ':tenantId/backups', element: withSuspense(TenantBackupsPage) },
            { path: ':tenantId/connections', element: withSuspense(TenantConnectionsPage) },
        ],
    },
    {
        path: 'tenants/connections',
        children: [
            { index: true, element: withSuspense(ConnectionDashboardPage) },
            { path: 'metrics', element: withSuspense(ConnectionMetricsPage) },
            { path: 'health', element: withSuspense(ConnectionHealthPage) },
        ],
    },
    // Redirects
    {
        path: 'tenant',
        element: <Navigate to="/tenants" replace />,
    },
    {
        path: 'tenants/overview',
        element: <Navigate to="/tenants" replace />,
    },
];

export default tenantRoutes;