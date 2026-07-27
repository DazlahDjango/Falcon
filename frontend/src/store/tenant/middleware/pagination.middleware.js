import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
  fetchOrganizations,
  fetchAdminOrganizations,
  setPagination,
  setAdminPagination,
} from '../slice/organization.slice';

import {
  fetchDomains,
  setPagination as setDomainPagination,
} from '../slice/domain.slice';

import {
  fetchSchemas,
  setPagination as setSchemaPagination,
} from '../slice/schema.slice';

import {
  fetchResources,
  setPagination as setResourcePagination,
} from '../slice/resource.slice';

import {
  fetchConnections,
  setPagination as setConnectionPagination,
} from '../slice/connection.slice';

import {
  fetchMigrations,
  setPagination as setMigrationPagination,
} from '../slice/migration.slice';

const paginationMiddleware = createListenerMiddleware();

const paginationConfig = {
  [fetchOrganizations.typePrefix]: {
    setPagination: setPagination,
    getPagination: (state) => state.organization?.pagination,
  },
  [fetchAdminOrganizations.typePrefix]: {
    setPagination: setAdminPagination,
    getPagination: (state) => state.organization?.adminPagination,
  },
  [fetchDomains.typePrefix]: {
    setPagination: setDomainPagination,
    getPagination: (state) => state.domain?.pagination,
  },
  [fetchSchemas.typePrefix]: {
    setPagination: setSchemaPagination,
    getPagination: (state) => state.schema?.pagination,
  },
  [fetchResources.typePrefix]: {
    setPagination: setResourcePagination,
    getPagination: (state) => state.resource?.pagination,
  },
  [fetchConnections.typePrefix]: {
    setPagination: setConnectionPagination,
    getPagination: (state) => state.connection?.pagination,
  },
  [fetchMigrations.typePrefix]: {
    setPagination: setMigrationPagination,
    getPagination: (state) => state.migration?.pagination,
  },
};

Object.entries(paginationConfig).forEach(([typePrefix, config]) => {
  paginationMiddleware.startListening({
    predicate: (action) => action.type?.startsWith(typePrefix),
    effect: async (action, listenerApi) => {
      const state = listenerApi.getState();
      const pagination = config.getPagination(state);
      if (action.meta?.arg?.page && pagination) {
        const currentPage = pagination.page || 1;
        if (action.meta.arg.page !== currentPage) {
          listenerApi.dispatch(config.setPagination({ page: action.meta.arg.page }));
        }
      }
      if (action.meta?.arg?.pageSize && pagination) {
        const currentSize = pagination.pageSize || 20;
        if (action.meta.arg.pageSize !== currentSize) {
          listenerApi.dispatch(config.setPagination({ pageSize: action.meta.arg.pageSize }));
        }
      }
    },
  });
});

export const paginationMiddlewareInstance = paginationMiddleware.middleware;