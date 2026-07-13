import { createSelector } from '@reduxjs/toolkit';

const initialState = {
  health: null,
  organizationsHealth: null,
  loading: false,
  error: null,
  lastChecked: null,
};
export const selectHealthState = (state) => {
    return state?.health || state?.tenant?.health || initialState;
};

export const selectHealth = createSelector(
  [selectHealthState],
  (state) => state.health || null
);

export const selectOrganizationsHealth = createSelector(
  [selectHealthState],
  (state) => state.organizationsHealth || null
);

export const selectHealthLoading = createSelector(
  [selectHealthState],
  (state) => state.loading || false
);

export const selectHealthError = createSelector(
  [selectHealthState],
  (state) => state.error || null
);

export const selectHealthLastChecked = createSelector(
  [selectHealthState],
  (state) => state.lastChecked || null
);

export const selectDatabaseHealth = createSelector(
  [selectHealth],
  (health) => health?.database || null
);

export const selectSchemaHealth = createSelector(
  [selectHealth],
  (health) => health?.schemas || null
);

export const selectOrganizationHealth = createSelector(
  [selectHealth],
  (health) => health?.organizations || null
);

export const selectIsDatabaseHealthy = createSelector(
  [selectDatabaseHealth],
  (db) => db?.status === 'healthy'
);

export const selectIsSchemaHealthy = createSelector(
  [selectSchemaHealth],
  (schema) => schema?.status === 'healthy'
);

export const selectIsOrganizationHealthy = createSelector(
  [selectOrganizationHealth],
  (org) => org?.status === 'healthy'
);

export const selectIsOverallHealthy = createSelector(
  [selectIsDatabaseHealthy, selectIsSchemaHealthy, selectIsOrganizationHealthy],
  (db, schema, org) => db && schema && org
);

export const selectOrganizationsHealthList = createSelector(
  [selectOrganizationsHealth],
  (health) => health?.organizations || []
);

export const selectTotalOrganizationsHealth = createSelector(
  [selectOrganizationsHealth],
  (health) => health?.total || 0
);

export const selectHealthyOrganizationsCount = createSelector(
  [selectOrganizationsHealth],
  (health) => health?.healthy || 0
);

export const selectUnhealthyOrganizationsCount = createSelector(
  [selectOrganizationsHealth],
  (health) => health?.unhealthy || 0
);

export const selectUnhealthyOrganizations = createSelector(
  [selectOrganizationsHealthList],
  (organizations) => organizations.filter(o => o.status === 'unhealthy')
);

export const selectHealthyOrganizations = createSelector(
  [selectOrganizationsHealthList],
  (organizations) => organizations.filter(o => o.status === 'healthy')
);

export const selectHasHealthData = createSelector(
  [selectHealth],
  (health) => health !== null
);

export const selectHasOrganizationsHealthData = createSelector(
  [selectOrganizationsHealth],
  (health) => health !== null
);

export const selectHealthIsStale = createSelector(
  [selectHealthLastChecked],
  (lastChecked) => {
    if (!lastChecked) return true;
    const oneMinute = 60 * 1000;
    return Date.now() - lastChecked > oneMinute;
  }
);

export const selectHealthSummary = createSelector(
  [selectIsOverallHealthy, selectDatabaseHealth, selectSchemaHealth, selectOrganizationHealth],
  (overall, db, schema, org) => ({
    overall,
    database: db?.status || 'unknown',
    schema: schema?.status || 'unknown',
    organization: org?.status || 'unknown',
  })
);