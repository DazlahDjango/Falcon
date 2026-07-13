import { createSelector } from '@reduxjs/toolkit';

const initialState = {
  schemas: [],
  currentSchema: null,
  tenantSchemas: {},
  loading: false,
  loadingDetails: false,
  submitting: false,
  error: null,
  pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  filters: { organization_id: null, status: null, is_ready: null, search: '' },
  schemaStats: null,
  provisioningResult: null,
};

export const selectSchemaState = (state) => {
    return state?.schema || state?.tenant?.schema || initialState;
};

export const selectSchemas = createSelector(
  [selectSchemaState],
  (state) => state.schemas || []
);

export const selectCurrentSchema = createSelector(
  [selectSchemaState],
  (state) => state.currentSchema || null
);

export const selectSchemaLoading = createSelector(
  [selectSchemaState],
  (state) => state.loading || false
);

export const selectSchemaDetailsLoading = createSelector(
  [selectSchemaState],
  (state) => state.loadingDetails || false
);

export const selectSchemaSubmitting = createSelector(
  [selectSchemaState],
  (state) => state.submitting || false
);

export const selectSchemaError = createSelector(
  [selectSchemaState],
  (state) => state.error || null
);

export const selectSchemaPagination = createSelector(
  [selectSchemaState],
  (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectSchemaPage = createSelector(
  [selectSchemaState],
  (state) => state.pagination?.page || 1
);

export const selectSchemaTotal = createSelector(
  [selectSchemaState],
  (state) => state.pagination?.total || 0
);

export const selectSchemaTotalPages = createSelector(
  [selectSchemaPagination],
  ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectSchemaFilters = createSelector(
  [selectSchemaState],
  (state) => state.filters || { organization_id: null, status: null, is_ready: null, search: '' }
);

export const selectSchemaStats = createSelector(
  [selectSchemaState],
  (state) => state.schemaStats || null
);

export const selectProvisioningResult = createSelector(
  [selectSchemaState],
  (state) => state.provisioningResult || null
);

export const selectTenantSchemas = createSelector(
  [selectSchemaState, (state, tenantId) => tenantId],
  (state, tenantId) => state.tenantSchemas?.[tenantId] || []
);

export const selectSchemaById = createSelector(
  [selectSchemas, (state, id) => id],
  (schemas, id) => schemas.find(s => s.id === id) || null
);

export const selectActiveSchemas = createSelector(
  [selectSchemas],
  (schemas) => schemas.filter(s => s.status === 'ACTIVE')
);

export const selectPendingSchemas = createSelector(
  [selectSchemas],
  (schemas) => schemas.filter(s => s.status === 'PENDING')
);

export const selectFailedSchemas = createSelector(
  [selectSchemas],
  (schemas) => schemas.filter(s => s.status === 'FAILED')
);

export const selectReadySchemas = createSelector(
  [selectSchemas],
  (schemas) => schemas.filter(s => s.is_ready === true)
);

export const selectSchemasByOrganization = createSelector(
  [selectSchemas, (state, orgId) => orgId],
  (schemas, orgId) => schemas.filter(s => s.organization_id === orgId)
);

export const selectSchemaCount = createSelector(
  [selectSchemas],
  (schemas) => schemas.length
);

export const selectActiveSchemaCount = createSelector(
  [selectActiveSchemas],
  (active) => active.length
);

export const selectReadySchemaCount = createSelector(
  [selectReadySchemas],
  (ready) => ready.length
);

export const selectTenantSchemaCount = createSelector(
  [selectTenantSchemas],
  (schemas) => schemas.length
);

export const selectHasSchemas = createSelector(
  [selectSchemas],
  (schemas) => schemas.length > 0
);

export const selectHasTenantSchemas = createSelector(
  [selectTenantSchemas],
  (schemas) => schemas.length > 0
);