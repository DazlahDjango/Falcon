// ============================================
// apps/reportplt/selectors/export.selectors.js
// ============================================

import { createSelector } from '@reduxjs/toolkit';

const initialState = {
    exports: [],
    currentExport: null,
    myExports: [],
    loading: false,
    loadingDetails: false,
    submitting: false,
    downloading: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { format: null, status: null, report: null, exported_by: null },
    formats: [],
};

export const selectExportState = (state) => {
    return state?.export || state?.reports?.export || state?.reportplt?.export || initialState;
};

export const selectExports = createSelector(
    [selectExportState],
    (state) => state.exports || []
);

export const selectCurrentExport = createSelector(
    [selectExportState],
    (state) => state.currentExport || null
);

export const selectMyExports = createSelector(
    [selectExportState],
    (state) => state.myExports || []
);

export const selectExportLoading = createSelector(
    [selectExportState],
    (state) => state.loading || false
);

export const selectExportDetailsLoading = createSelector(
    [selectExportState],
    (state) => state.loadingDetails || false
);

export const selectExportSubmitting = createSelector(
    [selectExportState],
    (state) => state.submitting || false
);

export const selectExportDownloading = createSelector(
    [selectExportState],
    (state) => state.downloading || false
);

export const selectExportError = createSelector(
    [selectExportState],
    (state) => state.error || null
);

export const selectExportPagination = createSelector(
    [selectExportState],
    (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectExportPage = createSelector(
    [selectExportState],
    (state) => state.pagination?.page || 1
);

export const selectExportPageSize = createSelector(
    [selectExportState],
    (state) => state.pagination?.pageSize || 20
);

export const selectExportTotal = createSelector(
    [selectExportState],
    (state) => state.pagination?.total || 0
);

export const selectExportTotalPages = createSelector(
    [selectExportPagination],
    ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectExportFilters = createSelector(
    [selectExportState],
    (state) => state.filters || { format: null, status: null, report: null, exported_by: null }
);

export const selectExportById = createSelector(
    [selectExports, (state, id) => id],
    (exports, id) => exports.find(e => e.id === id) || null
);

export const selectExportsByFormat = createSelector(
    [selectExports, (state, format) => format],
    (exports, format) => exports.filter(e => e.format === format)
);

export const selectExportsByStatus = createSelector(
    [selectExports, (state, status) => status],
    (exports, status) => exports.filter(e => e.status === status)
);

export const selectCompletedExports = createSelector(
    [selectExports],
    (exports) => exports.filter(e => e.status === 'completed')
);

export const selectReadyExports = createSelector(
    [selectExports],
    (exports) => exports.filter(e => e.status === 'completed' && e.file_path)
);

export const selectExportCount = createSelector(
    [selectExports],
    (exports) => exports.length
);

export const selectHasExports = createSelector(
    [selectExports],
    (exports) => exports.length > 0
);

export const selectIsExportLoading = createSelector(
    [selectExportLoading],
    (loading) => loading
);

export const selectHasExportError = createSelector(
    [selectExportError],
    (error) => error !== null
);

export const selectExportFormats = createSelector(
    [selectExportState],
    (state) => state.formats || []
);