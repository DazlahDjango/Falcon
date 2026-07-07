// routes/tenantRoutes.js
import React from 'react';
import { TENANT_ROUTES } from '../config/constants/tenantRouteConstants';

// LAZY LOAD TENANT PAGES
// ============================================

// Dashboard Pages
const DashboardPage = React.lazy(() => import('../pages/tenant/DashboardPage'));

// Organization Pages
const OrganizationsPage = React.lazy(() => import('../pages/tenant/OrganizationsPage'));
const OrganizationDetailPage = React.lazy(() => import('../pages/tenant/OrganizationDetailPage'));

// Domain Pages
const DomainsPage = React.lazy(() => import('../pages/tenant/DomainsPage'));

// Schema Pages
const SchemasPage = React.lazy(() => import('../pages/tenant/SchemasPage'));

// Resource Pages
const ResourcesPage = React.lazy(() => import('../pages/tenant/ResourcesPage'));
const ResourceDashboardPage = React.lazy(() => import('../pages/tenant/ResourceDashboardPage'));
const TenantResourcesPage = React.lazy(() => import('../pages/tenant/TenantResourcesPage').then(m => ({ default: m.TenantResourcesPage })));

// Connection Pages
const ConnectionsPage = React.lazy(() => import('../pages/tenant/ConnectionsPage'));

// Migration Pages
const MigrationsPage = React.lazy(() => import('../pages/tenant/MigrationsPage'));

// Sector Pages
const SectorsPage = React.lazy(() => import('../pages/tenant/SectorsPage'));

// Settings Pages
const SettingsPage = React.lazy(() => import('../pages/tenant/SettingsPage'));

// Health Pages
const HealthPage = React.lazy(() => import('../pages/tenant/HealthPage'));

// Provisioning Pages
const ProvisioningDashboardPage = React.lazy(() =>
    import('../pages/tenant/ProvisioningDashboardPage').then(m => ({ default: m.ProvisioningDashboardPage }))
);
const TenantProvisioningPage = React.lazy(() =>
    import('../pages/tenant/TenantProvisioningPage').then(m => ({ default: m.TenantProvisioningPage }))
);

// TENANT ROUTES CONFIGURATION
// ============================================

