/**
 * Pre-configured HTTP clients per Django app — import these from base services.
 */
import { createApiClient, createRootClient, createAccountsClient } from './createClient';
import { resetCircuitBreaker } from './circuitBreaker';
import { isAuthUrl } from './constants';

// —— Root (KPI, files, notifications) — raw axios response ——
export const rootApiClient = createRootClient();

// —— Accounts (auth, users, admin) — raw ——
export const accountsApiClient = createAccountsClient();

// Add the accounts-specific interceptor here instead of in accountsClient.js
accountsApiClient.interceptors.request.use(
  async (config) => {
    if (isAuthUrl(config.url || '')) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// —— Config — envelope + circuit breaker ——
export const configApiClient = createApiClient({
  module: 'config',
  basePath: '/config',
  responseStyle: 'envelope',
  circuitBreaker: true,
  forbiddenMessage: 'You do not have permission to access this Config resource',
});

// —— Dashboard — envelope + circuit breaker ——
export const dashboardApiClient = createApiClient({
  module: 'dashboard',
  basePath: '/dashboard',
  responseStyle: 'envelope',
  circuitBreaker: true,
  forbiddenMessage: 'You do not have permission to access this dashboard',
});

// —— Billing ——
export const billingApiClient = createApiClient({
  module: 'billing',
  basePath: '/billing',
  responseStyle: 'envelope',
  circuitBreaker: true,
  forbiddenMessage: 'You do not have permission to access this billing resource',
});

// —— Structure ——
export const structureApiClient = createApiClient({
  module: 'structure',
  basePath: '/structure',
  responseStyle: 'envelope',
  circuitBreaker: true,
  forbiddenMessage: 'You do not have permission to access this structure resource',
});

// —— Reviews — raw (legacy services expect response.data) ——
export const reviewsApiClient = createApiClient({
  module: 'reviews',
  basePath: '/reviews',
  responseStyle: 'raw',
  circuitBreaker: false,
  beforeRequest: async (config) => {
    const cycleId = typeof localStorage !== 'undefined'
      ? localStorage.getItem('current_cycle_id')
      : null;
    if (cycleId) {
      config.headers = config.headers || {};
      config.headers['X-Review-Cycle-ID'] = cycleId;
    }
    return config;
  },
});

// —— Tenant — envelope + client-side rate limit + audit hooks ——
const TENANT_RATE = { MAX: 100, WINDOW_MS: 60000, count: 0, windowStart: Date.now() };

function checkTenantRateLimit() {
  const now = Date.now();
  if (now - TENANT_RATE.windowStart > TENANT_RATE.WINDOW_MS) {
    TENANT_RATE.count = 0;
    TENANT_RATE.windowStart = now;
  }
  if (TENANT_RATE.count >= TENANT_RATE.MAX) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }
  TENANT_RATE.count += 1;
}

export const tenantApiClient = createApiClient({
  module: 'tenant',
  basePath: '/tenant',
  responseStyle: 'envelope',
  circuitBreaker: false,
  forbiddenMessage: 'You do not have permission to perform this tenant action',
  beforeRequest: async (config) => {
    checkTenantRateLimit();
    config.headers = config.headers || {};
    config.headers['X-Correlation-ID'] =
      config.headers['X-Correlation-ID'] ||
      `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    return config;
  },
  onResponseSuccess: async (response) => {
    if (response.config?.method !== 'get') {
      try {
        const { auditLog } = await import('../tenant/auditService');
        await auditLog({
          action: response.config.method?.toUpperCase(),
          resource: response.config.url,
          resourceId: response.data?.id || response.data?.tenant_id,
          service: 'tenant',
          timestamp: new Date().toISOString(),
          status: response.status,
        });
      } catch {
        /* non-blocking */
      }
    }
    return response;
  },
});

export const resetConfigCircuitBreaker = () => resetCircuitBreaker('config');
export const resetDashboardCircuitBreaker = () => resetCircuitBreaker('dashboard');
export const resetBillingCircuitBreaker = () => resetCircuitBreaker('billing');
export const resetStructureCircuitBreaker = () => resetCircuitBreaker('structure');
