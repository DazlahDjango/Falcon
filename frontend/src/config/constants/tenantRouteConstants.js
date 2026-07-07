// ============================================
// TENANT Route Constants - Organization Management
// ============================================

export const TENANT_ROUTES = {
    // Base
    BASE: '/tenant',
    DASHBOARD: '/tenant/dashboard',
    
    // Organization Management
    ORGANIZATIONS: '/tenant/organizations',
    ORGANIZATION_CREATE: '/tenant/organizations/create',
    ORGANIZATION_DETAIL: (id = ':id') => `/tenant/organizations/${id}`,
    ORGANIZATION_EDIT: (id = ':id') => `/tenant/organizations/${id}/edit`,
    ORGANIZATION_ONBOARD: (id = ':id') => `/tenant/organizations/${id}/onboard`,
    ORGANIZATION_USAGE: (id = ':id') => `/tenant/organizations/${id}/usage`,
    ORGANIZATION_PROVISIONING: (id = ':id') => `/tenant/organizations/${id}/provisioning`,
    
    // Domain Management
    DOMAINS: '/tenant/domains',
    DOMAIN_CREATE: '/tenant/domains/create',
    DOMAIN_DETAIL: (id = ':id') => `/tenant/domains/${id}`,
    DOMAIN_EDIT: (id = ':id') => `/tenant/domains/${id}/edit`,
    DOMAIN_VERIFY: (id = ':id') => `/tenant/domains/${id}/verify`,
    DOMAINS_ORGANIZATION: (orgId = ':orgId') => `/tenant/organizations/${orgId}/domains`,
    
    // Schema Management
    SCHEMAS: '/tenant/schemas',
    SCHEMA_CREATE: '/tenant/schemas/create',
    SCHEMA_DETAIL: (id = ':id') => `/tenant/schemas/${id}`,
    SCHEMA_PROVISION: (id = ':id') => `/tenant/schemas/${id}/provision`,
    SCHEMAS_ORGANIZATION: (orgId = ':orgId') => `/tenant/organizations/${orgId}/schemas`,
    
    // Resource Management
    RESOURCES: '/tenant/resources',
    RESOURCE_CREATE: '/tenant/resources/create',
    RESOURCE_DETAIL: (id = ':id') => `/tenant/resources/${id}`,
    RESOURCE_EDIT: (id = ':id') => `/tenant/resources/${id}/edit`,
    RESOURCES_ORGANIZATION: (orgId = ':orgId') => `/tenant/organizations/${orgId}/resources`,
    RESOURCE_DASHBOARD: '/tenant/resources/dashboard',
    RESOURCE_DASHBOARD_ORGANIZATION: (orgId = ':orgId') => `/tenant/organizations/${orgId}/resources/dashboard`,
    RESOURCE_ANALYTICS: '/tenant/resources/analytics',
    
    // Connection Management
    CONNECTIONS: '/tenant/connections',
    CONNECTION_DETAIL: (id = ':id') => `/tenant/connections/${id}`,
    CONNECTION_METRICS: '/tenant/connections/metrics',
    CONNECTIONS_ORGANIZATION: (orgId = ':orgId') => `/tenant/organizations/${orgId}/connections`,
    
    // Migration Management
    MIGRATIONS: '/tenant/migrations',
    MIGRATION_DETAIL: (id = ':id') => `/tenant/migrations/${id}`,
    MIGRATION_STATS: '/tenant/migrations/stats',
    MIGRATIONS_ORGANIZATION: (orgId = ':orgId') => `/tenant/organizations/${orgId}/migrations`,
    
    // Settings
    SETTINGS: '/tenant/settings',
    SETTINGS_SECTION: (section = ':section') => `/tenant/settings/${section}`,
    SYSTEM_SETTINGS: '/tenant/system-settings',
    
    // Health
    HEALTH: '/tenant/health',
    HEALTH_ORGANIZATIONS: '/tenant/health/organizations',
    
    // Admin (Super Admin only)
    ADMIN: '/tenant/admin',
    ADMIN_ORGANIZATIONS: '/tenant/admin/organizations',
    ADMIN_ORGANIZATION_DETAIL: (id = ':id') => `/tenant/admin/organizations/${id}`,

    // Provisioning Management (Super Admin)
    PROVISIONING: '/tenant/provisioning',
    PROVISIONING_FAILED: '/tenant/provisioning/failed',
    PROVISIONING_IN_PROGRESS: '/tenant/provisioning/in-progress',
    PROVISIONING_DETAIL: (id = ':id') => `/tenant/provisioning/${id}`,
};