const tenantRoutes = [
    // Dashboard
    { path: TENANT_ROUTES.DASHBOARD, element: <DashboardPage /> },
    
    // Organization Management
    { path: TENANT_ROUTES.ORGANIZATIONS, element: <OrganizationsPage /> },
    { path: TENANT_ROUTES.ORGANIZATION_CREATE, element: <OrganizationsPage /> },
    { path: TENANT_ROUTES.ORGANIZATION_DETAIL(':id'), element: <OrganizationDetailPage /> },
    { path: TENANT_ROUTES.ORGANIZATION_EDIT(':id'), element: <OrganizationDetailPage /> },
    { path: TENANT_ROUTES.ORGANIZATION_ONBOARD(':id'), element: <OrganizationsPage /> },
    { path: TENANT_ROUTES.ORGANIZATION_USAGE(':id'), element: <OrganizationDetailPage /> },
    { path: TENANT_ROUTES.ORGANIZATION_PROVISIONING(':id'), element: <TenantProvisioningPage /> },
    
    // Domain Management
    { path: TENANT_ROUTES.DOMAINS, element: <DomainsPage /> },
    { path: TENANT_ROUTES.DOMAIN_CREATE, element: <DomainsPage /> },
    { path: TENANT_ROUTES.DOMAIN_DETAIL(':id'), element: <DomainsPage /> },
    { path: TENANT_ROUTES.DOMAIN_EDIT(':id'), element: <DomainsPage /> },
    { path: TENANT_ROUTES.DOMAIN_VERIFY(':id'), element: <DomainsPage /> },
    { path: TENANT_ROUTES.DOMAINS_ORGANIZATION(':orgId'), element: <DomainsPage /> },
    
    // Schema Management
    { path: TENANT_ROUTES.SCHEMAS, element: <SchemasPage /> },
    { path: TENANT_ROUTES.SCHEMA_CREATE, element: <SchemasPage /> },
    { path: TENANT_ROUTES.SCHEMA_DETAIL(':id'), element: <SchemasPage /> },
    { path: TENANT_ROUTES.SCHEMA_PROVISION(':id'), element: <SchemasPage /> },
    { path: TENANT_ROUTES.SCHEMAS_ORGANIZATION(':orgId'), element: <SchemasPage /> },
    
    // Resource Management
    { path: TENANT_ROUTES.RESOURCES, element: <ResourcesPage /> },
    { path: TENANT_ROUTES.RESOURCE_CREATE, element: <ResourcesPage /> },
    { path: TENANT_ROUTES.RESOURCE_DETAIL(':id'), element: <ResourcesPage /> },
    { path: TENANT_ROUTES.RESOURCE_EDIT(':id'), element: <ResourcesPage /> },
    { path: TENANT_ROUTES.RESOURCES_ORGANIZATION(':orgId'), element: <ResourcesPage /> },
    { path: TENANT_ROUTES.RESOURCE_DASHBOARD, element: <ResourceDashboardPage /> },
    { path: TENANT_ROUTES.RESOURCE_DASHBOARD_ORGANIZATION(':orgId'), element: <ResourceDashboardPage /> },
    { path: TENANT_ROUTES.RESOURCE_ANALYTICS, element: <ResourceDashboardPage /> },
    // Tenant-scoped resource management page (used when coming from org detail)
    { path: '/tenant/organizations/:orgId/resources/manage', element: <TenantResourcesPage /> },
    
    // Connection Management
    { path: TENANT_ROUTES.CONNECTIONS, element: <ConnectionsPage /> },
    { path: TENANT_ROUTES.CONNECTION_DETAIL(':id'), element: <ConnectionsPage /> },
    { path: TENANT_ROUTES.CONNECTION_METRICS, element: <ConnectionsPage /> },
    { path: TENANT_ROUTES.CONNECTIONS_ORGANIZATION(':orgId'), element: <ConnectionsPage /> },
    
    // Migration Management
    { path: TENANT_ROUTES.MIGRATIONS, element: <MigrationsPage /> },
    { path: TENANT_ROUTES.MIGRATION_DETAIL(':id'), element: <MigrationsPage /> },
    { path: TENANT_ROUTES.MIGRATION_STATS, element: <MigrationsPage /> },
    { path: TENANT_ROUTES.MIGRATIONS_ORGANIZATION(':orgId'), element: <MigrationsPage /> },
    
    // Sector Management
    { path: '/tenant/sectors', element: <SectorsPage /> },
    { path: '/tenant/sectors/create', element: <SectorsPage /> },
    { path: '/tenant/sectors/:id/edit', element: <SectorsPage /> },
    
    // Settings
    { path: TENANT_ROUTES.SETTINGS, element: <SettingsPage /> },
    { path: TENANT_ROUTES.SETTINGS_SECTION(':section'), element: <SettingsPage /> },
    { path: TENANT_ROUTES.SYSTEM_SETTINGS, element: <SettingsPage /> },
    
    // Health
    { path: TENANT_ROUTES.HEALTH, element: <HealthPage /> },
    { path: TENANT_ROUTES.HEALTH_ORGANIZATIONS, element: <HealthPage /> },
    
    // Admin (Super Admin only)
    { path: TENANT_ROUTES.ADMIN, element: <DashboardPage /> },
    { path: TENANT_ROUTES.ADMIN_ORGANIZATIONS, element: <OrganizationsPage /> },
    { path: TENANT_ROUTES.ADMIN_ORGANIZATION_DETAIL(':id'), element: <OrganizationDetailPage /> },

    // Provisioning Management (Super Admin)
    { path: TENANT_ROUTES.PROVISIONING, element: <ProvisioningDashboardPage /> },
    { path: TENANT_ROUTES.PROVISIONING_FAILED, element: <ProvisioningDashboardPage /> },
    { path: TENANT_ROUTES.PROVISIONING_IN_PROGRESS, element: <ProvisioningDashboardPage /> },
    { path: TENANT_ROUTES.PROVISIONING_DETAIL(':id'), element: <TenantProvisioningPage /> },
    // Org-scoped provisioning detail (nested under organizations)
    { path: TENANT_ROUTES.ORGANIZATION_PROVISIONING(':id'), element: <TenantProvisioningPage /> },
];

// HELPER FUNCTION TO BUILD PATHS WITH PARAMS
export const buildTenantPath = (path, params = {}) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, String(value));
    });
    return result;
};

