import { createSelector } from '@reduxjs/toolkit';


// ============================================================
// FALLBACK STATE
// ============================================================

const initialState = {
  superAdminDashboard: null,
  clientAdminDashboard: null,

  superAdminLoading: false,
  clientAdminLoading: false,

  loading: false,
  error: null,

  lastFetched: {
    superAdmin: null,
    clientAdmin: null,
  },
};


// ============================================================
// ROOT DASHBOARD STATE
// ============================================================

export const selectDashboardState = (state) => {
  return (
    state?.dashboard ||
    state?.tenant?.dashboard ||
    initialState
  );
};


// ============================================================
// MAIN DASHBOARDS
// ============================================================

export const selectSuperAdminDashboard = createSelector(
  [selectDashboardState],
  (state) => state.superAdminDashboard
);


export const selectClientAdminDashboard = createSelector(
  [selectDashboardState],
  (state) => state.clientAdminDashboard
);


// ============================================================
// GENERAL STATE
// ============================================================

export const selectDashboardLoading = createSelector(
  [selectDashboardState],
  (state) => state.loading
);


export const selectDashboardError = createSelector(
  [selectDashboardState],
  (state) => state.error
);


// ============================================================
// SPECIFIC LOADING STATES
// ============================================================

export const selectSuperAdminDashboardLoading =
  createSelector(
    [selectDashboardState],
    (state) => state.superAdminLoading
  );


export const selectClientAdminDashboardLoading =
  createSelector(
    [selectDashboardState],
    (state) => state.clientAdminLoading
  );


// ============================================================
// LAST FETCHED
// ============================================================

export const selectSuperAdminLastFetched =
  createSelector(
    [selectDashboardState],
    (state) => state.lastFetched?.superAdmin || null
  );


export const selectClientAdminLastFetched =
  createSelector(
    [selectDashboardState],
    (state) => state.lastFetched?.clientAdmin || null
  );


// ============================================================
// SUPER ADMIN — ORGANIZATIONS
// ============================================================

export const selectSuperAdminOrganizations =
  createSelector(
    [selectSuperAdminDashboard],
    (dashboard) => dashboard?.organizations || null
  );


export const selectSuperAdminTotalOrganizations =
  createSelector(
    [selectSuperAdminOrganizations],
    (organizations) => organizations?.total || 0
  );


export const selectSuperAdminActiveOrganizations =
  createSelector(
    [selectSuperAdminOrganizations],
    (organizations) => organizations?.active || 0
  );


export const selectSuperAdminInactiveOrganizations =
  createSelector(
    [selectSuperAdminOrganizations],
    (organizations) => organizations?.inactive || 0
  );


export const selectSuperAdminOnboardedOrganizations =
  createSelector(
    [selectSuperAdminOrganizations],
    (organizations) => organizations?.onboarded || 0
  );


export const selectSuperAdminPendingOrganizations =
  createSelector(
    [selectSuperAdminOrganizations],
    (organizations) => organizations?.pending || 0
  );


export const selectSuperAdminProvisioningOrganizations =
  createSelector(
    [selectSuperAdminOrganizations],
    (organizations) => organizations?.provisioning || 0
  );


export const selectSuperAdminSuspendedOrganizations =
  createSelector(
    [selectSuperAdminOrganizations],
    (organizations) => organizations?.suspended || 0
  );


export const selectSuperAdminFailedOrganizations =
  createSelector(
    [selectSuperAdminOrganizations],
    (organizations) => organizations?.failed || 0
  );


// ============================================================
// SUPER ADMIN — DISTRIBUTIONS
// ============================================================

export const selectSuperAdminStatusDistribution =
  createSelector(
    [selectSuperAdminDashboard],
    (dashboard) =>
      dashboard?.status_distribution || []
  );


export const selectSuperAdminSectorDistribution =
  createSelector(
    [selectSuperAdminDashboard],
    (dashboard) =>
      dashboard?.sector_distribution || []
  );


