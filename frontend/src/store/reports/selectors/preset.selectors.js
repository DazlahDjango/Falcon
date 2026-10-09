// ============================================
// apps/reportplt/selectors/preset.selectors.js
// ============================================

import { createSelector } from '@reduxjs/toolkit';

const initialState = {
    presets: [],
    currentPreset: null,
    loading: false,
    loadingDetails: false,
    submitting: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { search: '', report: null, is_default: null },
};

export const selectPresetState = (state) => {
    return state?.report?.preset || state?.reports?.preset || state?.reportplt?.preset || state?.preset || initialState;
};

export const selectPresets = createSelector(
    [selectPresetState],
    (state) => state.presets || []
);

export const selectCurrentPreset = createSelector(
    [selectPresetState],
    (state) => state.currentPreset || null
);

export const selectPresetLoading = createSelector(
    [selectPresetState],
    (state) => state.loading || false
);

export const selectPresetDetailsLoading = createSelector(
    [selectPresetState],
    (state) => state.loadingDetails || false
);

export const selectPresetSubmitting = createSelector(
    [selectPresetState],
    (state) => state.submitting || false
);

export const selectPresetError = createSelector(
    [selectPresetState],
    (state) => state.error || null
);

export const selectPresetPagination = createSelector(
    [selectPresetState],
    (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectPresetPage = createSelector(
    [selectPresetState],
    (state) => state.pagination?.page || 1
);

export const selectPresetPageSize = createSelector(
    [selectPresetState],
    (state) => state.pagination?.pageSize || 20
);

export const selectPresetTotal = createSelector(
    [selectPresetState],
    (state) => state.pagination?.total || 0
);

export const selectPresetTotalPages = createSelector(
    [selectPresetPagination],
    ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectPresetFilters = createSelector(
    [selectPresetState],
    (state) => state.filters || { search: '', report: null, is_default: null }
);

export const selectPresetById = createSelector(
    [selectPresets, (state, id) => id],
    (presets, id) => presets.find(p => p.id === id) || null
);

export const selectPresetsByReport = createSelector(
    [selectPresets, (state, reportId) => reportId],
    (presets, reportId) => presets.filter(p => p.report === reportId)
);

export const selectDefaultPreset = createSelector(
    [selectPresets],
    (presets) => presets.find(p => p.is_default === true) || null
);

export const selectPresetCount = createSelector(
    [selectPresets],
    (presets) => presets.length
);

export const selectHasPresets = createSelector(
    [selectPresets],
    (presets) => presets.length > 0
);

export const selectIsPresetLoading = createSelector(
    [selectPresetLoading],
    (loading) => loading
);

export const selectHasPresetError = createSelector(
    [selectPresetError],
    (error) => error !== null
);
