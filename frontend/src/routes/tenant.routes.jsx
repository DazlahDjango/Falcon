// routes/tenant.routes.js
// Tenant Management Routes
// Integrates with tenant constants and services

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

// Lazy load components for performance
const TenantListPage = React.lazy(() => import('../pages/tenant/TenantListPage'));
const TenantDetailPage = React.lazy(() => import('../pages/tenant/TenantDetailPage'));
const TenantCreatePage = React.lazy(() => import('../pages/tenant/TenantCreatePage'));
const TenantEditPage = React.lazy(() => import('../pages/tenant/TenantEditPage'));
const TenantSettingsPage = React.lazy(() => import('../pages/tenant/TenantSettingsPage'));
const TenantResourcesPage = React.lazy(() => import('../pages/tenant/TenantResourcesPage'));
const TenantUsagePage = React.lazy(() => import('../pages/tenant/TenantUsagePage'));

// Domain Management Pages
const DomainListPage = React.lazy(() => import('../pages/tenant/domains/DomainListPage'));
const DomainCreatePage = React.lazy(() => import('../pages/tenant/domains/DomainCreatePage'));
const DomainVerifyPage = React.lazy(() => import('../pages/tenant/domains/DomainVerifyPage'));

// Backup Management Pages
const BackupListPage = React.lazy(() => import('../pages/tenant/backups/BackupListPage'));
const BackupCreatePage = React.lazy(() => import('../pages/tenant/backups/BackupCreatePage'));
const BackupRestorePage = React.lazy(() => import('../pages/tenant/backups/BackupRestorePage'));

// Migration & Schema Pages
const MigrationListPage = React.lazy(() => import('../pages/tenant/migrations/MigrationListPage'));
const SchemaViewPage = React.lazy(() => import('../pages/tenant/schemas/SchemaViewPage'));

// Layout components
import TenantLayout from '../layouts/TenantLayout';
import RequireAuth from '../components/auth/RequireAuth';
import RequirePermission from '../components/auth/RequirePermission';

// Helper function to build routes with role requirements
const createTenantRoute = (path, element, requiredRoles = ['super_admin', 'client_admin']) => ({
    path,
    element: (
        <RequireAuth>
            <RequirePermission roles={requiredRoles}>
                {element}
            </RequirePermission>
        </RequireAuth>
    ),
});