export const selectSuperAdminSubscriptionDistribution =
  createSelector(
    [selectSuperAdminDashboard],
    (dashboard) =>
      dashboard?.subscription_distribution || []
  );


// ============================================================
// SUPER ADMIN — USERS
// ============================================================

export const selectSuperAdminUsers =
  createSelector(
    [selectSuperAdminDashboard],
    (dashboard) => dashboard?.users || null
  );


export const selectSuperAdminTotalUsers =
  createSelector(
    [selectSuperAdminUsers],
    (users) => users?.total || 0
  );


export const selectSuperAdminActiveUsers =
  createSelector(
    [selectSuperAdminUsers],
    (users) => users?.active || 0
  );


export const selectSuperAdminInactiveUsers =
  createSelector(
    [selectSuperAdminUsers],
    (users) => users?.inactive || 0
  );


export const selectSuperAdminVerifiedUsers =
  createSelector(
    [selectSuperAdminUsers],
    (users) => users?.verified || 0
  );


export const selectSuperAdminOnboardedUsers =
  createSelector(
    [selectSuperAdminUsers],
    (users) => users?.onboarded || 0
  );


export const selectSuperAdminUserRoleDistribution =
  createSelector(
    [selectSuperAdminUsers],
    (users) =>
      users?.role_distribution || []
  );


// ============================================================
// SUPER ADMIN — PROVISIONING
// ============================================================

export const selectSuperAdminProvisioning =
  createSelector(
    [selectSuperAdminDashboard],
    (dashboard) =>
      dashboard?.provisioning || null
  );


export const selectSuperAdminProvisioningProgress =
  createSelector(
    [selectSuperAdminProvisioning],
    (provisioning) =>
      provisioning?.completion_percentage || 0
  );


// ============================================================
// SUPER ADMIN — TENANT ISOLATION
// ============================================================

export const selectSuperAdminTenantIsolation =
  createSelector(
    [selectSuperAdminDashboard],
    (dashboard) =>
      dashboard?.tenant_isolation || null
  );


export const selectSuperAdminTotalSchemas =
  createSelector(
    [selectSuperAdminTenantIsolation],
    (isolation) =>
      isolation?.total_schemas || 0
  );


export const selectSuperAdminReadySchemas =
  createSelector(
    [selectSuperAdminTenantIsolation],
    (isolation) =>
      isolation?.ready_schemas || 0
  );


export const selectSuperAdminActiveSchemas =
  createSelector(
    [selectSuperAdminTenantIsolation],
    (isolation) =>
      isolation?.active_schemas || 0
  );


export const selectSuperAdminSchemaReadiness =
  createSelector(
    [selectSuperAdminTenantIsolation],
    (isolation) =>
      isolation?.schema_readiness_percentage || 0
  );


// ============================================================
// SUPER ADMIN — DOMAINS
// ============================================================

export const selectSuperAdminDomains =
  createSelector(
    [selectSuperAdminDashboard],
    (dashboard) =>
      dashboard?.domains || null
  );


export const selectSuperAdminTotalDomains =
  createSelector(
    [selectSuperAdminDomains],
    (domains) => domains?.total || 0
  );


export const selectSuperAdminActiveDomains =
  createSelector(
    [selectSuperAdminDomains],
    (domains) => domains?.active || 0
  );


export const selectSuperAdminVerifyingDomains =
  createSelector(
    [selectSuperAdminDomains],
    (domains) => domains?.verifying || 0
  );


export const selectSuperAdminPrimaryDomains =
  createSelector(
    [selectSuperAdminDomains],
    (domains) => domains?.primary || 0
  );


// ============================================================
// SUPER ADMIN — CONNECTIONS
// ============================================================

export const selectSuperAdminConnections =
  createSelector(
    [selectSuperAdminDashboard],
    (dashboard) =>
      dashboard?.connections || null
  );


