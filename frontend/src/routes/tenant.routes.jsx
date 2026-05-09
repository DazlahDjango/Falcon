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
const TenantResourcesPage = React.lazy(() => import('../pages/tenant/TenantResourcesPage').then((module) => ({ default: module.TenantResourcesPage })));
const TenantUsagePage = React.lazy(() => import('../pages/tenant/TenantUsagePage').then((module) => ({ default: module.TenantUsagePage })));
const TenantProvisioningPage = React.lazy(() => import('../pages/tenant/TenantProvisioningPage').then((module) => ({ default: module.TenantProvisioningPage })));
const TenantAuditPage = React.lazy(() => import('../pages/tenant/TenantAuditPage').then((module) => ({ default: module.TenantAuditPage })));
const TenantMigrationsPage = React.lazy(() => import('../pages/tenant/TenantMigrationsPage').then((module) => ({ default: module.TenantMigrationsPage })));
const TenantSchemaPage = React.lazy(() => import('../pages/tenant/TenantSchemaPage').then((module) => ({ default: module.TenantSchemaPage })));

// Connections
const ConnectionDashboardPage = React.lazy(() => import('../pages/tenant/connections/ConnectionDashboardPage').then((module) => ({ default: module.ConnectionDashboardPage })));
const TenantConnectionsPage = React.lazy(() => import('../pages/tenant/connections/TenantConnectionsPage').then((module) => ({ default: module.TenantConnectionsPage })));

// Domain & Backup
const TenantDomainsPage = React.lazy(() => import('../pages/tenant/TenantDomainsPage').then((module) => ({ default: module.TenantDomainsPage })));
const TenantBackupsPage = React.lazy(() => import('../pages/tenant/TenantBackupsPage').then((module) => ({ default: module.TenantBackupsPage })));

const withSuspense = (Component) => (
    <React.Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
        <Component />
    </React.Suspense>
);

const tenantRoutes = [
    {
        path: 'tenants',
        children: [
            // ✅ ADD ALL THESE ROUTES
            { index: true, element: withSuspense(TenantListPage) },           // /tenants
            { path: 'dashboard', element: withSuspense(TenantDashboardPage) }, // /tenants/dashboard
            { path: 'create', element: withSuspense(TenantCreatePage) },       // /tenants/create ✅ ADD THIS
            
            // Dynamic routes
            { path: ':id', element: withSuspense(TenantDetailPage) },
            { path: ':id/edit', element: withSuspense(TenantEditPage) },
            { path: ':id/settings', element: withSuspense(TenantSettingsPage) },
            { path: ':id/resources', element: withSuspense(TenantResourcesPage) },
            { path: ':id/usage', element: withSuspense(TenantUsagePage) },
            { path: ':id/provisioning', element: withSuspense(TenantProvisioningPage) },
            { path: ':id/audit', element: withSuspense(TenantAuditPage) },
            { path: ':id/migrations', element: withSuspense(TenantMigrationsPage) },
            { path: ':id/schema', element: withSuspense(TenantSchemaPage) },
            { path: ':id/domains', element: withSuspense(TenantDomainsPage) },
            { path: ':id/backups', element: withSuspense(TenantBackupsPage) },
            { path: ':id/connections', element: withSuspense(TenantConnectionsPage) },
        ],
    },
    {
        path: 'tenants/connections',  // ✅ Top-level connections route
        children: [
            { index: true, element: withSuspense(ConnectionDashboardPage) },      // /tenants/connections
            { path: 'metrics', element: withSuspense(ConnectionDashboardPage) },   // /tenants/connections/metrics
            { path: 'health', element: withSuspense(ConnectionDashboardPage) },    // /tenants/connections/health
        ],
    },
];

export default tenantRoutes;