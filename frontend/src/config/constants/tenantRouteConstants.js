// src/config/constants/tenantRouteConstants.js

export const TENANT_ROUTES = {
  // Tenant List & Overview
  TENANTS: '/tenants',
  TENANT_DASHBOARD: '/tenants/dashboard',
  TENANT_CREATE: '/tenants/create',
  TENANT_PLATFORM_SETTINGS: '/tenants/platform-settings',

  // Individual Tenant Routes (with :tenantId)
  TENANT_DETAIL: (tenantId = ':tenantId') => `/tenants/${tenantId}`,
  TENANT_EDIT: (tenantId = ':tenantId') => `/tenants/${tenantId}/edit`,
  TENANT_SETTINGS: (tenantId = ':tenantId') => `/tenants/${tenantId}/settings`,
  TENANT_RESOURCES: (tenantId = ':tenantId') => `/tenants/${tenantId}/resources`,
  TENANT_USAGE: (tenantId = ':tenantId') => `/tenants/${tenantId}/usage`,
  TENANT_PROVISIONING: (tenantId = ':tenantId') => `/tenants/${tenantId}/provisioning`,
  TENANT_AUDIT: (tenantId = ':tenantId') => `/tenants/${tenantId}/audit`,
  TENANT_MIGRATIONS: (tenantId = ':tenantId') => `/tenants/${tenantId}/migrations`,
  TENANT_SCHEMA: (tenantId = ':tenantId') => `/tenants/${tenantId}/schema`,
  TENANT_DOMAINS: (tenantId = ':tenantId') => `/tenants/${tenantId}/domains`,
  TENANT_BACKUPS: (tenantId = ':tenantId') => `/tenants/${tenantId}/backups`,
  TENANT_CONNECTIONS: (tenantId = ':tenantId') => `/tenants/${tenantId}/connections`,

  // Connections (global)
  CONNECTIONS: '/tenants/connections',
  CONNECTION_METRICS: '/tenants/connections/metrics',
  CONNECTION_HEALTH: '/tenants/connections/health',
};
