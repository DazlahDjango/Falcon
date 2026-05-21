// frontend/src/store/dashboard/middleware/dashboardCache.js

import { createSelector } from '@reduxjs/toolkit';

const CACHE_PREFIX = 'dashboard_cache_';
const CACHE_TTL = {
  EXECUTIVE: 5 * 60 * 1000,
  CLIENT_ADMIN: 5 * 60 * 1000,
  SUPER_ADMIN: 5 * 60 * 1000,
  // ===== ADD NEW DASHBOARD TYPES =====
  MANAGER: 2 * 60 * 1000,      // 2 minutes for manager
  STAFF: 3 * 60 * 1000,        // 3 minutes for staff
  CHAMPION: 1 * 60 * 1000,     // 1 minute for champion
  READ_ONLY: 5 * 60 * 1000,    // 5 minutes for read-only
  // Existing
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

  // Existing Executive
  if (action.type === 'dashboard/fetchExecutiveDashboard/fulfilled') {
    saveToCache('executive', 'dashboard', action.payload, CACHE_TTL.EXECUTIVE);
  }

  // Existing Client Admin
  if (action.type === 'dashboard/fetchClientAdminDashboard/fulfilled') {
    saveToCache('client_admin', 'dashboard', action.payload, CACHE_TTL.CLIENT_ADMIN);
  }

  // Existing Super Admin
  if (action.type === 'dashboard/fetchSuperAdminDashboard/fulfilled') {
    saveToCache('super_admin', 'dashboard', action.payload, CACHE_TTL.SUPER_ADMIN);
  }

  // ===== ADD NEW DASHBOARD TYPES =====
  
  // Manager Dashboard
  if (action.type === 'managerDashboard/fetchData/fulfilled') {
    saveToCache('manager', 'dashboard', action.payload, CACHE_TTL.MANAGER);
  }
  
  // Staff Dashboard
  if (action.type === 'staffDashboard/fetchData/fulfilled') {
    saveToCache('staff', 'dashboard', action.payload, CACHE_TTL.STAFF);
  }
  
  // Champion Dashboard
  if (action.type === 'championDashboard/fetchEditable/fulfilled') {
    saveToCache('champion', 'dashboard', action.payload, CACHE_TTL.CHAMPION);
  }
  
  // Read-Only Dashboard
  if (action.type === 'readOnlyDashboard/fetchData/fulfilled') {
    saveToCache('read_only', 'dashboard', action.payload, CACHE_TTL.READ_ONLY);
  }

  // Existing Config
  if (action.type === 'dashboardConfig/fetchDefaultConfig/fulfilled') {
    const dashboardType = action.meta.arg;
    saveToCache('config', dashboardType, action.payload, CACHE_TTL.CONFIG);
  }

  // Existing Alerts
  if (action.type === 'dashboardAlerts/fetchAlerts/fulfilled') {
    saveToCache('alerts', 'list', action.payload, CACHE_TTL.ALERTS);
  }

  // Existing Exports
  if (action.type === 'dashboardExports/fetchExports/fulfilled') {
    saveToCache('exports', 'list', action.payload, CACHE_TTL.EXPORTS);
  }

  // Existing Comparisons
  if (action.type === 'dashboardComparisons/fetchComparisons/fulfilled') {
    saveToCache('comparisons', 'list', action.payload, CACHE_TTL.COMPARISONS);
  }

  // Existing Refresh - Invalidate all
  if (action.type === 'dashboard/refreshAllDashboards/fulfilled') {
    invalidateCache(activeDashboard, 'dashboard');
  }

  // ===== ADD NEW REFRESH INVALIDATIONS =====
  
  // Manager Dashboard Refresh
  if (action.type === 'managerDashboard/refreshAll/fulfilled') {
    invalidateCache('manager', 'dashboard');
  }
  
  // Staff Dashboard Refresh
  if (action.type === 'staffDashboard/refreshAll/fulfilled') {
    invalidateCache('staff', 'dashboard');
  }
  
  // Champion Dashboard Refresh
  if (action.type === 'championDashboard/refreshAll/fulfilled') {
    invalidateCache('champion', 'dashboard');
  }
  
  // Read-Only Dashboard Refresh
  if (action.type === 'readOnlyDashboard/refresh/fulfilled') {
    invalidateCache('read_only', 'dashboard');
  }

  // Existing Config updates
  if (action.type === 'dashboardConfig/updateDashboardConfig/fulfilled') {
    invalidateCache('config');
  }

  // Existing Alert mutations
  if (action.type === 'dashboardAlerts/createAlert/fulfilled' ||
      action.type === 'dashboardAlerts/updateAlert/fulfilled' ||
      action.type === 'dashboardAlerts/deleteAlert/fulfilled') {
    invalidateCache('alerts');
  }

  // Existing Export mutations
  if (action.type === 'dashboardExports/createExport/fulfilled' ||
      action.type === 'dashboardExports/updateExport/fulfilled' ||
      action.type === 'dashboardExports/deleteExport/fulfilled') {
    invalidateCache('exports');
  }

  // Existing Comparison mutations
  if (action.type === 'dashboardComparisons/createComparison/fulfilled' ||
      action.type === 'dashboardComparisons/updateComparison/fulfilled' ||
      action.type === 'dashboardComparisons/deleteComparison/fulfilled') {
    invalidateCache('comparisons');
  }

  // ===== ADD NEW MUTATION INVALIDATIONS =====
  
  // Manager mutations
  if (action.type === 'managerDashboard/approveSubmission/fulfilled' ||
      action.type === 'managerDashboard/rejectSubmission/fulfilled') {
    invalidateCache('manager', 'dashboard');
    invalidateCache('manager', 'pending');
  }
  
  // Staff mutations
  if (action.type === 'staffDashboard/submitKPI/fulfilled') {
    invalidateCache('staff', 'dashboard');
    invalidateCache('staff', 'pending');
  }
  
  if (action.type === 'staffDashboard/updateMissionStatus/fulfilled') {
    invalidateCache('staff', 'mission');
  }
  
  // Champion mutations
  if (action.type === 'championDashboard/updateConfig/fulfilled' ||
      action.type === 'championDashboard/addKPI/fulfilled' ||
      action.type === 'championDashboard/removeKPI/fulfilled' ||
      action.type === 'championDashboard/updateWeights/fulfilled' ||
      action.type === 'championDashboard/updateTargets/fulfilled') {
    invalidateCache('champion', 'dashboard');
    invalidateCache('champion', 'assigned');
  }
  
  if (action.type === 'championDashboard/createTemplate/fulfilled') {
    invalidateCache('champion', 'templates');
  }

  // Logout
  if (action.type === 'auth/logout') {
    const prefixes = ['executive', 'client_admin', 'super_admin', 'manager', 'staff', 'champion', 'read_only', 'config', 'alerts', 'exports', 'comparisons'];
    prefixes.forEach(prefix => invalidateCache(prefix));
  }

  return result;
};

// ===== UPDATE LOAD FUNCTIONS =====

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
  // ===== ADD NEW DASHBOARD TYPES =====
  if (dashboardType === 'manager') {
    return loadFromCache('manager', 'dashboard');
  }
  if (dashboardType === 'staff') {
    return loadFromCache('staff', 'dashboard');
  }
  if (dashboardType === 'champion') {
    return loadFromCache('champion', 'dashboard');
  }
  if (dashboardType === 'read_only') {
    return loadFromCache('read_only', 'dashboard');
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

// ===== ADD NEW LOAD FUNCTIONS =====

export const loadManagerPendingFromCache = () => {
  return loadFromCache('manager', 'pending');
};

export const loadStaffPendingFromCache = () => {
  return loadFromCache('staff', 'pending');
};

export const loadStaffMissionFromCache = () => {
  return loadFromCache('staff', 'mission');
};

export const loadChampionAssignedFromCache = (userId) => {
  return loadFromCache('champion', `assigned_${userId}`);
};

export const loadChampionTemplatesFromCache = () => {
  return loadFromCache('champion', 'templates');
};