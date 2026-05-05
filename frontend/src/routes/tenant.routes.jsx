// frontend/src/routes/tenant.routes.js
// Tenant Management Routes (Simplified - no extra auth wrappers)

import React from 'react';
import { Navigate } from 'react-router-dom';

// Import constants
import {
    TENANT_API_ENDPOINTS,
    TENANT_QUERY_PARAMS,
    DOMAIN_ENDPOINTS,
    BACKUP_ENDPOINTS,
    MIGRATION_ENDPOINTS,
    SCHEMA_ENDPOINTS
} from '../config/constants/tenantConstants';

// Lazy load core components
const TenantListPage = React.lazy(() => import('../pages/tenant/TenantListPage'));
const TenantDetailPage = React.lazy(() => import('../pages/tenant/TenantDetailPage'));
const TenantCreatePage = React.lazy(() => import('../pages/tenant/TenantCreatePage'));
const TenantEditPage = React.lazy(() => import('../pages/tenant/TenantEditPage'));
const TenantSettingsPage = React.lazy(() => import('../pages/tenant/TenantSettingsPage'));
const TenantResourcesPage = React.lazy(() => import('../pages/tenant/TenantResourcesPage'));
const TenantUsagePage = React.lazy(() => import('../pages/tenant/TenantUsagePage'));
const TenantDashboardPage = React.lazy(() => import('../pages/tenant/TenantDashboardPage'));
const TenantProvisioningPage = React.lazy(() => import('../pages/tenant/TenantProvisioningPage'));
const TenantAuditPage = React.lazy(() => import('../pages/tenant/TenantAuditPage'));
const TenantMigrationsPage = React.lazy(() => import('../pages/tenant/TenantMigrationsPage'));
const TenantSchemaPage = React.lazy(() => import('../pages/tenant/TenantSchemaPage'));
// Connections
const ConnectionDashboardPage = React.lazy(() => import('../pages/tenant/connections/ConnectionDashboardPage'));
const TenantConnectionsPage = React.lazy(() => import('../pages/tenant/connections/TenantConnectionsPage'));
// Domain Management Pages
const DomainListPage = React.lazy(() => import('../pages/tenant/domains/DomainListPage'));
const DomainCreatePage = React.lazy(() => import('../pages/tenant/domains/DomainCreatePage'));
const DomainVerifyPage = React.lazy(() => import('../pages/tenant/domains/DomainVerifyPage'));
// Backup Management Pages
const BackupListPage = React.lazy(() => import('../pages/tenant/backups/BackupListPage'));
const BackupCreatePage = React.lazy(() => import('../pages/tenant/backups/BackupCreatePage'));
const BackupRestorePage = React.lazy(() => import('../pages/tenant/backups/BackupRestorePage'));

// Wrapper for suspense loading
const withSuspense = (Component) => (
    <React.Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
        <Component />
    </React.Suspense>
);

// Main tenant routes configuration (simplified - no extra auth)
const tenantRoutes = [
    {
        path: 'tenants',
        // Use the same MainLayout from your main router - no separate TenantLayout needed
        children: [
            // ==================== Tenant Core Routes ====================
            {
                path: '',
                element: withSuspense(TenantListPage),
            },
            {
                path: 'dashboard',
                element: withSuspense(TenantDashboardPage),
            },
            {
                path: 'create',
                element: withSuspense(TenantCreatePage),
            },
            {
                path: ':tenantId',
                element: withSuspense(TenantDetailPage),
            },
            {
                path: ':tenantId/edit',
                element: withSuspense(TenantEditPage),
            },
            {
                path: ':tenantId/settings',
                element: withSuspense(TenantSettingsPage),
            },
            {
                path: ':tenantId/resources',
                element: withSuspense(TenantResourcesPage),
            },
            {
                path: ':tenantId/usage',
                element: withSuspense(TenantUsagePage),
            },
            {
                path: ':tenantId/provisioning',
                element: withSuspense(TenantProvisioningPage),
            },
            {
                path: ':tenantId/audit',
                element: withSuspense(TenantAuditPage),
            },
            {
                path: ':tenantId/migrations',
                element: withSuspense(TenantMigrationsPage),
            },
            {
                path: ':tenantId/schema',
                element: withSuspense(TenantSchemaPage),
            },
            // ============ Connections ==============
            {
                path: '',
                element: withSuspense(ConnectionDashboardPage),
            },
            {
                path: 'tenant/:tenantId',
                element: withSuspense(TenantConnectionsPage),
            },

            // ==================== Domain Management Routes ====================
            {
                path: ':tenantId/domains',
                element: withSuspense(DomainListPage),
            },
            {
                path: ':tenantId/domains/create',
                element: withSuspense(DomainCreatePage),
            },
            {
                path: ':tenantId/domains/:domainId/verify',
                element: withSuspense(DomainVerifyPage),
            },

            // ==================== Backup Management Routes ====================
            {
                path: ':tenantId/backups',
                element: withSuspense(BackupListPage),
            },
            {
                path: ':tenantId/backups/create',
                element: withSuspense(BackupCreatePage),
            },
            {
                path: ':tenantId/backups/:backupId/restore',
                element: withSuspense(BackupRestorePage),
            },

            // Redirect /tenants/:tenantId to /tenants/:tenantId/overview
            {
                path: ':tenantId',
                element: <Navigate to="overview" replace />,
            },
        ],
    },

    // ==================== Redirects ====================
    {
        path: 'tenant',
        element: <Navigate to="/tenants" replace />,
    },
    {
        path: 'tenants',
        element: <Navigate to="/tenants/" replace />,
    },
];

// Helper function to get route path for API integration
export const getRouteForEndpoint = (endpoint, params = {}) => {
    const routeMap = {
        [TENANT_API_ENDPOINTS.TENANT.LIST]: '/tenants/',
        [TENANT_API_ENDPOINTS.TENANT.CREATE]: '/tenants/create',
        [TENANT_API_ENDPOINTS.TENANT.DETAIL('id')]: `/tenants/${params.id}`,
        [TENANT_API_ENDPOINTS.TENANT.UPDATE('id')]: `/tenants/${params.id}/edit`,
        [TENANT_API_ENDPOINTS.DOMAIN.TENANT_DOMAINS('tenantId')]: `/tenants/${params.tenantId}/domains`,
        [TENANT_API_ENDPOINTS.BACKUP.TENANT_BACKUPS('tenantId')]: `/tenants/${params.tenantId}/backups`,
        [TENANT_API_ENDPOINTS.MIGRATION.TENANT_MIGRATIONS('tenantId')]: `/tenants/${params.tenantId}/migrations`,
        [TENANT_API_ENDPOINTS.SCHEMA.TENANT_SCHEMA('tenantId')]: `/tenants/${params.tenantId}/schema`,
    };

    return routeMap[endpoint] || '/tenants/';
};

export default tenantRoutes;