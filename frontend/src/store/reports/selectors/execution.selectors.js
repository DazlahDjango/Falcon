// ============================================
// apps/reportplt/selectors/execution.selectors.js
// ============================================

import { createSelector } from '@reduxjs/toolkit';

const initialState = {
    executions: [],
    currentExecution: null,
    executionLogs: [],
    loading: false,
    loadingDetails: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { status: null, report: null, triggered_by: null },
    statuses: [],
};

export const selectExecutionState = (state) => {
    return state?.execution || state?.reports?.execution || state?.reportplt?.execution || initialState;
};

export const selectExecutions = createSelector(
    [selectExecutionState],
    (state) => state.executions || []
);

export const selectCurrentExecution = createSelector(
    [selectExecutionState],
    (state) => state.currentExecution || null
);

export const selectExecutionLogs = createSelector(
    [selectExecutionState],
    (state) => state.executionLogs || []
);

export const selectExecutionLoading = createSelector(
    [selectExecutionState],
    (state) => state.loading || false
);

export const selectExecutionDetailsLoading = createSelector(
    [selectExecutionState],
    (state) => state.loadingDetails || false
);

export const selectExecutionError = createSelector(
    [selectExecutionState],
    (state) => state.error || null
);

export const selectExecutionPagination = createSelector(
    [selectExecutionState],
    (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectExecutionPage = createSelector(
    [selectExecutionState],
    (state) => state.pagination?.page || 1
);

export const selectExecutionPageSize = createSelector(
    [selectExecutionState],
    (state) => state.pagination?.pageSize || 20
);

export const selectExecutionTotal = createSelector(
    [selectExecutionState],
    (state) => state.pagination?.total || 0
);

export const selectExecutionTotalPages = createSelector(
    [selectExecutionPagination],
    ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectExecutionFilters = createSelector(
    [selectExecutionState],
    (state) => state.filters || { status: null, report: null, triggered_by: null }
);

export const selectExecutionById = createSelector(
    [selectExecutions, (state, id) => id],
    (executions, id) => executions.find(e => e.id === id) || null
);

export const selectExecutionsByStatus = createSelector(
    [selectExecutions, (state, status) => status],
    (executions, status) => executions.filter(e => e.status === status)
);

export const selectExecutionsByReport = createSelector(
    [selectExecutions, (state, reportId) => reportId],
    (executions, reportId) => executions.filter(e => e.report === reportId)
);

export const selectCompletedExecutions = createSelector(
    [selectExecutions],
    (executions) => executions.filter(e => e.status === 'completed')
);

export const selectFailedExecutions = createSelector(
    [selectExecutions],
    (executions) => executions.filter(e => e.status === 'failed')
);

export const selectRunningExecutions = createSelector(
    [selectExecutions],
    (executions) => executions.filter(e => e.status === 'running')
);

export const selectExecutionCount = createSelector(
    [selectExecutions],
    (executions) => executions.length
);

export const selectHasExecutions = createSelector(
    [selectExecutions],
    (executions) => executions.length > 0
);

export const selectIsExecutionLoading = createSelector(
    [selectExecutionLoading],
    (loading) => loading
);

export const selectHasExecutionError = createSelector(
    [selectExecutionError],
    (error) => error !== null
);

export const selectExecutionStatuses = createSelector(
    [selectExecutionState],
    (state) => state.statuses || []
);