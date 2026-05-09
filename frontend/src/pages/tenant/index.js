// frontend/src/pages/tenant/index.js

// ============ Core Tenant Pages ============
export { TenantListPage } from './TenantListPage';
export { TenantDetailPage } from './TenantDetailPage';
export { TenantCreatePage } from './TenantCreatePage';
export { TenantEditPage } from './TenantEditPage';
export { TenantSettingsPage } from './TenantSettingsPage';
export { TenantResourcesPage } from './TenantResourcesPage';
export { TenantUsagePage } from './TenantUsagePage';  // ✅ Fixed: removed 'default'
export { TenantDashboardPage } from './TenantDashboardPage';  // ✅ Fixed: export as named
export { TenantProvisioningPage } from './TenantProvisioningPage';
export { TenantAuditPage } from './TenantAuditPage';

// ============ Domain & Backup Pages ============
export { TenantDomainsPage } from './TenantDomainsPage';
export { TenantBackupsPage } from './TenantBackupsPage';

// ============ Migration & Schema Pages ============
export { TenantMigrationsPage } from './TenantMigrationsPage';
export { TenantSchemaPage } from './TenantSchemaPage';

// ============ Connection Pages ============
export { ConnectionDashboardPage } from './connections/ConnectionDashboardPage';
export { ConnectionMetricsPage } from './connections/ConnectionMetricsPage';  // ✅ ADD THIS
export { ConnectionHealthPage } from './connections/ConnectionHealthPage';    // ✅ ADD THIS
export { TenantConnectionsPage } from './connections/TenantConnectionsPage';

// ============ Optional: Default export for convenience ============
export default {
    TenantListPage,
    TenantDetailPage,
    TenantCreatePage,
    TenantEditPage,
    TenantSettingsPage,
    TenantResourcesPage,
    TenantUsagePage,
    TenantDashboardPage,
    TenantProvisioningPage,
    TenantAuditPage,
    TenantDomainsPage,
    TenantBackupsPage,
    TenantMigrationsPage,
    TenantSchemaPage,
    ConnectionDashboardPage,
    ConnectionMetricsPage,
    ConnectionHealthPage,
    TenantConnectionsPage,
};