// NAMED EXPORTS FOR COMMON PATHS
export const TenantPaths = {
    // Dashboard
    Dashboard: TENANT_ROUTES.DASHBOARD,
    
    // Organizations
    Organizations: TENANT_ROUTES.ORGANIZATIONS,
    OrganizationCreate: TENANT_ROUTES.ORGANIZATION_CREATE,
    OrganizationDetail: (id) => buildTenantPath(TENANT_ROUTES.ORGANIZATION_DETAIL(':id'), { id }),
    OrganizationEdit: (id) => buildTenantPath(TENANT_ROUTES.ORGANIZATION_EDIT(':id'), { id }),
    OrganizationOnboard: (id) => buildTenantPath(TENANT_ROUTES.ORGANIZATION_ONBOARD(':id'), { id }),
    OrganizationUsage: (id) => buildTenantPath(TENANT_ROUTES.ORGANIZATION_USAGE(':id'), { id }),
    OrganizationProvisioning: (id) => buildTenantPath(TENANT_ROUTES.ORGANIZATION_PROVISIONING(':id'), { id }),
    
    // Domains
    Domains: TENANT_ROUTES.DOMAINS,
    DomainCreate: TENANT_ROUTES.DOMAIN_CREATE,
    DomainDetail: (id) => buildTenantPath(TENANT_ROUTES.DOMAIN_DETAIL(':id'), { id }),
    DomainEdit: (id) => buildTenantPath(TENANT_ROUTES.DOMAIN_EDIT(':id'), { id }),
    DomainVerify: (id) => buildTenantPath(TENANT_ROUTES.DOMAIN_VERIFY(':id'), { id }),
    DomainsOrganization: (orgId) => buildTenantPath(TENANT_ROUTES.DOMAINS_ORGANIZATION(':orgId'), { orgId }),
    
    // Schemas
    Schemas: TENANT_ROUTES.SCHEMAS,
    SchemaCreate: TENANT_ROUTES.SCHEMA_CREATE,
    SchemaDetail: (id) => buildTenantPath(TENANT_ROUTES.SCHEMA_DETAIL(':id'), { id }),
    SchemaProvision: (id) => buildTenantPath(TENANT_ROUTES.SCHEMA_PROVISION(':id'), { id }),
    SchemasOrganization: (orgId) => buildTenantPath(TENANT_ROUTES.SCHEMAS_ORGANIZATION(':orgId'), { orgId }),
    
    // Resources
    Resources: TENANT_ROUTES.RESOURCES,
    ResourceCreate: TENANT_ROUTES.RESOURCE_CREATE,
    ResourceDetail: (id) => buildTenantPath(TENANT_ROUTES.RESOURCE_DETAIL(':id'), { id }),
    ResourceEdit: (id) => buildTenantPath(TENANT_ROUTES.RESOURCE_EDIT(':id'), { id }),
    ResourcesOrganization: (orgId) => buildTenantPath(TENANT_ROUTES.RESOURCES_ORGANIZATION(':orgId'), { orgId }),
    ResourceDashboard: TENANT_ROUTES.RESOURCE_DASHBOARD,
    ResourceDashboardOrganization: (orgId) => buildTenantPath(TENANT_ROUTES.RESOURCE_DASHBOARD_ORGANIZATION(':orgId'), { orgId }),
    ResourceAnalytics: TENANT_ROUTES.RESOURCE_ANALYTICS,
    ResourceManage: (orgId) => `/tenant/organizations/${orgId}/resources/manage`,
    
    // Connections
    Connections: TENANT_ROUTES.CONNECTIONS,
    ConnectionDetail: (id) => buildTenantPath(TENANT_ROUTES.CONNECTION_DETAIL(':id'), { id }),
    ConnectionMetrics: TENANT_ROUTES.CONNECTION_METRICS,
    ConnectionsOrganization: (orgId) => buildTenantPath(TENANT_ROUTES.CONNECTIONS_ORGANIZATION(':orgId'), { orgId }),
    
    // Migrations
    Migrations: TENANT_ROUTES.MIGRATIONS,
    MigrationDetail: (id) => buildTenantPath(TENANT_ROUTES.MIGRATION_DETAIL(':id'), { id }),
    MigrationStats: TENANT_ROUTES.MIGRATION_STATS,
    MigrationsOrganization: (orgId) => buildTenantPath(TENANT_ROUTES.MIGRATIONS_ORGANIZATION(':orgId'), { orgId }),
    
    // Sectors
    Sectors: '/tenant/sectors',
    SectorCreate: '/tenant/sectors/create',
    SectorEdit: (id) => `/tenant/sectors/${id}/edit`,
    
    // Settings
    Settings: TENANT_ROUTES.SETTINGS,
    SettingsSection: (section) => buildTenantPath(TENANT_ROUTES.SETTINGS_SECTION(':section'), { section }),
    SystemSettings: TENANT_ROUTES.SYSTEM_SETTINGS,
    
    // Health
    Health: TENANT_ROUTES.HEALTH,
    OrganizationsHealth: TENANT_ROUTES.HEALTH_ORGANIZATIONS,
    
    // Admin
    Admin: TENANT_ROUTES.ADMIN,
    AdminOrganizations: TENANT_ROUTES.ADMIN_ORGANIZATIONS,
    AdminOrganizationDetail: (id) => buildTenantPath(TENANT_ROUTES.ADMIN_ORGANIZATION_DETAIL(':id'), { id }),

    // Provisioning
    Provisioning: TENANT_ROUTES.PROVISIONING,
    ProvisioningFailed: TENANT_ROUTES.PROVISIONING_FAILED,
    ProvisioningInProgress: TENANT_ROUTES.PROVISIONING_IN_PROGRESS,
    ProvisioningDetail: (id) => buildTenantPath(TENANT_ROUTES.PROVISIONING_DETAIL(':id'), { id }),
};

// EXPORT ROUTES
export default tenantRoutes;