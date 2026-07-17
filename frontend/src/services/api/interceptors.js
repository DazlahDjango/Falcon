/**
 * Shared axios interceptors — auth, tenant header, refresh, rate limits, envelopes.
 */
import { logout } from '../../store/accounts/slice/authSlice';
import { showToast } from '../../store/ui/slices/uiSlice';
import {
  getAccessToken,
  getTenantId,
  clearTenantId,
} from '../accounts/storage/secureStorage';
import { retryRequestAfterRefresh } from './tokenRefresh';
import { isAuthUrl } from './constants';
import {
  isCircuitOpen,
  recordCircuitFailure,
  recordCircuitSuccess,
} from './circuitBreaker';

const generateRequestId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

// Prevent rapid successive redirects
let lastRedirectTime = 0;
const MIN_REDIRECT_INTERVAL = 30000; // 30 seconds minimum between redirects

async function resolveTenantId() {
  let tenantId = await getTenantId();
  if (!tenantId) {
    try {
      const { store } = await import('../../store');
      const state = store.getState();
      tenantId =
        state?.auth?.user?.tenant_id ||
        state?.tenant?.organization?.currentOrganization?.id ||
        state?.tenant?.currentTenant?.id ||
        state?.appTenant?.currentTenant?.id;
    } catch (err) {
      console.error('Failed to load store dynamically in request interceptor:', err);
    }
  }
  return tenantId;
}

/**
 * @param {import('axios').AxiosInstance} client
 * @param {object} options
 * @param {string} options.module - Label for logs / circuit breaker
 * @param {'raw'|'envelope'} options.responseStyle - raw axios vs { success, data }
 * @param {boolean} options.circuitBreaker - Block mutating calls when open
 * @param {boolean} options.attachTenantHeader - X-Tenant-ID
 * @param {string} [options.forbiddenMessage] - Toast on 403
 * @param {function} [options.beforeRequest] - async (config) => config
 * @param {function} [options.onResponseSuccess] - async (response) => response
 * @param {boolean} options.redirectOnSessionExpiry
 */
