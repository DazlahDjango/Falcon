import { createSelector } from '@reduxjs/toolkit';

const initialState = {
  superAdminDashboard: null,
  clientAdminDashboard: null,
  organizationStats: null,
  loading: false,
  error: null,
  lastFetched: null,
};

export const selectDashboardState = (state) => {
    return state?.dashboard || state?.tenant?.dashboard || initialState;
};

export const selectSuperAdminDashboard = createSelector(
  [selectDashboardState],
  (state) => state.superAdminDashboard || null
);

export const selectClientAdminDashboard = createSelector(
  [selectDashboardState],
  (state) => state.clientAdminDashboard || null
);

export const selectOrganizationStats = createSelector(
  [selectDashboardState],
  (state) => state.organizationStats || null
);

export const selectDashboardLoading = createSelector(
  [selectDashboardState],
  (state) => state.loading || false
);

export const selectDashboardError = createSelector(
  [selectDashboardState],
  (state) => state.error || null
);

export const selectDashboardLastFetched = createSelector(
  [selectDashboardState],
  (state) => state.lastFetched || null
);

export const selectSuperAdminOrganizationsStats = createSelector(
  [selectSuperAdminDashboard],
  (dashboard) => dashboard?.organizations || null
);

export const selectSuperAdminDomainStats = createSelector(
  [selectSuperAdminDashboard],
  (dashboard) => dashboard?.domains || null
);

export const selectSuperAdminResourceStats = createSelector(
  [selectSuperAdminDashboard],
  (dashboard) => dashboard?.resources || null
);

export const selectSuperAdminTotalUsers = createSelector(
  [selectSuperAdminDashboard],
  (dashboard) => dashboard?.total_users || 0
);

export const selectSuperAdminSystemHealth = createSelector(
  [selectSuperAdminDashboard],
  (dashboard) => dashboard?.system_health || null
);

export const selectSuperAdminRecentOrganizations = createSelector(
  [selectSuperAdminDashboard],
  (dashboard) => dashboard?.recent_organizations || []
);

export const selectClientAdminOrganization = createSelector(
  [selectClientAdminDashboard],
  (dashboard) => dashboard?.organization || null
);

export const selectClientAdminTotalUsers = createSelector(
  [selectClientAdminDashboard],
  (dashboard) => dashboard?.total_users || 0
);

export const selectClientAdminTotalDomains = createSelector(
  [selectClientAdminDashboard],
  (dashboard) => dashboard?.total_domains || 0
);

export const selectClientAdminDomainStatus = createSelector(
  [selectClientAdminDashboard],
  (dashboard) => dashboard?.domains_status || null
);

export const selectClientAdminResourceUsage = createSelector(
  [selectClientAdminDashboard],
  (dashboard) => dashboard?.resource_usage || []
);

export const selectClientAdminRecentActivity = createSelector(
  [selectClientAdminDashboard],
  (dashboard) => dashboard?.recent_activity || []
);

export const selectOrganizationStatsData = createSelector(
  [selectOrganizationStats],
  (stats) => stats?.data || null
);

export const selectIsDashboardLoading = createSelector(
  [selectDashboardLoading],
  (loading) => loading
);

export const selectHasDashboardError = createSelector(
  [selectDashboardError],
  (error) => error !== null
);

export const selectDashboardIsStale = createSelector(
  [selectDashboardLastFetched],
  (lastFetched) => {
    if (!lastFetched) return true;
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - lastFetched > fiveMinutes;
  }
);