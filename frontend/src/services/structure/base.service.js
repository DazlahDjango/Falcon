import axios from 'axios';
import { store } from '../../store';
import { logout } from '../../store/accounts/slice/authSlice';
import { showToast } from '../../store/slices/uiSlice';
import { getAccessToken } from '../accounts/storage/secureStorage';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const STRUCTURE_API_BASE = `${API_BASE_URL}/structure`;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 60000;

// Circuit breaker state
let failureCount = 0;
let circuitOpen = false;
let circuitResetTime = null;
let isRefreshing = false;
let failedQueue = [];

// Helper functions
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
    console.warn(`[StructureService] Circuit breaker opened`);
  }
};

const recordSuccess = () => {
  failureCount = Math.max(0, failureCount - 1);
};

// Create axios instance
const apiClient = axios.create({
  baseURL: STRUCTURE_API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

// Request interceptor - Add auth token and tenant ID
apiClient.interceptors.request.use(
  async (config) => {
    // Circuit breaker check
    if (isCircuitOpen() && config.method !== 'get') {
      throw new Error('Service temporarily unavailable. Please try again later.');
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId();
    
    // Get token using your secure storage (like accounts service)
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Get tenant ID (same pattern as accounts)
    const tenantId = localStorage.getItem('falcon_tenant_id');
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    
    if (import.meta.env.DEV) {
      console.log(`[Structure API] ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('[Structure API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    recordSuccess();
    if (import.meta.env.DEV) {
      console.log(`[Structure API] Response ${response.status}: ${response.config.url}`);
    }
    
    // Standardize response format (adds consistency)
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
    
    // Handle token refresh (more robust than accounts service)
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while token is refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshTokenValue = localStorage.getItem('falcon_refresh_token');
        
        if (refreshTokenValue) {
          const response = await axios.post(`${API_BASE_URL}/accounts/auth/refresh/`, {
            refresh: refreshTokenValue,
          });
          
          if (response.data?.access) {
            localStorage.setItem('falcon_access_token', response.data.access);
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            processQueue(null, response.data.access);
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Dispatch logout action
        store.dispatch(logout());
        // Use your accounts storage cleanup
        localStorage.removeItem('falcon_access_token');
        localStorage.removeItem('falcon_refresh_token');
        localStorage.removeItem('falcon_tenant_id');
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please login again.'));
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle specific status codes (like accounts service + more)
    if (status === 403) {
      store.dispatch(showToast({ message: 'You do not have permission', type: 'error' }));
    } else if (status === 404) {
      return Promise.reject({ status, message, notFound: true });
    } else if (status === 429) {
      store.dispatch(showToast({ message: 'Too many requests. Try again later.', type: 'error' }));
    } else if (status >= 500) {
      store.dispatch(showToast({ message: 'Server error. Please try again.', type: 'error' }));
    }
    
    // Standardize error response (consistent with accounts)
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

// Retry wrapper
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
        console.warn(`[StructureService] Retry ${attempt}/${maxRetries}`);
        await delay(retryDelay * attempt);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

// Base Service Class
class BaseStructureService {
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
  
  async getStats(params = {}) {
    return withRetry(() => this.apiClient.get(this.getEndpoint('stats/'), { params }));
  }
  
  async exportData(format = 'csv', params = {}) {
    return withRetry(() => this.apiClient.get(this.getEndpoint(`export/${format}/`), {
      params,
      responseType: format === 'json' ? 'json' : 'blob',
    }));
  }
}

export { apiClient, withRetry, BaseStructureService };
export default BaseStructureService;