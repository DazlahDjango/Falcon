import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
  clearErrors as clearOrganizationErrors,
} from '../slice/organization.slice';

import {
  clearErrors as clearDomainErrors,
} from '../slice/domain.slice';

import {
  clearErrors as clearSchemaErrors,
} from '../slice/schema.slice';

import {
  clearErrors as clearResourceErrors,
} from '../slice/resource.slice';

import {
  clearErrors as clearConnectionErrors,
} from '../slice/connection.slice';

import {
  clearErrors as clearMigrationErrors,
} from '../slice/migration.slice';

import {
  clearErrors as clearDashboardErrors,
} from '../slice/dashboard.slice';

import {
  clearErrors as clearSettingsErrors,
} from '../slice/settings.slice';

import {
  clearErrors as clearHealthErrors,
} from '../slice/health.slice';

const errorHandlerMiddleware = createListenerMiddleware();

const errorActions = [
  { action: 'organization/fetchOrganizations/rejected', clear: clearOrganizationErrors },
  { action: 'organization/fetchOrganization/rejected', clear: clearOrganizationErrors },
  { action: 'organization/createOrganization/rejected', clear: clearOrganizationErrors },
  { action: 'organization/updateOrganization/rejected', clear: clearOrganizationErrors },
  { action: 'organization/deleteOrganization/rejected', clear: clearOrganizationErrors },
  { action: 'organization/onboardOrganization/rejected', clear: clearOrganizationErrors },
  { action: 'organization/activateOrganization/rejected', clear: clearOrganizationErrors },
  { action: 'organization/suspendOrganization/rejected', clear: clearOrganizationErrors },
  { action: 'domain/fetchDomains/rejected', clear: clearDomainErrors },
  { action: 'domain/fetchDomain/rejected', clear: clearDomainErrors },
  { action: 'domain/createDomain/rejected', clear: clearDomainErrors },
  { action: 'domain/updateDomain/rejected', clear: clearDomainErrors },
  { action: 'domain/deleteDomain/rejected', clear: clearDomainErrors },
  { action: 'domain/verifyDomain/rejected', clear: clearDomainErrors },
  { action: 'domain/setPrimaryDomain/rejected', clear: clearDomainErrors },
  { action: 'domain/renewSSL/rejected', clear: clearDomainErrors },
  { action: 'schema/fetchSchemas/rejected', clear: clearSchemaErrors },
  { action: 'schema/fetchSchema/rejected', clear: clearSchemaErrors },
  { action: 'schema/createSchema/rejected', clear: clearSchemaErrors },
  { action: 'schema/updateSchema/rejected', clear: clearSchemaErrors },
  { action: 'schema/deleteSchema/rejected', clear: clearSchemaErrors },
  { action: 'schema/provisionSchema/rejected', clear: clearSchemaErrors },
  { action: 'schema/dropSchema/rejected', clear: clearSchemaErrors },
  { action: 'resource/fetchResources/rejected', clear: clearResourceErrors },
  { action: 'resource/fetchResource/rejected', clear: clearResourceErrors },
  { action: 'resource/createResource/rejected', clear: clearResourceErrors },
  { action: 'resource/updateResource/rejected', clear: clearResourceErrors },
  { action: 'resource/deleteResource/rejected', clear: clearResourceErrors },
  { action: 'resource/resetResource/rejected', clear: clearResourceErrors },
  { action: 'connection/fetchConnections/rejected', clear: clearConnectionErrors },
  { action: 'connection/fetchConnection/rejected', clear: clearConnectionErrors },
  { action: 'connection/createConnection/rejected', clear: clearConnectionErrors },
  { action: 'connection/updateConnection/rejected', clear: clearConnectionErrors },
  { action: 'connection/deleteConnection/rejected', clear: clearConnectionErrors },
  { action: 'connection/closeConnection/rejected', clear: clearConnectionErrors },
  { action: 'migration/fetchMigrations/rejected', clear: clearMigrationErrors },
  { action: 'migration/fetchMigration/rejected', clear: clearMigrationErrors },
  { action: 'migration/createMigration/rejected', clear: clearMigrationErrors },
  { action: 'migration/updateMigration/rejected', clear: clearMigrationErrors },
  { action: 'migration/deleteMigration/rejected', clear: clearMigrationErrors },
  { action: 'migration/applyMigration/rejected', clear: clearMigrationErrors },
  { action: 'dashboard/fetchSuperAdminDashboard/rejected', clear: clearDashboardErrors },
  { action: 'dashboard/fetchClientAdminDashboard/rejected', clear: clearDashboardErrors },
  { action: 'settings/fetchSettings/rejected', clear: clearSettingsErrors },
  { action: 'settings/updateSettings/rejected', clear: clearSettingsErrors },
  { action: 'settings/resetSettings/rejected', clear: clearSettingsErrors },
  { action: 'settings/fetchSystemSettings/rejected', clear: clearSettingsErrors },
  { action: 'health/fetchHealth/rejected', clear: clearHealthErrors },
  { action: 'health/fetchOrganizationsHealth/rejected', clear: clearHealthErrors },
];

errorActions.forEach(({ action: actionType, clear }) => {
  errorHandlerMiddleware.startListening({
    matcher: (act) => act.type === actionType,
    effect: async (_, listenerApi) => {
      listenerApi.dispatch(clear());
    },
  });
});

export const errorHandlerMiddlewareInstance = errorHandlerMiddleware.middleware;