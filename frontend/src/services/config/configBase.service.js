import axios from 'axios';
import { store } from '../../store';
import { logout } from '../../store/accounts/slice/authSlice';
import { showToast } from '../../store/ui/slices/uiSlice';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, getTenantId, clearTenantId } from '../accounts/storage/secureStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const CONFIG_API_BASE = `${API_BASE_URL}/config`;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 60000;

let failureCount = 0;
let circuitOpen = false;
let circuitResetTime = null;
let isRefreshing = false;
let failedQueue = [];

const generateRequestId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const isCircuitOpen = () => {
  if (circuitOpen && circuitResetTime && Date.now() > circuitResetTime) {
    circuitOpen = false;
    failureCount = 0;
    circuitResetTime = null;
  }
  return circuitOpen;
};

const recordFailure = () => {
  failureCount++;
  if (failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitOpen = true;
    circuitResetTime = Date.now() + CIRCUIT_BREAKER_TIMEOUT;
    console.warn(`[ConfigService] Circuit breaker opened`);
  }
};

const recordSuccess = () => {
  failureCount = Math.max(0, failureCount - 1);
};

const apiClient = axios.create({
  baseURL: CONFIG_API_BASE,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  async (config) => {
    if (isCircuitOpen() && config.method !== 'get') {
      throw new Error('Service temporarily unavailable. Please try again later.');
    }
    config.headers['X-Request-ID'] = generateRequestId();
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    let tenantId = await getTenantId();
    if (!tenantId) {
      const state = store.getState();
      tenantId = state?.auth?.user?.tenant_id || state?.tenant?.currentTenant?.id;
    }
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    if (import.meta.env.DEV) {
      console.log(`[Config API] ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('[Config API] Request error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    recordSuccess();
    return {
      success: true,
      data: response.data,
      status: response.status,
      message: response.data?.message || 'Operation successful',
      timestamp: new Date().toISOString(),
    };
  },
  async (error) => {
    recordFailure();
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'An error occurred';
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshTokenValue = await getRefreshToken();
        if (refreshTokenValue) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshTokenValue,
          });
          if (response.data?.access) {
            await setTokens(response.data.access, refreshTokenValue);
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            processQueue(null, response.data.access);
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(logout());
        await clearTokens();
        await clearTenantId();
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please login again.'));
      } finally {
        isRefreshing = false;
      }
    }
    if (status === 403) {
      store.dispatch(showToast({ message: 'You do not have permission to access this Config resource', type: 'error' }));
    } else if (status === 429) {
      store.dispatch(showToast({ message: 'Too many requests. Please try again later.', type: 'error' }));
    } else if (status >= 500) {
      store.dispatch(showToast({ message: 'Config server error. Please try again.', type: 'error' }));
    }
    const standardizedError = {
      success: false,
      status: status || 0,
      message,
      errors: error.response?.data?.errors || null,
      timestamp: new Date().toISOString(),
    };
    return Promise.reject(standardizedError);
  }
);

const withRetry = async (fn, options = {}) => {
  const { maxRetries = MAX_RETRIES, retryDelay = RETRY_DELAY, retryOnStatus = [408, 429, 500, 502, 503, 504] } = options;
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
      const shouldRetry = retryOnStatus.includes(error.status) && attempt < maxRetries;
      if (shouldRetry) {
        console.warn(`[ConfigService] Retry ${attempt}/${maxRetries}`);
        await delay(retryDelay * attempt);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

class BaseConfigService {
  constructor(resourceName) {
    this.resourceName = resourceName;
    this.apiClient = apiClient;
    this.withRetry = withRetry;
  }
  getEndpoint(endpoint = '') {
    return endpoint ? `/${this.resourceName}/${endpoint}` : `/${this.resourceName}/`;
  }
  async list(params = {}) {
    return withRetry(() => this.apiClient.get(this.getEndpoint(), { params }));
  }
  async getById(id, params = {}) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(this.getEndpoint(`${id}/`), { params }));
  }
  async create(data) {
    if (!data) throw new Error('Data is required');
    return withRetry(() => this.apiClient.post(this.getEndpoint(), data));
  }
  async update(id, data, partial = true) {
    if (!id) throw new Error('ID is required');
    if (!data) throw new Error('Data is required');
    const method = partial ? 'patch' : 'put';
    return withRetry(() => this.apiClient[method](this.getEndpoint(`${id}/`), data));
  }
  async delete(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.delete(this.getEndpoint(`${id}/`)));
  }
}

export { apiClient, withRetry, BaseConfigService };