// Routes that should have minimal header/footer (fullscreen)
export const TENANT_MINIMAL_CHROME_PATHS = [
    TENANT_ROUTES.ORGANIZATION_ONBOARD(':id'),
    TENANT_ROUTES.ORGANIZATION_PROVISIONING(':id'),
    TENANT_ROUTES.DOMAIN_VERIFY(':id'),
    TENANT_ROUTES.SCHEMA_PROVISION(':id'),
    TENANT_ROUTES.HEALTH,
    TENANT_ROUTES.HEALTH_ORGANIZATIONS,
];

// Routes that require Super Admin permissions
export const TENANT_ADMIN_PATHS = [
    TENANT_ROUTES.ADMIN,
    TENANT_ROUTES.ADMIN_ORGANIZATIONS,
    TENANT_ROUTES.ADMIN_ORGANIZATION_DETAIL(':id'),
    TENANT_ROUTES.SYSTEM_SETTINGS,
    TENANT_ROUTES.HEALTH,
    TENANT_ROUTES.HEALTH_ORGANIZATIONS,
    TENANT_ROUTES.PROVISIONING,
    TENANT_ROUTES.PROVISIONING_FAILED,
    TENANT_ROUTES.PROVISIONING_IN_PROGRESS,
    TENANT_ROUTES.PROVISIONING_DETAIL(':id'),
];

// Routes that are read-only (Client Admin)
export const TENANT_READONLY_PATHS = [
    TENANT_ROUTES.DASHBOARD,
    TENANT_ROUTES.ORGANIZATIONS,
    TENANT_ROUTES.ORGANIZATION_DETAIL(':id'),
    TENANT_ROUTES.ORGANIZATION_USAGE(':id'),
    TENANT_ROUTES.DOMAINS,
    TENANT_ROUTES.DOMAIN_DETAIL(':id'),
    TENANT_ROUTES.RESOURCES,
    TENANT_ROUTES.RESOURCE_DETAIL(':id'),
    TENANT_ROUTES.CONNECTIONS,
    TENANT_ROUTES.CONNECTION_DETAIL(':id'),
    TENANT_ROUTES.CONNECTION_METRICS,
    TENANT_ROUTES.MIGRATIONS,
    TENANT_ROUTES.MIGRATION_DETAIL(':id'),
    TENANT_ROUTES.MIGRATION_STATS,
    TENANT_ROUTES.SETTINGS,
];

// Helper function to build tenant paths with params
export const buildTenantPath = (path, params = {}) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, String(value));
    });
    return result;
};

// ============================================
// TENANT Breadcrumb Constants
// ============================================

export const TENANT_BREADCRUMBS = {
    [TENANT_ROUTES.DASHBOARD]: 'Dashboard',
    [TENANT_ROUTES.ORGANIZATIONS]: 'Organizations',
    [TENANT_ROUTES.ORGANIZATION_CREATE]: 'Create Organization',
    [TENANT_ROUTES.ORGANIZATION_DETAIL(':id')]: 'Organization Details',
    [TENANT_ROUTES.ORGANIZATION_EDIT(':id')]: 'Edit Organization',
    [TENANT_ROUTES.ORGANIZATION_ONBOARD(':id')]: 'Onboard Organization',
    [TENANT_ROUTES.ORGANIZATION_USAGE(':id')]: 'Resource Usage',
    [TENANT_ROUTES.DOMAINS]: 'Domains',
    [TENANT_ROUTES.DOMAIN_CREATE]: 'Add Domain',
    [TENANT_ROUTES.DOMAIN_DETAIL(':id')]: 'Domain Details',
    [TENANT_ROUTES.SCHEMAS]: 'Schemas',
    [TENANT_ROUTES.SCHEMA_CREATE]: 'Create Schema',
    [TENANT_ROUTES.RESOURCES]: 'Resources',
    [TENANT_ROUTES.RESOURCE_CREATE]: 'Create Resource',
    [TENANT_ROUTES.RESOURCE_DASHBOARD]: 'Resource Dashboard',
    [TENANT_ROUTES.RESOURCE_ANALYTICS]: 'Resource Analytics',
    [TENANT_ROUTES.CONNECTIONS]: 'Connections',
    [TENANT_ROUTES.CONNECTION_METRICS]: 'Connection Metrics',
    [TENANT_ROUTES.MIGRATIONS]: 'Migrations',
    [TENANT_ROUTES.SETTINGS]: 'Settings',
    [TENANT_ROUTES.SYSTEM_SETTINGS]: 'System Settings',
    [TENANT_ROUTES.HEALTH]: 'Health Check',
    [TENANT_ROUTES.ADMIN_ORGANIZATIONS]: 'Admin - Organizations',
    [TENANT_ROUTES.PROVISIONING]: 'Provisioning Dashboard',
    [TENANT_ROUTES.PROVISIONING_FAILED]: 'Failed Provisionings',
    [TENANT_ROUTES.PROVISIONING_IN_PROGRESS]: 'In-Progress Provisionings',
    [TENANT_ROUTES.PROVISIONING_DETAIL(':id')]: 'Provisioning Detail',
};

