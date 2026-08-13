import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
  fetchOrganizations,
  fetchAdminOrganizations,
  fetchOrganization,
} from '../slice/organization.slice';

import {
  fetchDomains,
  fetchDomain,
  fetchTenantDomains,
} from '../slice/domain.slice';

import {
  fetchSchemas,
  fetchSchema,
  fetchTenantSchemas,
} from '../slice/schema.slice';

import {
  fetchResources,
  fetchResource,
  fetchTenantResources,
} from '../slice/resource.slice';

import {
  fetchConnections,
  fetchConnection,
  fetchTenantConnections,
  fetchConnectionMetrics,
} from '../slice/connection.slice';

import {
  fetchMigrations,
  fetchMigration,
  fetchTenantMigrations,
  fetchMigrationStats,
} from '../slice/migration.slice';

import {
  fetchSuperAdminDashboard,
  fetchClientAdminDashboard,
} from '../slice/dashboard.slice';

import {
  fetchSettings,
  fetchSystemSettings,
} from '../slice/settings.slice';

import {
  fetchHealth,
  fetchOrganizationsHealth,
} from '../slice/health.slice';

const CACHE_DURATION = {
  LIST: 60000,
  DETAIL: 300000,
  DASHBOARD: 120000,
  SETTINGS: 300000,
  HEALTH: 30000,
  STATS: 60000,
};

const cacheMiddleware = createListenerMiddleware();

const cacheableActions = [
  // Organization
  { action: fetchOrganizations, duration: CACHE_DURATION.LIST, key: 'organizations' },
  { action: fetchAdminOrganizations, duration: CACHE_DURATION.LIST, key: 'adminOrganizations' },
  { action: fetchOrganization, duration: CACHE_DURATION.DETAIL, key: 'organization' },
  // Domain
  { action: fetchDomains, duration: CACHE_DURATION.LIST, key: 'domains' },
  { action: fetchDomain, duration: CACHE_DURATION.DETAIL, key: 'domain' },
  { action: fetchTenantDomains, duration: CACHE_DURATION.LIST, key: 'tenantDomains' },
  // Schema
  { action: fetchSchemas, duration: CACHE_DURATION.LIST, key: 'schemas' },
  { action: fetchSchema, duration: CACHE_DURATION.DETAIL, key: 'schema' },
  { action: fetchTenantSchemas, duration: CACHE_DURATION.LIST, key: 'tenantSchemas' },
  // Resource
  { action: fetchResources, duration: CACHE_DURATION.LIST, key: 'resources' },
  { action: fetchResource, duration: CACHE_DURATION.DETAIL, key: 'resource' },
  { action: fetchTenantResources, duration: CACHE_DURATION.LIST, key: 'tenantResources' },
  // Connection
  { action: fetchConnections, duration: CACHE_DURATION.LIST, key: 'connections' },
  { action: fetchConnection, duration: CACHE_DURATION.DETAIL, key: 'connection' },
  { action: fetchTenantConnections, duration: CACHE_DURATION.LIST, key: 'tenantConnections' },
  { action: fetchConnectionMetrics, duration: CACHE_DURATION.STATS, key: 'metrics' },
  // Migration
  { action: fetchMigrations, duration: CACHE_DURATION.LIST, key: 'migrations' },
  { action: fetchMigration, duration: CACHE_DURATION.DETAIL, key: 'migration' },
  { action: fetchTenantMigrations, duration: CACHE_DURATION.LIST, key: 'tenantMigrations' },
  { action: fetchMigrationStats, duration: CACHE_DURATION.STATS, key: 'migrationStats' },
  // Dashboard
  { action: fetchSuperAdminDashboard, duration: CACHE_DURATION.DASHBOARD, key: 'superAdminDashboard' },
  { action: fetchClientAdminDashboard, duration: CACHE_DURATION.DASHBOARD, key: 'clientAdminDashboard' },
  // Settings
  { action: fetchSettings, duration: CACHE_DURATION.SETTINGS, key: 'settings' },
  { action: fetchSystemSettings, duration: CACHE_DURATION.SETTINGS, key: 'systemSettings' },
  // Health
  { action: fetchHealth, duration: CACHE_DURATION.HEALTH, key: 'health' },
  { action: fetchOrganizationsHealth, duration: CACHE_DURATION.HEALTH, key: 'organizationsHealth' },
];

const cacheStore = new Map();

cacheableActions.forEach(({ action: thunkAction, duration, key }) => {
  if (!thunkAction?.fulfilled) return;
  cacheMiddleware.startListening({
    actionCreator: thunkAction.fulfilled,
    effect: async (action, listenerApi) => {
      const cacheKey = `${key}:${JSON.stringify(action.meta?.arg || {})}`;
      const cached = cacheStore.get(cacheKey);
      const now = Date.now();

      if (cached && (now - cached.timestamp) < duration) {
        return;
      }

      cacheStore.set(cacheKey, {
        timestamp: now,
        data: action.payload,
      });

      setTimeout(() => {
        cacheStore.delete(cacheKey);
      }, duration);
    },
  });
});

export const cacheMiddlewareInstance = cacheMiddleware.middleware;