export const selectSuperAdminTotalConnections =
  createSelector(
    [selectSuperAdminConnections],
    (connections) => connections?.total || 0
  );


export const selectSuperAdminConnectedConnections =
  createSelector(
    [selectSuperAdminConnections],
    (connections) => connections?.connected || 0
  );


export const selectSuperAdminDisconnectedConnections =
  createSelector(
    [selectSuperAdminConnections],
    (connections) => connections?.disconnected || 0
  );


export const selectSuperAdminConnectionStatusDistribution =
  createSelector(
    [selectSuperAdminConnections],
    (connections) =>
      connections?.status_distribution || []
  );


// ============================================================
// SUPER ADMIN — RESOURCES
// ============================================================

export const selectSuperAdminResources =
  createSelector(
    [selectSuperAdminDashboard],
    (dashboard) =>
      dashboard?.resources || null
  );


export const selectSuperAdminTotalResources =
  createSelector(
    [selectSuperAdminResources],
    (resources) => resources?.total || 0
  );


export const selectSuperAdminWarningResources =
  createSelector(
    [selectSuperAdminResources],
    (resources) => resources?.warning || 0
  );


export const selectSuperAdminExceededResources =
  createSelector(
    [selectSuperAdminResources],
    (resources) => resources?.exceeded || 0
  );


export const selectSuperAdminResourceUsage =
  createSelector(
    [selectSuperAdminResources],
    (resources) => resources?.usage || []
  );


// ============================================================
// SUPER ADMIN — MIGRATIONS
// ============================================================

export const selectSuperAdminMigrations =
  createSelector(
    [selectSuperAdminDashboard],
    (dashboard) =>
      dashboard?.migrations || null
  );


export const selectSuperAdminMigrationStats =
  createSelector(
    [selectSuperAdminMigrations],
    (migrations) => migrations || {}
  );


// ============================================================
// SUPER ADMIN — HEALTH
// ============================================================

export const selectSuperAdminHealth =
  createSelector(
    [selectSuperAdminDashboard],
    (dashboard) =>
      dashboard?.health || null
  );


export const selectSuperAdminHealthStatus =
  createSelector(
    [selectSuperAdminHealth],
    (health) =>
      health?.status || 'UNKNOWN'
  );


export const selectSuperAdminHealthyOrganizations =
  createSelector(
    [selectSuperAdminHealth],
    (health) =>
      health?.healthy || 0
  );


export const selectSuperAdminUnhealthyOrganizations =
  createSelector(
    [selectSuperAdminHealth],
    (health) =>
      health?.unhealthy || 0
  );


// ============================================================
// SUPER ADMIN — RECENT ORGANIZATIONS
// ============================================================

export const selectSuperAdminRecentOrganizations =
  createSelector(
    [selectSuperAdminDashboard],
    (dashboard) =>
      dashboard?.recent_organizations || []
  );


// ============================================================
// CLIENT ADMIN — ORGANIZATION
// ============================================================

export const selectClientAdminOrganization =
  createSelector(
    [selectClientAdminDashboard],
    (dashboard) =>
      dashboard?.organization || null
  );


export const selectClientAdminOrganizationId =
  createSelector(
    [selectClientAdminOrganization],
    (organization) =>
      organization?.id || null
  );


export const selectClientAdminOrganizationName =
  createSelector(
    [selectClientAdminOrganization],
    (organization) =>
      organization?.name || ''
  );


export const selectClientAdminOrganizationStatus =
  createSelector(
    [selectClientAdminOrganization],
    (organization) =>
      organization?.status || null
  );


export const selectClientAdminOrganizationActive =
  createSelector(
    [selectClientAdminOrganization],
    (organization) =>
      organization?.is_active || false
  );


export const selectClientAdminOrganizationOnboarded =
  createSelector(
    [selectClientAdminOrganization],
    (organization) =>
      organization?.is_onboarded || false
  );