// Main tenant routes configuration
const tenantRoutes = [
    {
        path: 'tenants',
        element: <TenantLayout />,
        children: [
            // ==================== Tenant Core Routes ====================
            // List tenants (matches TENANT_ENDPOINTS.LIST)
            createTenantRoute(
                '/',
                <React.Suspense fallback={<div>Loading...</div>}>
                    <TenantListPage />
                </React.Suspense>,
                ['super_admin'] // Only super admin can list all tenants
            ),

            // Create tenant (matches TENANT_ENDPOINTS.CREATE)
            createTenantRoute(
                'create',
                <React.Suspense fallback={<div>Loading...</div>}>
                    <TenantCreatePage />
                </React.Suspense>,
                ['super_admin']
            ),

            // Tenant details (matches TENANT_ENDPOINTS.DETAIL(id))
            createTenantRoute(
                ':tenantId',
                <React.Suspense fallback={<div>Loading...</div>}>
                    <TenantDetailPage />
                </React.Suspense>,
                ['super_admin', 'client_admin']
            ),

            // Edit tenant (matches TENANT_ENDPOINTS.UPDATE(id))
            createTenantRoute(
                ':tenantId/edit',
                <React.Suspense fallback={<div>Loading...</div>}>
                    <TenantEditPage />
                </React.Suspense>,
                ['super_admin', 'client_admin']
            ),

            // Tenant settings (uses same update endpoint)
            createTenantRoute(
                ':tenantId/settings',
                <React.Suspense fallback={<div>Loading...</div>}>
                    <TenantSettingsPage />
                </React.Suspense>,
                ['super_admin', 'client_admin']
            ),

            // Tenant resources (matches TENANT_ENDPOINTS.RESOURCES(id))
            createTenantRoute(
                ':tenantId/resources',
                <React.Suspense fallback={<div>Loading...</div>}>
                    <TenantResourcesPage />
                </React.Suspense>,
                ['super_admin', 'client_admin']
            ),

            // Tenant usage (matches TENANT_ENDPOINTS.USAGE(id))
            createTenantRoute(
                ':tenantId/usage',
                <React.Suspense fallback={<div>Loading...</div>}>
                    <TenantUsagePage />
                </React.Suspense>,
                ['super_admin', 'client_admin']
            ),

            // ==================== Domain Management Routes ====================
            // List domains (matches DOMAIN_ENDPOINTS.TENANT_DOMAINS(tenantId))
            {
                path: ':tenantId/domains',
                element: (
                    <RequireAuth>
                        <RequirePermission roles={['super_admin', 'client_admin']}>
                            <React.Suspense fallback={<div>Loading...</div>}>
                                <DomainListPage />
                            </React.Suspense>
                        </RequirePermission>
                    </RequireAuth>
                ),
            },

            // Create domain (matches DOMAIN_ENDPOINTS.TENANT_DOMAIN_CREATE(tenantId))
            {
                path: ':tenantId/domains/create',
                element: (
                    <RequireAuth>
                        <RequirePermission roles={['super_admin', 'client_admin']}>
                            <React.Suspense fallback={<div>Loading...</div>}>
                                <DomainCreatePage />
                            </React.Suspense>
                        </RequirePermission>
                    </RequireAuth>
                ),
            },

            // Verify domain (matches DOMAIN_ENDPOINTS.TENANT_DOMAIN_VERIFY(tenantId, domainId))
            {
                path: ':tenantId/domains/:domainId/verify',
                element: (
                    <RequireAuth>
                        <RequirePermission roles={['super_admin', 'client_admin']}>
                            <React.Suspense fallback={<div>Loading...</div>}>
                                <DomainVerifyPage />
                            </React.Suspense>
                        </RequirePermission>
                    </RequireAuth>
                ),
            },

            // ==================== Backup Management Routes ====================
            // List backups (matches BACKUP_ENDPOINTS.TENANT_BACKUPS(tenantId))
            {
                path: ':tenantId/backups',
                element: (
                    <RequireAuth>
                        <RequirePermission roles={['super_admin', 'client_admin']}>
                            <React.Suspense fallback={<div>Loading...</div>}>
                                <BackupListPage />
                            </React.Suspense>
                        </RequirePermission>
                    </RequireAuth>
                ),
            },

            // Create backup (matches BACKUP_ENDPOINTS.TENANT_BACKUP_CREATE(tenantId))
            {
                path: ':tenantId/backups/create',
                element: (
                    <RequireAuth>
                        <RequirePermission roles={['super_admin', 'client_admin']}>
                            <React.Suspense fallback={<div>Loading...</div>}>
                                <BackupCreatePage />
                            </React.Suspense>
                        </RequirePermission>
                    </RequireAuth>
                ),
            },

            // Restore backup (matches BACKUP_ENDPOINTS.TENANT_BACKUP_RESTORE(tenantId, backupId))
            {
                path: ':tenantId/backups/:backupId/restore',
                element: (
                    <RequireAuth>
                        <RequirePermission roles={['super_admin']}>
                            <React.Suspense fallback={<div>Loading...</div>}>
                                <BackupRestorePage />
                            </React.Suspense>
                        </RequirePermission>
                    </RequireAuth>
                ),
            },

            // ==================== Migration Routes ====================
            // List migrations (matches MIGRATION_ENDPOINTS.TENANT_MIGRATIONS(tenantId))
            {
                path: ':tenantId/migrations',
                element: (
                    <RequireAuth>
                        <RequirePermission roles={['super_admin', 'client_admin']}>
                            <React.Suspense fallback={<div>Loading...</div>}>
                                <MigrationListPage />
                            </React.Suspense>
                        </RequirePermission>
                    </RequireAuth>
                ),
            },

            // ==================== Schema Routes ====================
            // View schema (matches SCHEMA_ENDPOINTS.TENANT_SCHEMA(tenantId))
            {
                path: ':tenantId/schema',
                element: (
                    <RequireAuth>
                        <RequirePermission roles={['super_admin', 'client_admin']}>
                            <React.Suspense fallback={<div>Loading...</div>}>
                                <SchemaViewPage />
                            </React.Suspense>
                        </RequirePermission>
                    </RequireAuth>
                ),
            },

            // Redirect /tenants/:tenantId to /tenants/:tenantId/overview
            {
                path: ':tenantId',
                element: <Navigate to="overview" replace />,
            },
        ],
    },

    // Redirect /tenant to /tenants
    {
        path: 'tenant',
        element: <Navigate to="/tenants" replace />,
    },

    // Redirect /tenants to /tenants/
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

// Export route configuration for use in main router
export default tenantRoutes;