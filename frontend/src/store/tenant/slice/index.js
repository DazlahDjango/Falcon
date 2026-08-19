import { combineReducers } from '@reduxjs/toolkit';
import organizationReducer from './organization.slice';
import domainReducer from './domain.slice';
import schemaReducer from './schema.slice';
import resourceReducer from './resource.slice';
import connectionReducer from './connection.slice';
import migrationReducer from './migration.slice';
import dashboardReducer from './dashboard.slice';
import settingsReducer from './settings.slice';
import healthReducer from './health.slice';
import sectorReducer from './sector.slice';
import provisioningReducer from './provision.slice';

export const tenantReducers = combineReducers({
  organization: organizationReducer,
  domain: domainReducer,
  schema: schemaReducer,
  resource: resourceReducer,
  connection: connectionReducer,
  migration: migrationReducer,
  dashboard: dashboardReducer,
  settings: settingsReducer,
  health: healthReducer,
  sector: sectorReducer,
  provisioning: provisioningReducer,
});

export default tenantReducers;

export {
  default as organizationReducer,
  fetchOrganizations,
  fetchOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  onboardOrganization,
  activateOrganization,
  suspendOrganization,
  fetchUsageSummary,
  fetchAdminOrganizations,
  forceSuspendOrganization,
  forceActivateOrganization,
  forceDeleteOrganization,
  clearCurrentOrganization,
  clearErrors as clearOrganizationErrors,
  setFilters,
  resetFilters,
  setPagination,
  setAdminFilters,
  resetAdminFilters,
  setAdminPagination,
  clearAllOrganizations,
} from './organization.slice';

export {
  default as domainReducer,
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
  clearCurrentDomain,
  clearErrors as clearDomainErrors,
  setFilters as setDomainFilters,
  resetFilters as resetDomainFilters,
  setPagination as setDomainPagination,
  clearTenantDomains,
  clearAllDomains,
} from './domain.slice';

export {
  default as schemaReducer,
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
  clearCurrentSchema,
  clearErrors as clearSchemaErrors,
  setFilters as setSchemaFilters,
  resetFilters as resetSchemaFilters,
  setPagination as setSchemaPagination,
  clearTenantSchemas,
  clearAllSchemas,
} from './schema.slice';

export {
  default as resourceReducer,
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
  clearCurrentResource,
  clearErrors as clearResourceErrors,
  setFilters as setResourceFilters,
  resetFilters as resetResourceFilters,
  setPagination as setResourcePagination,
  clearTenantResources,
  clearAllResources,
} from './resource.slice';

export {
  default as connectionReducer,
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
  clearCurrentConnection,
  clearErrors as clearConnectionErrors,
  setFilters as setConnectionFilters,
  resetFilters as resetConnectionFilters,
  setPagination as setConnectionPagination,
  clearMetrics,
  clearTenantConnections,
  clearAllConnections,
  pauseConnection,
  resumeConnection,
  fetchDebugTraces,
} from './connection.slice';

export {
  default as migrationReducer,
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
  clearCurrentMigration,
  clearErrors as clearMigrationErrors,
  setFilters as setMigrationFilters,
  resetFilters as resetMigrationFilters,
  setPagination as setMigrationPagination,
  clearStats,
  clearTenantMigrations,
  clearAllMigrations,
} from './migration.slice';

export {
  default as dashboardReducer,
  fetchSuperAdminDashboard,
  fetchClientAdminDashboard,
  clearDashboard,
  clearSuperAdminDashboard,
  clearClientAdminDashboard,
  clearErrors as clearDashboardErrors,
} from './dashboard.slice';

export {
  default as settingsReducer,
  fetchSettings,
  fetchSettingsSection,
  updateSettings,
  updateSettingsSection,
  resetSettings,
  fetchSystemSettings,
  resetSystemSettings,
  clearSettings,
  clearErrors as clearSettingsErrors,
  clearSection,
  clearAllSections,
} from './settings.slice';

export {
  default as healthReducer,
  fetchHealth,
  fetchOrganizationsHealth,
  clearHealth,
  clearErrors as clearHealthErrors,
} from './health.slice';

export {
    default as sectorReducer,
    fetchSectors,
    fetchSector,
    createSector,
    updateSector,
    deleteSector,
    toggleSectorActive,
    clearCurrentSector,
    clearErrors as clearSectorErrors,
    setFilters as setSectorFilters,
    resetFilters as resetSectorFilters,
    setPagination as setSectorPagination,
    clearAllSectors,
} from './sector.slice';

export {
    default as provisioningReducer,
    fetchProvisioningList,
    fetchFailedProvisionings,
    fetchInProgressProvisionings,
    fetchProvisioningStatus,
    triggerProvisioning,
    retryProvisioning,
    rollbackProvisioning,
    clearCurrentProvision,
    clearProvisionError,
    clearActionError,
    setProvisionFilters,
    resetProvisionFilters,
    resetProvisionState,
} from './provision.slice';