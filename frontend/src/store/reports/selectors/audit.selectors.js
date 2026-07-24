// ============================================
// apps/reportplt/selectors/audit.selectors.js
// ============================================

import { createSelector } from '@reduxjs/toolkit';

const initialState = {
    audits: [],
    currentAudit: null,
    loading: false,
    loadingDetails: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { action: null, report: null, user: null, success: null, ip_address: null },
    actions: [],
    stats: null,
};

export const selectAuditState = (state) => {
    return state?.audit || state?.reports?.audit || state?.reportplt?.audit || initialState;
};

export const selectAudits = createSelector(
    [selectAuditState],
    (state) => state.audits || []
);

export const selectCurrentAudit = createSelector(
    [selectAuditState],
    (state) => state.currentAudit || null
);

export const selectAuditLoading = createSelector(
    [selectAuditState],
    (state) => state.loading || false
);

export const selectAuditDetailsLoading = createSelector(
    [selectAuditState],
    (state) => state.loadingDetails || false
);

export const selectAuditError = createSelector(
    [selectAuditState],
    (state) => state.error || null
);

export const selectAuditPagination = createSelector(
    [selectAuditState],
    (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectAuditPage = createSelector(
    [selectAuditState],
    (state) => state.pagination?.page || 1
);

export const selectAuditPageSize = createSelector(
    [selectAuditState],
    (state) => state.pagination?.pageSize || 20
);

export const selectAuditTotal = createSelector(
    [selectAuditState],
    (state) => state.pagination?.total || 0
);

export const selectAuditTotalPages = createSelector(
    [selectAuditPagination],
    ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectAuditFilters = createSelector(
    [selectAuditState],
    (state) => state.filters || { action: null, report: null, user: null, success: null, ip_address: null }
);

export const selectAuditById = createSelector(
    [selectAudits, (state, id) => id],
    (audits, id) => audits.find(a => a.id === id) || null
);

export const selectAuditsByAction = createSelector(
    [selectAudits, (state, action) => action],
    (audits, action) => audits.filter(a => a.action === action)
);

export const selectAuditsByReport = createSelector(
    [selectAudits, (state, reportId) => reportId],
    (audits, reportId) => audits.filter(a => a.report === reportId)
);

export const selectAuditsByUser = createSelector(
    [selectAudits, (state, userId) => userId],
    (audits, userId) => audits.filter(a => a.user === userId)
);

export const selectSuccessfulAudits = createSelector(
    [selectAudits],
    (audits) => audits.filter(a => a.success === true)
);

export const selectFailedAudits = createSelector(
    [selectAudits],
    (audits) => audits.filter(a => a.success === false)
);

export const selectAuditCount = createSelector(
    [selectAudits],
    (audits) => audits.length
);

export const selectHasAudits = createSelector(
    [selectAudits],
    (audits) => audits.length > 0
);

export const selectIsAuditLoading = createSelector(
    [selectAuditLoading],
    (loading) => loading
);

export const selectHasAuditError = createSelector(
    [selectAuditError],
    (error) => error !== null
);

export const selectAuditActions = createSelector(
    [selectAuditState],
    (state) => state.actions || []
);

export const selectAuditStats = createSelector(
    [selectAuditState],
    (state) => state.stats || null
);