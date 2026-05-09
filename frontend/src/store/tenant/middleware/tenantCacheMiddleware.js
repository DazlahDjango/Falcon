// frontend/src/store/tenant/middleware/tenantCacheMiddleware.js
import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
    fetchTenants,
    fetchTenantById,
    createTenant,
    updateTenant,
    deleteTenant,
    suspendTenant,
    activateTenant,
} from '../slice/tenantSlice';

const cacheMiddleware = createListenerMiddleware();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

// Cache tenants list
cacheMiddleware.startListening({
    actionCreator: fetchTenants.fulfilled,
    effect: (action, listenerApi) => {
        const key = `tenants_${JSON.stringify(action.meta.arg)}`;
        cache.set(key, {
            data: action.payload,
            timestamp: Date.now(),
        });
    },
});

// Cache single tenant
cacheMiddleware.startListening({
    actionCreator: fetchTenantById.fulfilled,
    effect: (action, listenerApi) => {
        const key = `tenant_${action.meta.arg}`;
        cache.set(key, {
            data: action.payload,
            timestamp: Date.now(),
        });
    },
});

// Invalidate cache on mutations
const invalidateTenantCache = () => {
    for (const key of cache.keys()) {
        if (key.startsWith('tenants_') || key.startsWith('tenant_')) {
            cache.delete(key);
        }
    }
};

cacheMiddleware.startListening({
    predicate: (action) => [
        createTenant.fulfilled.type,
        updateTenant.fulfilled.type,
        deleteTenant.fulfilled.type,
        suspendTenant.fulfilled.type,
        activateTenant.fulfilled.type
    ].includes(action.type),
    effect: () => {
        invalidateTenantCache();
    },
});

// Get cached data helper
export const getCachedTenants = (params) => {
    const key = `tenants_${JSON.stringify(params)}`;
    const cached = cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.data;
    }
    return null;
};

export const getCachedTenant = (id) => {
    const key = `tenant_${id}`;
    const cached = cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.data;
    }
    return null;
};

export default cacheMiddleware.middleware;