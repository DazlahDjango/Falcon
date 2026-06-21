/**
 * Factory for module-scoped axios instances (single configuration source).
 */
import axios from 'axios';
import {
  API_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_HEADERS,
  moduleBaseUrl,
} from './constants';
import { attachInterceptors } from './interceptors';

/**
 * @param {object} options
 * @param {string} options.module - Logging / circuit breaker key
 * @param {string} [options.basePath] - e.g. '/config' → /api/v1/config
 * @param {'raw'|'envelope'} [options.responseStyle]
 * @param {boolean} [options.circuitBreaker]
 * @param {boolean} [options.attachTenantHeader]
 * @param {string} [options.forbiddenMessage]
 * @param {function} [options.beforeRequest]
 * @param {function} [options.onResponseSuccess]
 * @param {number} [options.timeout]
 * @param {boolean} [options.withCredentials]
 */
export function createApiClient(options = {}) {
  const {
    module = 'api',
    basePath = '',
    responseStyle = 'raw',
    circuitBreaker = false,
    attachTenantHeader = true,
    forbiddenMessage = null,
    beforeRequest = null,
    onResponseSuccess = null,
    timeout = DEFAULT_TIMEOUT_MS,
    withCredentials = true,
    redirectOnSessionExpiry = true,
  } = options;

  const client = axios.create({
    baseURL: moduleBaseUrl(basePath),
    timeout,
    headers: { ...DEFAULT_HEADERS },
    withCredentials,
  });

  attachInterceptors(client, {
    module,
    responseStyle,
    circuitBreaker,
    attachTenantHeader,
    forbiddenMessage,
    beforeRequest,
    onResponseSuccess,
    redirectOnSessionExpiry,
  });

  return client;
}

/** Root /api/v1 client (KPI, notifications, shared endpoints) */
export function createRootClient(overrides = {}) {
  return createApiClient({
    module: 'root',
    basePath: '',
    responseStyle: 'raw',
    circuitBreaker: false,
    ...overrides,
  });
}

/** Accounts auth client — raw responses, no tenant header on login */
export function createAccountsClient(overrides = {}) {
  return createApiClient({
    module: 'accounts',
    basePath: '',
    responseStyle: 'raw',
    attachTenantHeader: true,
    redirectOnSessionExpiry: false,
    ...overrides,
  });
}

/** Admin client — no tenant header, for fetching all users/tenants across system */
export function createAdminClient(overrides = {}) {
  return createApiClient({
    module: 'admin',
    basePath: '',
    responseStyle: 'raw',
    attachTenantHeader: false,
    redirectOnSessionExpiry: false,
    ...overrides,
  });
}
