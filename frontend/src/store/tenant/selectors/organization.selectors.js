import { createSelector } from '@reduxjs/toolkit';

const initialState = {
  organizations: [],
  currentOrganization: null,
  adminOrganizations: [],
  loading: false,
  loadingDetails: false,
  submitting: false,
  error: null,
  pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  filters: { status: null, is_active: null, is_onboarded: null, sector_id: null, subscription_tier: null, search: '' },
  usageSummary: null,
  provisioningStatus: null,
  adminPagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  adminFilters: { status: null, is_active: null, is_onboarded: null, search: '' },
};

export const selectOrganizationState = (state) => {
    return state?.organization || state?.tenant?.organization || initialState;
};

export const selectOrganizations = createSelector(
  [selectOrganizationState],
  (state) => state.organizations || []
);

export const selectCurrentOrganization = createSelector(
  [selectOrganizationState],
  (state) => state.currentOrganization || null
);

export const selectAdminOrganizations = createSelector(
  [selectOrganizationState],
  (state) => state.adminOrganizations || []
);

export const selectOrganizationLoading = createSelector(
  [selectOrganizationState],
  (state) => state.loading || false
);

export const selectOrganizationDetailsLoading = createSelector(
  [selectOrganizationState],
  (state) => state.loadingDetails || false
);

export const selectOrganizationSubmitting = createSelector(
  [selectOrganizationState],
  (state) => state.submitting || false
);

export const selectOrganizationError = createSelector(
  [selectOrganizationState],
  (state) => state.error || null
);

export const selectOrganizationPagination = createSelector(
  [selectOrganizationState],
  (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectOrganizationPage = createSelector(
  [selectOrganizationState],
  (state) => state.pagination?.page || 1
);

export const selectOrganizationPageSize = createSelector(
  [selectOrganizationState],
  (state) => state.pagination?.pageSize || 20
);

export const selectOrganizationTotal = createSelector(
  [selectOrganizationState],
  (state) => state.pagination?.total || 0
);

export const selectOrganizationTotalPages = createSelector(
  [selectOrganizationPagination],
  ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectOrganizationFilters = createSelector(
  [selectOrganizationState],
  (state) => state.filters || { status: null, is_active: null, is_onboarded: null, sector_id: null, subscription_tier: null, search: '' }
);

export const selectAdminPagination = createSelector(
  [selectOrganizationState],
  (state) => state.adminPagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectAdminPage = createSelector(
  [selectOrganizationState],
  (state) => state.adminPagination?.page || 1
);

export const selectAdminTotal = createSelector(
  [selectOrganizationState],
  (state) => state.adminPagination?.total || 0
);

export const selectAdminTotalPages = createSelector(
  [selectAdminPagination],
  ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectAdminFilters = createSelector(
  [selectOrganizationState],
  (state) => state.adminFilters || { status: null, is_active: null, is_onboarded: null, search: '' }
);

export const selectUsageSummary = createSelector(
  [selectOrganizationState],
  (state) => state.usageSummary || null
);

export const selectProvisioningStatus = createSelector(
  [selectOrganizationState],
  (state) => state.provisioningStatus || null
);

export const selectOrganizationById = createSelector(
  [selectOrganizations, (state, id) => id],
  (organizations, id) => organizations.find(o => o.id === id) || null
);

export const selectOrganizationBySlug = createSelector(
  [selectOrganizations, (state, slug) => slug],
  (organizations, slug) => organizations.find(o => o.slug === slug) || null
);

export const selectActiveOrganizations = createSelector(
  [selectOrganizations],
  (organizations) => organizations.filter(o => o.is_active === true)
);

export const selectOnboardedOrganizations = createSelector(
  [selectOrganizations],
  (organizations) => organizations.filter(o => o.is_onboarded === true)
);

export const selectOrganizationsByStatus = createSelector(
  [selectOrganizations, (state, status) => status],
  (organizations, status) => organizations.filter(o => o.status === status)
);

export const selectOrganizationsBySector = createSelector(
  [selectOrganizations, (state, sectorId) => sectorId],
  (organizations, sectorId) => organizations.filter(o => o.sector_id === sectorId)
);

export const selectOrganizationsByTier = createSelector(
  [selectOrganizations, (state, tier) => tier],
  (organizations, tier) => organizations.filter(o => o.subscription_tier === tier)
);

export const selectOrganizationCount = createSelector(
  [selectOrganizations],
  (organizations) => organizations.length
);

export const selectActiveOrganizationCount = createSelector(
  [selectActiveOrganizations],
  (active) => active.length
);

export const selectOnboardedOrganizationCount = createSelector(
  [selectOnboardedOrganizations],
  (onboarded) => onboarded.length
);

export const selectHasOrganizations = createSelector(
  [selectOrganizations],
  (organizations) => organizations.length > 0
);

export const selectIsOrganizationLoading = createSelector(
  [selectOrganizationLoading],
  (loading) => loading
);

export const selectHasOrganizationError = createSelector(
  [selectOrganizationError],
  (error) => error !== null
);