// ============================================================
// CLIENT ADMIN — USERS
// ============================================================

export const selectClientAdminUsers =
  createSelector(
    [selectClientAdminDashboard],
    (dashboard) =>
      dashboard?.users || null
  );


export const selectClientAdminTotalUsers =
  createSelector(
    [selectClientAdminUsers],
    (users) => users?.total || 0
  );


export const selectClientAdminActiveUsers =
  createSelector(
    [selectClientAdminUsers],
    (users) => users?.active || 0
  );


export const selectClientAdminInactiveUsers =
  createSelector(
    [selectClientAdminUsers],
    (users) => users?.inactive || 0
  );


export const selectClientAdminVerifiedUsers =
  createSelector(
    [selectClientAdminUsers],
    (users) => users?.verified || 0
  );


export const selectClientAdminOnboardedUsers =
  createSelector(
    [selectClientAdminUsers],
    (users) => users?.onboarded || 0
  );


export const selectClientAdminMfaEnabledUsers =
  createSelector(
    [selectClientAdminUsers],
    (users) => users?.mfa_enabled || 0
  );


export const selectClientAdminUserRoleDistribution =
  createSelector(
    [selectClientAdminUsers],
    (users) =>
      users?.role_distribution || []
  );


// ============================================================
// CLIENT ADMIN — DOMAINS
// ============================================================

export const selectClientAdminDomains =
  createSelector(
    [selectClientAdminDashboard],
    (dashboard) =>
      dashboard?.domains || null
  );


export const selectClientAdminTotalDomains =
  createSelector(
    [selectClientAdminDomains],
    (domains) => domains?.total || 0
  );


export const selectClientAdminActiveDomains =
  createSelector(
    [selectClientAdminDomains],
    (domains) => domains?.active || 0
  );


export const selectClientAdminVerifyingDomains =
  createSelector(
    [selectClientAdminDomains],
    (domains) => domains?.verifying || 0
  );


export const selectClientAdminPrimaryDomains =
  createSelector(
    [selectClientAdminDomains],
    (domains) => domains?.primary || 0
  );


export const selectClientAdminDomainItems =
  createSelector(
    [selectClientAdminDomains],
    (domains) => domains?.items || []
  );


// ============================================================
// CLIENT ADMIN — RESOURCES
// ============================================================

export const selectClientAdminResources =
  createSelector(
    [selectClientAdminDashboard],
    (dashboard) =>
      dashboard?.resources || null
  );


export const selectClientAdminResourceUsage =
  createSelector(
    [selectClientAdminResources],
    (resources) =>
      resources?.resources || []
  );


export const selectClientAdminWarningResources =
  createSelector(
    [selectClientAdminResources],
    (resources) =>
      resources?.warning || 0
  );


export const selectClientAdminExceededResources =
  createSelector(
    [selectClientAdminResources],
    (resources) =>
      resources?.exceeded || 0
  );


// ============================================================
// CLIENT ADMIN — TENANT ISOLATION
// ============================================================

export const selectClientAdminTenantIsolation =
  createSelector(
    [selectClientAdminDashboard],
    (dashboard) =>
      dashboard?.tenant_isolation || null
  );


export const selectClientAdminTotalSchemas =
  createSelector(
    [selectClientAdminTenantIsolation],
    (isolation) =>
      isolation?.total || 0
  );


export const selectClientAdminReadySchemas =
  createSelector(
    [selectClientAdminTenantIsolation],
    (isolation) =>
      isolation?.ready || 0
  );


export const selectClientAdminActiveSchemas =
  createSelector(
    [selectClientAdminTenantIsolation],
    (isolation) =>
      isolation?.active || 0
  );


export const selectClientAdminSchemas =
  createSelector(
    [selectClientAdminTenantIsolation],
    (isolation) =>
      isolation?.schemas || []
  );


