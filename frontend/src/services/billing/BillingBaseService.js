import axios from 'axios';
import { store } from '../../store';
import { logout } from '../../store/accounts/slice/authSlice';
import { showToast } from '../../store/ui/slices/uiSlice';
import {
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    getTenantId,
    clearTenantId,
} from '../accounts/storage/secureStorage';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const BILLING_API_BASE = `${API_BASE_URL}/billing`;

// Retry configuration
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 10000;

// Circuit breaker configuration
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 60 seconds
const CIRCUIT_BREAKER_HALF_OPEN_TIMEOUT = 30000; // 30 seconds

// Circuit breaker state
let failureCount = 0;
let circuitOpen = false;
let circuitOpenTime = null;
let halfOpenRequests = 0;
const MAX_HALF_OPEN_REQUESTS = 3;

// Token refresh state
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

// Circuit breaker helpers
const isCircuitOpen = () => {
    if (circuitOpen && circuitOpenTime && Date.now() > circuitOpenTime + CIRCUIT_BREAKER_TIMEOUT) {
        // Enter half-open state
        circuitOpen = false;
        halfOpenRequests = 0;
        failureCount = 0;
        circuitOpenTime = null;
        console.log('[BillingService] Circuit breaker half-open - allowing test request');
        return false;
    }
    return circuitOpen;
};

const recordFailure = () => {
    if (circuitOpen) return;
    
    failureCount++;
    if (failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
        circuitOpen = true;
        circuitOpenTime = Date.now();
        console.warn(`[BillingService] Circuit breaker OPEN - service degraded`);
        
        // Show notification to user
        store.dispatch(showToast({
            message: 'Billing service temporarily unavailable. Please try again later.',
            type: 'error',
            duration: 5000,
        }));
    }
};

const recordSuccess = () => {
    if (circuitOpen) {
        halfOpenRequests++;
        if (halfOpenRequests >= MAX_HALF_OPEN_REQUESTS) {
            circuitOpen = false;
            failureCount = 0;
            circuitOpenTime = null;
            halfOpenRequests = 0;
            console.log('[BillingService] Circuit breaker CLOSED - service recovered');
        }
    } else {
        failureCount = Math.max(0, failureCount - 1);
    }
};

// Create axios instance
const billingApiClient = axios.create({
    baseURL: BILLING_API_BASE,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

// Request interceptor - Add auth token and tenant ID
billingApiClient.interceptors.request.use(
    async (config) => {
        // Circuit breaker check for non-GET requests
        if (isCircuitOpen() && config.method !== 'get') {
            throw new Error('Service temporarily unavailable. Please try again later.');
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = generateRequestId();
        
        // Get token using secure storage
        const token = await getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('[Billing API] No access token found - user may not be authenticated');
        }
        
        // Get tenant ID from secure storage
        let tenantId = await getTenantId();
        
        // Fallback to Redux store if secure storage doesn't have it
        if (!tenantId) {
            const state = store.getState();
            tenantId = state?.auth?.user?.tenant_id || state?.tenant?.currentTenant?.id;
        }

        if (tenantId) {
            config.headers['X-Tenant-ID'] = tenantId;
        }
        
        if (import.meta.env.DEV) {
            console.log(`[Billing API] ${config.method.toUpperCase()} ${config.url}`);
        }
        
        return config;
    },
    (error) => {
        console.error('[Billing API] Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - Handle responses and errors
billingApiClient.interceptors.response.use(
    (response) => {
        recordSuccess();
        
        if (import.meta.env.DEV) {
            console.log(`[Billing API] Response ${response.status}: ${response.config.url}`);
        }
        
        // Standardize response format
        return {
            success: true,
            data: response.data,
            status: response.status,
            message: response.data?.message || response.data?.status || 'Operation successful',
            timestamp: new Date().toISOString(),
        };
    },
    async (error) => {
        recordFailure();
        
        const originalRequest = error.config;
        const status = error.response?.status;
        const message = error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred';
        
        // Handle token refresh for 401 errors
        if (status === 401 && !originalRequest?._retry) {
            if (isRefreshing) {
                // Queue requests while token is refreshing
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => billingApiClient(originalRequest));
            }
            
            if (originalRequest) originalRequest._retry = true;
            isRefreshing = true;
            
            try {
                const refreshTokenValue = await getRefreshToken();
                
                if (refreshTokenValue) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                        refresh: refreshTokenValue,
                    });
                    
                    if (response.data?.access) {
                        await setTokens(response.data.access, refreshTokenValue);
                        
                        if (originalRequest) {
                            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                        }
                        processQueue(null, response.data.access);
                        return billingApiClient(originalRequest);
                    }
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Dispatch logout action
                store.dispatch(logout());
                await clearTokens();
                await clearTenantId();
                
                // Don't redirect if we're already on login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
                return Promise.reject(new Error('Session expired. Please login again.'));
            } finally {
                isRefreshing = false;
            }
        }
        
        // Handle specific status codes
        if (status === 402) {
            // Payment required - subscription expired or not active
            store.dispatch(showToast({
                message: message || 'Payment required. Please update your subscription.',
                type: 'warning',
                duration: 5000,
            }));
        } else if (status === 403) {
            store.dispatch(showToast({
                message: message || 'You do not have permission to perform this action',
                type: 'error',
            }));
        } else if (status === 404) {
            // Don't show toast for 404s - let components handle it
            console.warn(`[Billing API] Resource not found: ${originalRequest?.url}`);
        } else if (status === 429) {
            store.dispatch(showToast({
                message: message || 'Too many requests. Please try again later.',
                type: 'error',
            }));
        } else if (status >= 500) {
            store.dispatch(showToast({
                message: message || 'Server error. Please try again.',
                type: 'error',
            }));
        }
        
        // Extract validation errors if present
        const errors = error.response?.data?.errors || error.response?.data?.error_details || null;
        
        // Standardize error response
        const standardizedError = {
            success: false,
            status: status || 0,
            message,
            errors,
            code: error.response?.data?.code,
            timestamp: new Date().toISOString(),
            originalError: error,
        };
        
        return Promise.reject(standardizedError);
    }
);

// Retry wrapper with exponential backoff
const withRetry = async (fn, options = {}) => {
    const {
        maxRetries = MAX_RETRIES,
        baseDelay = BASE_RETRY_DELAY,
        maxDelay = MAX_RETRY_DELAY,
        retryOnStatus = [408, 429, 500, 502, 503, 504],
        retryOnErrors = ['NetworkError', 'TimeoutError'],
    } = options;
    
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await fn();
            return result;
        } catch (error) {
            lastError = error;
            
            // Check if we should retry based on status or error type
            const shouldRetryStatus = retryOnStatus.includes(error.status);
            const shouldRetryError = retryOnErrors.some(errType => 
                error.message?.includes(errType) || error.name?.includes(errType)
            );
            const shouldRetry = (shouldRetryStatus || shouldRetryError) && attempt < maxRetries;
            
            if (shouldRetry) {
                const delayTime = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
                console.warn(`[BillingService] Retry ${attempt}/${maxRetries} after ${delayTime}ms`);
                await delay(delayTime);
                continue;
            }
            throw error;
        }
    }
    throw lastError;
};

// Base Service Class
class BillingBaseService {
    constructor(resourceName) {
        this.resourceName = resourceName;
        this.apiClient = billingApiClient;
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

export {
    billingApiClient,
    withRetry,
    BillingBaseService,
    recordFailure,
    recordSuccess,
    isCircuitOpen,
};