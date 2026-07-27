import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
  fetchOrganizations,
  fetchOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  onboardOrganization,
  activateOrganization,
  suspendOrganization,
  fetchProvisioningStatus,
  fetchUsageSummary,
  fetchAdminOrganizations,
  forceSuspendOrganization,
  forceActivateOrganization,
  forceDeleteOrganization,
} from '../slice/organization.slice';

import {
  fetchDomains,
  fetchDomain,
  createDomain,
  updateDomain,
  deleteDomain,
  verifyDomain,
  setPrimaryDomain,
  renewSSL,
  fetchTenantDomains,
  fetchExpiringSSL,
  verifyAllPendingDomains,
  fetchDomainStats,
} from '../slice/domain.slice';

import {
  fetchSchemas,
  fetchSchema,
  createSchema,
  updateSchema,
  deleteSchema,
  provisionSchema,
  dropSchema,
  updateSchemaStats,
  fetchTenantSchemas,
  fetchSchemaStats,
  provisionTenantSchema,
  dropTenantSchema,
} from '../slice/schema.slice';

import {
  fetchResources,
  fetchResource,
  createResource,
  updateResource,
  deleteResource,
  resetResource,
  resetDailyLimits,
  fetchTenantResources,
  fetchResourceUsage,
  resetTenantResource,
} from '../slice/resource.slice';

import {
  fetchConnections,
  fetchConnection,
  createConnection,
  updateConnection,
  deleteConnection,
  closeConnection,
  fetchConnectionStatus,
  executeConnectionAction,
  fetchConnectionMetrics,
  runHealthCheck,
  fetchTenantConnections,
  closeTenantConnection,
  fetchTenantConnectionStatus,
} from '../slice/connection.slice';

import {
  fetchMigrations,
  fetchMigration,
  createMigration,
  updateMigration,
  deleteMigration,
  applyMigration,
  fetchMigrationStats,
  fetchTenantMigrations,
  fetchTenantMigrationStats,
  applyTenantMigration,
} from '../slice/migration.slice';

const tenantMiddleware = createListenerMiddleware();

const tenantActions = [
  // Organization
  fetchOrganizations,
  fetchOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  onboardOrganization,
  activateOrganization,
  suspendOrganization,
  fetchProvisioningStatus,
  fetchUsageSummary,
  fetchAdminOrganizations,
  forceSuspendOrganization,
  forceActivateOrganization,
  forceDeleteOrganization,
  // Domain
  fetchDomains,
  fetchDomain,
  createDomain,
  updateDomain,
  deleteDomain,
  verifyDomain,
  setPrimaryDomain,
  renewSSL,
  fetchTenantDomains,
  fetchExpiringSSL,
  verifyAllPendingDomains,
  fetchDomainStats,
  // Schema
  fetchSchemas,
  fetchSchema,
  createSchema,
  updateSchema,
  deleteSchema,
  provisionSchema,
  dropSchema,
  updateSchemaStats,
  fetchTenantSchemas,
  fetchSchemaStats,
  provisionTenantSchema,
  dropTenantSchema,
  // Resource
  fetchResources,
  fetchResource,
  createResource,
  updateResource,
  deleteResource,
  resetResource,
  resetDailyLimits,
  fetchTenantResources,
  fetchResourceUsage,
  resetTenantResource,
  // Connection
  fetchConnections,
  fetchConnection,
  createConnection,
  updateConnection,
  deleteConnection,
  closeConnection,
  fetchConnectionStatus,
  executeConnectionAction,
  fetchConnectionMetrics,
  runHealthCheck,
  fetchTenantConnections,
  closeTenantConnection,
  fetchTenantConnectionStatus,
  // Migration
  fetchMigrations,
  fetchMigration,
  createMigration,
  updateMigration,
  deleteMigration,
  applyMigration,
  fetchMigrationStats,
  fetchTenantMigrations,
  fetchTenantMigrationStats,
  applyTenantMigration,
];

tenantActions.forEach((action) => {
  tenantMiddleware.startListening({
    actionCreator: action,
    effect: async (action, listenerApi) => {
      const state = listenerApi.getState();
      const tenantId = state.auth?.user?.tenant_id || state.tenant?.currentTenant?.id;
      if (tenantId && action.meta?.arg) {
        const arg = action.meta.arg;
        if (typeof arg === 'object' && arg !== null) {
          if (!arg.tenant_id && !arg.organization_id) {
            action.meta.arg = { ...arg, tenant_id: tenantId };
          }
        }
      }
    },
  });
});

export const tenantContextMiddleware = tenantMiddleware.middleware;