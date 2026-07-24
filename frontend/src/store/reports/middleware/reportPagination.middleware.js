// ============================================
// apps/reportplt/middleware/reportPagination.middleware.js
// ============================================

import { createSelector } from '@reduxjs/toolkit';

const paginationState = {
    pagination: {},
    pageCache: new Map(),
};

export const reportPaginationMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    if (action.type?.startsWith('report/fetch') && action.type?.endsWith('/fulfilled')) {
        const payload = action.payload;
        const key = action.meta?.arg || 'default';
        if (payload?.results) {
            paginationState.pagination[key] = {
                page: payload.page || 1,
                pageSize: payload.pageSize || 20,
                total: payload.count || payload.total || 0,
                totalPages: Math.ceil((payload.count || payload.total || 0) / (payload.pageSize || 20)),
            };
        } else if (Array.isArray(payload)) {
            paginationState.pagination[key] = {
                page: 1,
                pageSize: payload.length,
                total: payload.length,
                totalPages: 1,
            };
        }
    }

    if (action.type?.startsWith('report/') && action.type?.endsWith('/rejected')) {
        const key = action.meta?.arg || 'default';
        const cached = paginationState.pageCache.get(key);
        if (cached) {
            paginationState.pageCache.set(key, { ...cached, error: true });
        }
    }

    return result;
};

export const getPagination = (key = 'default') => {
    return paginationState.pagination[key] || { page: 1, pageSize: 20, total: 0, totalPages: 0 };
};

export const setPaginationCache = (key, data) => {
    paginationState.pageCache.set(key, data);
};

export const getPaginationCache = (key) => {
    return paginationState.pageCache.get(key) || null;
};

export const clearPaginationCache = (key) => {
    if (key) paginationState.pageCache.delete(key);
    else paginationState.pageCache.clear();
};

export const selectReportPagination = createSelector(
    [(state) => state, (state, key = 'default') => key],
    (state, key) => getPagination(key)
);

export const selectReportPage = createSelector(
    [selectReportPagination],
    (pagination) => pagination.page || 1
);

export const selectReportPageSize = createSelector(
    [selectReportPagination],
    (pagination) => pagination.pageSize || 20
);

export const selectReportTotal = createSelector(
    [selectReportPagination],
    (pagination) => pagination.total || 0
);

export const selectReportTotalPages = createSelector(
    [selectReportPagination],
    (pagination) => pagination.totalPages || 1
);

export const selectHasNextPage = createSelector(
    [selectReportPagination],
    (pagination) => pagination.page < pagination.totalPages
);

export const selectHasPreviousPage = createSelector(
    [selectReportPagination],
    (pagination) => pagination.page > 1
);

export const selectIsLastPage = createSelector(
    [selectReportPagination],
    (pagination) => pagination.page >= pagination.totalPages
);

export const selectIsFirstPage = createSelector(
    [selectReportPagination],
    (pagination) => pagination.page <= 1
);

export const buildPaginationParams = (pagination, filters = {}) => {
    return {
        page: pagination.page || 1,
        pageSize: pagination.pageSize || 20,
        ...filters,
    };
};

export const updatePaginationFromResponse = (response, currentPagination) => {
    return {
        page: response.page || response.page_number || currentPagination.page || 1,
        pageSize: response.pageSize || response.page_size || currentPagination.pageSize || 20,
        total: response.count || response.total || response.total_items || 0,
        totalPages: Math.ceil(
            (response.count || response.total || response.total_items || 0) /
            (response.pageSize || response.page_size || currentPagination.pageSize || 20)
        ) || 1,
    };
};