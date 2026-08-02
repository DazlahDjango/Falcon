// ============================================
// apps/reportplt/selectors/filter.selectors.js
// ============================================

import { createSelector } from '@reduxjs/toolkit';

const initialState = {
    filters: [],
    currentFilter: null,
    globalFilters: [],
    myFilters: [],
    loading: false,
    loadingDetails: false,
    submitting: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filtersState: { filter_type: null, is_global: null, is_system: null, is_default: null, search: '' },
    types: [],
    appliedFilters: {},
};

export const selectFilterState = (state) => {
    return state?.report?.filter || state?.reports?.filter || state?.reportplt?.filter || state?.filter || initialState;
};

export const selectFilters = createSelector(
    [selectFilterState],
    (state) => state.filters || []
);

export const selectCurrentFilter = createSelector(
    [selectFilterState],
    (state) => state.currentFilter || null
);

export const selectGlobalFilters = createSelector(
    [selectFilterState],
    (state) => state.globalFilters || []
);

export const selectMyFilters = createSelector(
    [selectFilterState],
    (state) => state.myFilters || []
);

export const selectFilterLoading = createSelector(
    [selectFilterState],
    (state) => state.loading || false
);

export const selectFilterDetailsLoading = createSelector(
    [selectFilterState],
    (state) => state.loadingDetails || false
);

export const selectFilterSubmitting = createSelector(
    [selectFilterState],
    (state) => state.submitting || false
);

export const selectFilterError = createSelector(
    [selectFilterState],
    (state) => state.error || null
);

export const selectFilterPagination = createSelector(
    [selectFilterState],
    (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectFilterPage = createSelector(
    [selectFilterState],
    (state) => state.pagination?.page || 1
);

export const selectFilterPageSize = createSelector(
    [selectFilterState],
    (state) => state.pagination?.pageSize || 20
);

export const selectFilterTotal = createSelector(
    [selectFilterState],
    (state) => state.pagination?.total || 0
);

export const selectFilterTotalPages = createSelector(
    [selectFilterPagination],
    ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectFilterFilters = createSelector(
    [selectFilterState],
    (state) => state.filtersState || { filter_type: null, is_global: null, is_system: null, is_default: null, search: '' }
);

export const selectFilterById = createSelector(
    [selectFilters, (state, id) => id],
    (filters, id) => filters.find(f => f.id === id) || null
);

export const selectFiltersByType = createSelector(
    [selectFilters, (state, type) => type],
    (filters, type) => filters.filter(f => f.filter_type === type)
);

export const selectSystemFilters = createSelector(
    [selectFilters],
    (filters) => filters.filter(f => f.is_system === true)
);

export const selectDefaultFilters = createSelector(
    [selectFilters],
    (filters) => filters.filter(f => f.is_default === true)
);

export const selectGlobalFiltersList = createSelector(
    [selectFilters],
    (filters) => filters.filter(f => f.is_global === true)
);

export const selectFilterCount = createSelector(
    [selectFilters],
    (filters) => filters.length
);

export const selectHasFilters = createSelector(
    [selectFilters],
    (filters) => filters.length > 0
);

export const selectIsFilterLoading = createSelector(
    [selectFilterLoading],
    (loading) => loading
);

export const selectHasFilterError = createSelector(
    [selectFilterError],
    (error) => error !== null
);

export const selectFilterTypes = createSelector(
    [selectFilterState],
    (state) => state.types || []
);

export const selectAppliedFilters = createSelector(
    [selectFilterState],
    (state) => state.appliedFilters || {}
);