// ============================================================
// CLIENT ADMIN — CONNECTIONS
// ============================================================

export const selectClientAdminConnections =
  createSelector(
    [selectClientAdminDashboard],
    (dashboard) =>
      dashboard?.connections || null
  );


export const selectClientAdminTotalConnections =
  createSelector(
    [selectClientAdminConnections],
    (connections) =>
      connections?.total || 0
  );


export const selectClientAdminConnectionItems =
  createSelector(
    [selectClientAdminConnections],
    (connections) =>
      connections?.items || []
  );


// ============================================================
// CLIENT ADMIN — PROVISIONING
// ============================================================

export const selectClientAdminProvisioning =
  createSelector(
    [selectClientAdminDashboard],
    (dashboard) =>
      dashboard?.provisioning || null
  );


export const selectClientAdminProvisioningProgress =
  createSelector(
    [selectClientAdminProvisioning],
    (provisioning) =>
      provisioning?.progress || 0
  );


export const selectClientAdminProvisioningStatus =
  createSelector(
    [selectClientAdminProvisioning],
    (provisioning) =>
      provisioning?.status || null
  );


export const selectClientAdminProvisioningStep =
  createSelector(
    [selectClientAdminProvisioning],
    (provisioning) =>
      provisioning?.current_step || null
  );


// ============================================================
// CLIENT ADMIN — MIGRATIONS
// ============================================================

export const selectClientAdminMigrations =
  createSelector(
    [selectClientAdminDashboard],
    (dashboard) =>
      dashboard?.migrations || null
  );


// ============================================================
// CLIENT ADMIN — HEALTH
// ============================================================

export const selectClientAdminHealth =
  createSelector(
    [selectClientAdminDashboard],
    (dashboard) =>
      dashboard?.health || null
  );


export const selectClientAdminHealthStatus =
  createSelector(
    [selectClientAdminHealth],
    (health) =>
      health?.status || 'UNKNOWN'
  );


export const selectClientAdminHealthChecks =
  createSelector(
    [selectClientAdminHealth],
    (health) =>
      health?.checks || {}
  );


// ============================================================
// GENERAL HELPERS
// ============================================================

export const selectIsDashboardLoading = createSelector(
  [selectDashboardLoading],
  (loading) => loading
);


export const selectHasDashboardError = createSelector(
  [selectDashboardError],
  (error) => error !== null
);


export const selectSuperAdminDashboardIsStale =
  createSelector(
    [selectSuperAdminLastFetched],
    (lastFetched) => {
      if (!lastFetched) return true;

      const fiveMinutes =
        5 * 60 * 1000;

      return (
        Date.now() - lastFetched >
        fiveMinutes
      );
    }
  );


export const selectClientAdminDashboardIsStale =
  createSelector(
    [selectClientAdminLastFetched],
    (lastFetched) => {
      if (!lastFetched) return true;

      const fiveMinutes =
        5 * 60 * 1000;

      return (
        Date.now() - lastFetched >
        fiveMinutes
      );
    }
  );


// ============================================================
// BACKWARD COMPATIBILITY ALIASES
// ============================================================

export const selectSuperAdminOrganizationsStats = selectSuperAdminOrganizations;
export const selectSuperAdminDomainStats = selectSuperAdminDomains;
export const selectSuperAdminResourceStats = selectSuperAdminResources;
export const selectSuperAdminSystemHealth = selectSuperAdminHealth;
export const selectClientAdminDomainStatus = selectClientAdminDomains;
export const selectClientAdminRecentActivity = selectClientAdminConnectionItems;
export const selectOrganizationStats = () => null;
export const selectOrganizationStatsData = () => null;

export const selectDashboardLastFetched = createSelector(
  [selectDashboardState],
  (state) => state.lastFetched?.superAdmin || state.lastFetched?.clientAdmin || null
);

export const selectDashboardIsStale = selectSuperAdminDashboardIsStale;