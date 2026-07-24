/**
 * Falcon unified HTTP layer — single place for axios configuration.
 *
 * Usage:
 *   import api from '@/services/api';              // KPI / shared (raw)
 *   import { configApiClient } from '@/services/api';
 *   import { accountsApiClient, request } from '@/services/api/accountsClient';
 */

import { API_BASE_URL, DEFAULT_TIMEOUT_MS } from './constants';
import { rootApiClient } from './clients';
import { attachInterceptors, addLoggingInterceptor } from './interceptors';

if (import.meta.env.DEV) {
  addLoggingInterceptor(rootApiClient);
}

export { API_BASE_URL, DEFAULT_TIMEOUT_MS } from './constants';
export { moduleBaseUrl, isAuthUrl, API_MODULE_PATHS } from './constants';

export {
  rootApiClient,
  accountsApiClient,
  configApiClient,
  dashboardApiClient,
  billingApiClient,
  structureApiClient,
  reviewsApiClient,
  tenantApiClient,
  kpiApiClient,
  reportApiClient,
  resetConfigCircuitBreaker,
  resetDashboardCircuitBreaker,
  resetBillingCircuitBreaker,
  resetStructureCircuitBreaker,
  resetKPICircuitBreaker,
  resetReportCircuitBreaker,
} from './clients';

export { createApiClient, createRootClient, createAccountsClient } from './createClient';
export { attachInterceptors, setupInterceptors, addLoggingInterceptor, addRetryInterceptor } from './interceptors';
export { withRetry, DEFAULT_RETRY_OPTIONS } from './withRetry';
export {
  refreshAccessToken,
  enqueueTokenRefresh,
  retryRequestAfterRefresh,
  isAuthOrClientError,
} from './tokenRefresh';
export {
  getCircuitBreaker,
  isCircuitOpen,
  recordCircuitFailure,
  recordCircuitSuccess,
  resetCircuitBreaker,
} from './circuitBreaker';
export { BaseResourceService } from './BaseResourceService';

export { default as API_ENDPOINTS } from './endpoints';
export * from './endpoints';
export { extractApiError } from './errorUtils';

/** Default export: root client for KPI and legacy `import api from '../api'` */
export default rootApiClient;

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  maxRetries: 3,
  retryDelay: 1000,
};

/** @deprecated Use rootApiClient */
export const axiosInstance = rootApiClient;
