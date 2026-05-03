// frontend/src/routes/tenant.routes.js
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

// Domain Management Pages
const DomainListPage = React.lazy(() => import('../pages/tenant/domains/DomainListPage'));
const DomainCreatePage = React.lazy(() => import('../pages/tenant/domains/DomainCreatePage'));
const DomainVerifyPage = React.lazy(() => import('../pages/tenant/domains/DomainVerifyPage'));

// Backup Management Pages
const BackupListPage = React.lazy(() => import('../pages/tenant/backups/BackupListPage'));
const BackupCreatePage = React.lazy(() => import('../pages/tenant/backups/BackupCreatePage'));
const BackupRestorePage = React.lazy(() => import('../pages/tenant/backups/BackupRestorePage'));

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
                <React.Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
                    {element}
                </React.Suspense>
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
            // List tenants (Super Admin only)
            createTenantRoute(
                '/',
                <TenantListPage />,
                ['super_admin']
            ),

            // Tenant Dashboard (Super Admin overview)
            createTenantRoute(
                'dashboard',
                <TenantDashboardPage />,
                ['super_admin']
            ),

            // Create tenant (Super Admin only)
            createTenantRoute(
                'create',
                <TenantCreatePage />,
                ['super_admin']
            ),

            // Tenant details
            createTenantRoute(
                ':tenantId',
                <TenantDetailPage />,
                ['super_admin', 'client_admin']
            ),

            // Edit tenant
            createTenantRoute(
                ':tenantId/edit',
                <TenantEditPage />,
                ['super_admin', 'client_admin']
            ),

            // Tenant settings
            createTenantRoute(
                ':tenantId/settings',
                <TenantSettingsPage />,
                ['super_admin', 'client_admin']
            ),

            // Tenant resources (limits)
            createTenantRoute(
                ':tenantId/resources',
                <TenantResourcesPage />,
                ['super_admin', 'client_admin']
            ),

            // Tenant usage statistics
            createTenantRoute(
                ':tenantId/usage',
                <TenantUsagePage />,
                ['super_admin', 'client_admin']
            ),

            // Tenant provisioning status
            createTenantRoute(
                ':tenantId/provisioning',
                <TenantProvisioningPage />,
                ['super_admin', 'client_admin']
            ),

            // Tenant audit logs
            createTenantRoute(
                ':tenantId/audit',
                <TenantAuditPage />,
                ['super_admin', 'client_admin']
            ),

            // Tenant migrations tracking
            createTenantRoute(
                ':tenantId/migrations',
                <TenantMigrationsPage />,
                ['super_admin']
            ),

            // Tenant database schema
            createTenantRoute(
                ':tenantId/schema',
                <TenantSchemaPage />,
                ['super_admin', 'client_admin']
            ),

            // ==================== Domain Management Routes ====================
            // List domains for tenant
            {
                path: ':tenantId/domains',
                element: (
                    <RequireAuth>
                        <RequirePermission roles={['super_admin', 'client_admin']}>
                            <React.Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
                                <DomainListPage />
                            </React.Suspense>
                        </RequirePermission>
                    </RequireAuth>
                ),
            },

            // Create domain for tenant
            {
                path: ':tenantId/domains/create',
                element: (
                    <RequireAuth>
                        <RequirePermission roles={['super_admin', 'client_admin']}>
                            <React.Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
                                <DomainCreatePage />
                            </React.Suspense>
                        </RequirePermission>
                    </RequireAuth>
                ),
            },

            // Verify domain for tenant
            {
                path: ':tenantId/domains/:domainId/verify',
                element: (
                    <RequireAuth>
                        <RequirePermission roles={['super_admin', 'client_admin']}>
                            <React.Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
                                <DomainVerifyPage />
                            </React.Suspense>
                        </RequirePermission>
                    </RequireAuth>
                ),
            },

            // ==================== Backup Management Routes ====================
            // List backups for tenant
            {
                path: ':tenantId/backups',
                element: (
                    <RequireAuth>
                        <RequirePermission roles={['super_admin', 'client_admin']}>
                            <React.Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
                                <BackupListPage />
                            </React.Suspense>
                        </RequirePermission>
                    </RequireAuth>
                ),
            },

            // Create backup for tenant
            {
                path: ':tenantId/backups/create',
                element: (
                    <RequireAuth>
                        <RequirePermission roles={['super_admin', 'client_admin']}>
                            <React.Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
                                <BackupCreatePage />
                            </React.Suspense>
                        </RequirePermission>
                    </RequireAuth>
                ),
            },

            // Restore backup for tenant (Super Admin only)
            {
                path: ':tenantId/backups/:backupId/restore',
                element: (
                    <RequireAuth>
                        <RequirePermission roles={['super_admin']}>
                            <React.Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
                                <BackupRestorePage />
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

    // ==================== Redirects ====================
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