// ============================================
// TENANT Navigation Items
// ============================================

export const TENANT_NAV_ITEMS = {
    SUPER_ADMIN: [
        { label: 'Dashboard', path: TENANT_ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
        { label: 'Organizations', path: TENANT_ROUTES.ADMIN_ORGANIZATIONS, icon: 'Building2' },
        { label: 'Provisioning', path: TENANT_ROUTES.PROVISIONING, icon: 'Boxes' },
        { label: 'Domains', path: TENANT_ROUTES.DOMAINS, icon: 'Globe' },
        { label: 'Resources', path: TENANT_ROUTES.RESOURCES, icon: 'Database' },
        { label: 'Resource Dashboard', path: TENANT_ROUTES.RESOURCE_DASHBOARD, icon: 'BarChart2' },
        { label: 'Connections', path: TENANT_ROUTES.CONNECTIONS, icon: 'Link' },
        { label: 'Migrations', path: TENANT_ROUTES.MIGRATIONS, icon: 'ArrowRightLeft' },
        { label: 'System Settings', path: TENANT_ROUTES.SYSTEM_SETTINGS, icon: 'Settings' },
        { label: 'Health', path: TENANT_ROUTES.HEALTH, icon: 'Activity' },
    ],
    CLIENT_ADMIN: [
        { label: 'Dashboard', path: TENANT_ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
        { label: 'Organization', path: TENANT_ROUTES.ORGANIZATIONS, icon: 'Building2' },
        { label: 'Domains', path: TENANT_ROUTES.DOMAINS, icon: 'Globe' },
        { label: 'Resources', path: TENANT_ROUTES.RESOURCES, icon: 'Database' },
        { label: 'Resource Dashboard', path: TENANT_ROUTES.RESOURCE_DASHBOARD, icon: 'BarChart2' },
        { label: 'Settings', path: TENANT_ROUTES.SETTINGS, icon: 'Settings' },
    ],
};

// ============================================
// Legacy Redirects
// ============================================

export const LEGACY_TENANT_REDIRECTS = [
    ['/app/tenant', TENANT_ROUTES.DASHBOARD],
    ['/app/tenant/admin', TENANT_ROUTES.ADMIN],
    ['/app/tenant/orgs', TENANT_ROUTES.ORGANIZATIONS],
    ['/app/tenant/orgs/create', TENANT_ROUTES.ORGANIZATION_CREATE],
    ['/app/tenant/domains', TENANT_ROUTES.DOMAINS],
    ['/app/tenant/schemas', TENANT_ROUTES.SCHEMAS],
    ['/app/tenant/resources', TENANT_ROUTES.RESOURCES],
    ['/app/tenant/connections', TENANT_ROUTES.CONNECTIONS],
    ['/app/tenant/migrations', TENANT_ROUTES.MIGRATIONS],
    ['/app/tenant/settings', TENANT_ROUTES.SETTINGS],
    ['/app/tenant/health', TENANT_ROUTES.HEALTH],
];

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
    TENANT_ROUTES,
    TENANT_MINIMAL_CHROME_PATHS,
    TENANT_ADMIN_PATHS,
    TENANT_READONLY_PATHS,
    TENANT_BREADCRUMBS,
    TENANT_NAV_ITEMS,
    buildTenantPath,
    LEGACY_TENANT_REDIRECTS,
};