// ============================================
// apps/reportplt/middleware/reportCache.middleware.js
// ============================================

import { createSelector } from '@reduxjs/toolkit';

const CACHE_DURATION = 5 * 60 * 1000;
const cacheStore = new Map();

export const reportCacheMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    if (action.type?.startsWith('report/fetch') && action.type?.endsWith('/fulfilled')) {
        const cacheKey = generateCacheKey(action);
        if (cacheKey) {
            cacheStore.set(cacheKey, {
                data: action.payload,
                timestamp: Date.now(),
            });
            setTimeout(() => cacheStore.delete(cacheKey), CACHE_DURATION);
        }
    }

    if (action.type?.startsWith('report/create') && action.type?.endsWith('/fulfilled')) {
        invalidateCacheByPrefix('report/list');
        invalidateCacheByPrefix('report/my');
    }

    if (action.type?.startsWith('report/update') && action.type?.endsWith('/fulfilled')) {
        invalidateCacheByPrefix(`report/${action.payload?.id}`);
        invalidateCacheByPrefix('report/list');
    }

    if (action.type?.startsWith('report/delete') && action.type?.endsWith('/fulfilled')) {
        invalidateCacheByPrefix('report/list');
        invalidateCacheByPrefix('report/my');
    }

    return result;
};

export const generateCacheKey = (action) => {
    if (!action.meta?.arg) return null;
    const params = typeof action.meta.arg === 'object' ? JSON.stringify(action.meta.arg) : action.meta.arg;
    return `${action.type.split('/')[0]}:${params}`;
};

export const invalidateCacheByPrefix = (prefix) => {
    for (const key of cacheStore.keys()) {
        if (key.startsWith(prefix)) {
            cacheStore.delete(key);
        }
    }
};

export const clearAllCache = () => {
    cacheStore.clear();
};

export const getCachedData = (key) => {
    const entry = cacheStore.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
        return entry.data;
    }
    if (entry) cacheStore.delete(key);
    return null;
};

export const selectCachedReport = createSelector(
    [(state) => state, (state, id) => id],
    (state, id) => {
        const key = `report:${id}`;
        return getCachedData(key);
    }
);

export const selectCachedReports = createSelector(
    [(state) => state, (state, params) => params],
    (state, params) => {
        const key = `report:${JSON.stringify(params || {})}`;
        return getCachedData(key);
    }
);