import { createSelector } from '@reduxjs/toolkit';

const CACHE_PREFIX = 'dashboard_cache_';
const CACHE_TTL = {
  EXECUTIVE: 5 * 60 * 1000,
  CLIENT_ADMIN: 5 * 60 * 1000,
  SUPER_ADMIN: 5 * 60 * 1000,
  CONFIG: 30 * 60 * 1000,
  ALERTS: 2 * 60 * 1000,
  EXPORTS: 10 * 60 * 1000,
  COMPARISONS: 60 * 60 * 1000
};

const getCacheKey = (type, identifier) => `${CACHE_PREFIX}${type}_${identifier}`;

const isCacheValid = (cachedData) => {
  if (!cachedData) return false;
  const now = Date.now();
  return cachedData.expiresAt > now;
};

const saveToCache = (type, identifier, data, ttl) => {
  try {
    const cacheKey = getCacheKey(type, identifier);
    const cacheEntry = {
      data,
      expiresAt: Date.now() + ttl,
      cachedAt: new Date().toISOString()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    return true;
  } catch (error) {
    console.error('Cache save error:', error);
    return false;
  }
};

const loadFromCache = (type, identifier) => {
  try {
    const cacheKey = getCacheKey(type, identifier);
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const cacheEntry = JSON.parse(cached);
    if (isCacheValid(cacheEntry)) {
      return cacheEntry.data;
    }
    
    localStorage.removeItem(cacheKey);
    return null;
  } catch (error) {
    console.error('Cache load error:', error);
    return null;
  }
};

const invalidateCache = (type, identifier = null) => {
  if (identifier) {
    const cacheKey = getCacheKey(type, identifier);
    localStorage.removeItem(cacheKey);
  } else {
    const pattern = `${CACHE_PREFIX}${type}_`;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(pattern)) {
        localStorage.removeItem(key);
      }
    });
  }
};

export const dashboardCacheMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  const activeDashboard = state.dashboard?.activeDashboard;

  if (action.type === 'dashboard/fetchExecutiveDashboard/fulfilled') {
    saveToCache('executive', 'dashboard', action.payload, CACHE_TTL.EXECUTIVE);
  }

  if (action.type === 'dashboard/fetchClientAdminDashboard/fulfilled') {
    saveToCache('client_admin', 'dashboard', action.payload, CACHE_TTL.CLIENT_ADMIN);
  }

  if (action.type === 'dashboard/fetchSuperAdminDashboard/fulfilled') {
    saveToCache('super_admin', 'dashboard', action.payload, CACHE_TTL.SUPER_ADMIN);
  }

  if (action.type === 'dashboardConfig/fetchDefaultConfig/fulfilled') {
    const dashboardType = action.meta.arg;
    saveToCache('config', dashboardType, action.payload, CACHE_TTL.CONFIG);
  }

  if (action.type === 'dashboardAlerts/fetchAlerts/fulfilled') {
    saveToCache('alerts', 'list', action.payload, CACHE_TTL.ALERTS);
  }

  if (action.type === 'dashboardExports/fetchExports/fulfilled') {
    saveToCache('exports', 'list', action.payload, CACHE_TTL.EXPORTS);
  }

  if (action.type === 'dashboardComparisons/fetchComparisons/fulfilled') {
    saveToCache('comparisons', 'list', action.payload, CACHE_TTL.COMPARISONS);
  }

  if (action.type === 'dashboard/refreshAllDashboards/fulfilled') {
    invalidateCache(activeDashboard, 'dashboard');
  }

  if (action.type === 'dashboardConfig/updateDashboardConfig/fulfilled') {
    invalidateCache('config');
  }

  if (action.type === 'dashboardAlerts/createAlert/fulfilled') {
    invalidateCache('alerts');
  }

  if (action.type === 'dashboardAlerts/updateAlert/fulfilled') {
    invalidateCache('alerts');
  }

  if (action.type === 'dashboardAlerts/deleteAlert/fulfilled') {
    invalidateCache('alerts');
  }

  if (action.type === 'dashboardExports/createExport/fulfilled') {
    invalidateCache('exports');
  }

  if (action.type === 'dashboardExports/updateExport/fulfilled') {
    invalidateCache('exports');
  }

  if (action.type === 'dashboardExports/deleteExport/fulfilled') {
    invalidateCache('exports');
  }

  if (action.type === 'dashboardComparisons/createComparison/fulfilled') {
    invalidateCache('comparisons');
  }

  if (action.type === 'dashboardComparisons/updateComparison/fulfilled') {
    invalidateCache('comparisons');
  }

  if (action.type === 'dashboardComparisons/deleteComparison/fulfilled') {
    invalidateCache('comparisons');
  }

  if (action.type === 'auth/logout') {
    const prefixes = ['executive', 'client_admin', 'super_admin', 'config', 'alerts', 'exports', 'comparisons'];
    prefixes.forEach(prefix => invalidateCache(prefix));
  }

  return result;
};

export const loadDashboardFromCache = (dashboardType) => {
  if (dashboardType === 'executive') {
    return loadFromCache('executive', 'dashboard');
  }
  if (dashboardType === 'client_admin') {
    return loadFromCache('client_admin', 'dashboard');
  }
  if (dashboardType === 'super_admin') {
    return loadFromCache('super_admin', 'dashboard');
  }
  return null;
};

export const loadConfigFromCache = (dashboardType) => {
  return loadFromCache('config', dashboardType);
};

export const loadAlertsFromCache = () => {
  return loadFromCache('alerts', 'list');
};

export const loadExportsFromCache = () => {
  return loadFromCache('exports', 'list');
};

export const loadComparisonsFromCache = () => {
  return loadFromCache('comparisons', 'list');
};