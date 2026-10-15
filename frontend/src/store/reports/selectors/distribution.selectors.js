// ============================================
// apps/reportplt/selectors/distribution.selectors.js
// ============================================

import { createSelector } from '@reduxjs/toolkit';

const initialState = {
    distributions: [],
    currentDistribution: null,
    loading: false,
    loadingDetails: false,
    submitting: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { search: '', is_active: null },
};

export const selectDistributionState = (state) => {
    return state?.report?.distribution || state?.reports?.distribution || state?.reportplt?.distribution || state?.distribution || initialState;
};

export const selectDistributions = createSelector(
    [selectDistributionState],
    (state) => state.distributions || []
);

export const selectCurrentDistribution = createSelector(
    [selectDistributionState],
    (state) => state.currentDistribution || null
);

export const selectDistributionLoading = createSelector(
    [selectDistributionState],
    (state) => state.loading || false
);

export const selectDistributionDetailsLoading = createSelector(
    [selectDistributionState],
    (state) => state.loadingDetails || false
);

export const selectDistributionSubmitting = createSelector(
    [selectDistributionState],
    (state) => state.submitting || false
);

export const selectDistributionError = createSelector(
    [selectDistributionState],
    (state) => state.error || null
);

export const selectDistributionPagination = createSelector(
    [selectDistributionState],
    (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectDistributionPage = createSelector(
    [selectDistributionState],
    (state) => state.pagination?.page || 1
);

export const selectDistributionPageSize = createSelector(
    [selectDistributionState],
    (state) => state.pagination?.pageSize || 20
);

export const selectDistributionTotal = createSelector(
    [selectDistributionState],
    (state) => state.pagination?.total || 0
);

export const selectDistributionTotalPages = createSelector(
    [selectDistributionPagination],
    ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectDistributionFilters = createSelector(
    [selectDistributionState],
    (state) => state.filters || { search: '', is_active: null }
);

export const selectDistributionById = createSelector(
    [selectDistributions, (state, id) => id],
    (distributions, id) => distributions.find(d => d.id === id) || null
);

export const selectActiveDistributions = createSelector(
    [selectDistributions],
    (distributions) => distributions.filter(d => d.is_active !== false)
);

export const selectDistributionCount = createSelector(
    [selectDistributions],
    (distributions) => distributions.length
);

export const selectHasDistributions = createSelector(
    [selectDistributions],
    (distributions) => distributions.length > 0
);

export const selectIsDistributionLoading = createSelector(
    [selectDistributionLoading],
    (loading) => loading
);

export const selectHasDistributionError = createSelector(
    [selectDistributionError],
    (error) => error !== null
);
