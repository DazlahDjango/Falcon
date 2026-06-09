import { createApiClient, createRootClient, createAccountsClient } from './createClient';
import { resetCircuitBreaker } from './circuitBreaker';

export const rootApiClient = createRootClient();
export const accountsApiClient = createAccountsClient();

export const configApiClient = createApiClient({
  module: 'config', basePath: '/config', responseStyle: 'envelope',
  circuitBreaker: true, forbiddenMessage: 'You do not have permission to access this Config resource',
});

export const dashboardApiClient = createApiClient({
  module: 'dashboard', basePath: '/dashboard', responseStyle: 'envelope',
  circuitBreaker: true, forbiddenMessage: 'You do not have permission to access this dashboard',
});

export const billingApiClient = createApiClient({
  module: 'billing', basePath: '/billing', responseStyle: 'envelope',
  circuitBreaker: true, forbiddenMessage: 'You do not have permission to access this billing resource',
  attachTenantHeader: true,
});

export const structureApiClient = createApiClient({
  module: 'structure', basePath: '/structure', responseStyle: 'envelope',
  circuitBreaker: true, forbiddenMessage: 'You do not have permission to access this structure resource',
});

export const reviewsApiClient = createApiClient({
  module: 'reviews', basePath: '/reviews', responseStyle: 'raw',
  circuitBreaker: false,
  beforeRequest: async (config) => {
    const cycleId = typeof localStorage !== 'undefined' ? localStorage.getItem('current_cycle_id') : null;
    if (cycleId) { config.headers = config.headers || {}; config.headers['X-Review-Cycle-ID'] = cycleId; }
    return config;
  },
});

export const kpiApiClient = createApiClient({
  module: 'kpi',
  basePath: '',
  responseStyle: 'raw',
  circuitBreaker: false,
  forbiddenMessage: 'You do not have permission to access this KPI resource',
  attachTenantHeader: true,
});

const TENANT_RATE = { MAX: 100, WINDOW_MS: 60000, count: 0, windowStart: Date.now() };
function checkTenantRateLimit() {
  const now = Date.now();
  if (now - TENANT_RATE.windowStart > TENANT_RATE.WINDOW_MS) { TENANT_RATE.count = 0; TENANT_RATE.windowStart = now; }
  if (TENANT_RATE.count >= TENANT_RATE.MAX) { throw new Error('RATE_LIMIT_EXCEEDED'); }
  TENANT_RATE.count += 1;
}

export const tenantApiClient = createApiClient({
  module: 'tenant', basePath: '/tenant', responseStyle: 'envelope',
  circuitBreaker: false, forbiddenMessage: 'You do not have permission to perform this tenant action',
  beforeRequest: async (config) => {
    checkTenantRateLimit();
    config.headers = config.headers || {};
    config.headers['X-Correlation-ID'] = config.headers['X-Correlation-ID'] || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    return config;
  },
  onResponseSuccess: async (response) => {
    if (response.config?.method !== 'get') {
      try {
        const { auditLog } = await import('../tenant/auditService');
        await auditLog({ action: response.config.method?.toUpperCase(), resource: response.config.url, resourceId: response.data?.id || response.data?.tenant_id, service: 'tenant', timestamp: new Date().toISOString(), status: response.status });
      } catch { }
    }
    return response;
  },
});

export const resetConfigCircuitBreaker = () => resetCircuitBreaker('config');
export const resetDashboardCircuitBreaker = () => resetCircuitBreaker('dashboard');
export const resetBillingCircuitBreaker = () => resetCircuitBreaker('billing');
export const resetStructureCircuitBreaker = () => resetCircuitBreaker('structure');
export const resetKPICircuitBreaker = () => resetCircuitBreaker('kpi');