export function attachInterceptors(client, options = {}) {
  const {
    module = 'api',
    responseStyle = 'raw',
    circuitBreaker = false,
    attachTenantHeader = true,
    forbiddenMessage = null,
    beforeRequest = null,
    onResponseSuccess = null,
    redirectOnSessionExpiry = true,
  } = options;

  client.interceptors.request.use(
    async (config) => {
      if (circuitBreaker && isCircuitOpen(module) && config.method !== 'get') {
        throw new Error('Service temporarily unavailable. Please try again later.');
      }

      config.headers = config.headers || {};
      config.headers['X-Request-ID'] = generateRequestId();

      const url = config.url || '';
      if (!isAuthUrl(url)) {
        const token = await getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      if (attachTenantHeader && !isAuthUrl(url)) {
        const tenantId = await resolveTenantId();
        if (tenantId) {
          config.headers['X-Tenant-ID'] = String(tenantId);
        }
      }

      if (beforeRequest) {
        config = await beforeRequest(config);
      }

      if (import.meta.env.DEV) {
        console.log(`[${module}] ${(config.method || 'get').toUpperCase()} ${url}`);
      }

      return config;
    },
    (error) => {
      if (error?.message === 'RATE_LIMIT_EXCEEDED') {
        return Promise.reject({
          success: false,
          status: 429,
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
        });
      }
      return Promise.reject(error);
    },
  );

  client.interceptors.response.use(
    async (response) => {
      if (circuitBreaker) {
        recordCircuitSuccess(module);
      }

      let res = response;
      if (onResponseSuccess) {
        res = await onResponseSuccess(res);
      }

      if (responseStyle === 'envelope') {
        return {
          success: true,
          data: res.data,
          status: res.status,
          message: res.data?.message || 'Operation successful',
          timestamp: new Date().toISOString(),
        };
      }

      return res;
    },
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;

      if (circuitBreaker) {
        recordCircuitFailure(module, status);
      }

      if (status === 401 && originalRequest && !isAuthUrl(originalRequest.url || '')) {
        try {
          return await retryRequestAfterRefresh(originalRequest, (cfg) => client(cfg));
        } catch (refreshError) {
          try {
            const { store } = await import('../../store');
            store.dispatch(logout());
          } catch (err) {
            console.error('Failed to load store in 401 handler:', err);
          }
          await clearTenantId();
          if (redirectOnSessionExpiry) {
            // Prevent rapid successive redirects
            const now = Date.now();
            if (now - lastRedirectTime > MIN_REDIRECT_INTERVAL) {
              lastRedirectTime = now;
              window.location.href = '/login';
            }
          }
          return Promise.reject(
            refreshError?.message
              ? refreshError
              : new Error('Session expired. Please login again.'),
          );
        }
      }

      if (status === 403 && forbiddenMessage) {
        try {
          const { store } = await import('../../store');
          store.dispatch(showToast({ message: forbiddenMessage, type: 'error' }));
        } catch (err) {
          console.error('Failed to load store in 403 handler:', err);
        }
      } else if (status === 429 && originalRequest && !originalRequest._rateLimitRetry) {
        originalRequest._rateLimitRetry = true;
        const raw = parseInt(error.response?.headers?.['retry-after'], 10) || 2;
        const waitSec = Math.min(raw, import.meta.env.DEV ? 5 : 30);
        await new Promise((resolve) => setTimeout(resolve, waitSec * 1000));
        return client(originalRequest);
      } else if (status >= 500 && forbiddenMessage) {
        try {
          const { store } = await import('../../store');
          store.dispatch(
            showToast({ message: `${module} server error. Please try again.`, type: 'error' }),
          );
        } catch (err) {
          console.error('Failed to load store in 500 handler:', err);
        }
      }

      if (responseStyle === 'envelope') {
        console.log('[Envelope Error] Full error response:', error.response);
        console.log('[Envelope Error] Response data:', error.response?.data);
        
        // Handle both { errors: ... } and direct field errors like { code: [...], name: [...] }
        let errors = null;
        let message = 'An error occurred';
        
        if (error.response?.data?.message || error.response?.data?.detail) {
          message = error.response?.data?.message || error.response?.data?.detail;
        }
        
        if (error.response?.data?.errors) {
          errors = error.response.data.errors;
        } else if (error.response?.data && typeof error.response.data === 'object') {
          // If it's a direct validation error object
          errors = {};
          for (const [key, value] of Object.entries(error.response.data)) {
            if (Array.isArray(value) || typeof value === 'string') {
              errors[key] = value;
            }
          }
          // Set message from first error if no message exists
          if (!message && Object.keys(errors).length > 0) {
            const firstKey = Object.keys(errors)[0];
            const firstError = errors[firstKey];
            message = `${firstKey}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
          }
        }
        
        if (!message) {
          message = error.message || 'An error occurred';
        }
        
        return Promise.reject({
          success: false,
          status: status || 0,
          message,
          errors,
          rawResponse: error.response?.data,
          timestamp: new Date().toISOString(),
        });
      }

      return Promise.reject(error);
    },
  );

  return client;
}

/** @deprecated Use attachInterceptors via createApiClient */
export const setupInterceptors = attachInterceptors;

export const addRequestIdInterceptor = (api) => {
  api.interceptors.request.use((config) => {
    config.headers['X-Request-ID'] = generateRequestId();
    return config;
  });
};

export const addLoggingInterceptor = (api) => {
  if (!import.meta.env.DEV) return;
  api.interceptors.request.use((config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  });
  api.interceptors.response.use(
    (response) => {
      console.log(`[API Response] ${response.status} ${response.config?.url}`, response.data);
      return response;
    },
    (error) => {
      console.error(
        `[API Error] ${error.response?.status} ${error.config?.url}`,
        error.response?.data,
      );
      return Promise.reject(error);
    },
  );
};

export const addRetryInterceptor = (api, maxRetries = 3, retryDelay = 1000) => {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config } = error;
      if (!config) return Promise.reject(error);
      if (config.retry == null) config.retry = 0;
      const shouldRetry = !error.response || error.response.status >= 500;
      if (shouldRetry && config.retry < maxRetries) {
        config.retry += 1;
        await new Promise((resolve) => setTimeout(resolve, retryDelay * config.retry));
        return api(config);
      }
      return Promise.reject(error);
    },
  );
};
