// frontend/src/services/billing/BillingBaseService.js

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

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const BILLING_API_BASE = `${API_BASE_URL}/billing`;

// Retry configuration
const MAX_RETRIES = 2;
const BASE_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 5000;

// Circuit breaker configuration
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 60000;

// Cache configuration
const CACHE_TTL = 30000; // 30 seconds
const cache = new Map();

// Request cancellation
const activeRequests = new Map();

// Circuit breaker state
let failureCount = 0;
let circuitOpen = false;
let circuitOpenTime = null;
let halfOpenSuccessCount = 0;
const HALF_OPEN_MAX_SUCCESS = 2;

// Token refresh state
let isRefreshing = false;
let failedQueue = [];

// ============================================================================
// Helper Functions
// ============================================================================

const generateRequestId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getCacheKey = (url, params = {}) => {
    return `${url}|${JSON.stringify(params)}`;
};

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

const isCircuitOpen = () => {
    if (circuitOpen && circuitOpenTime && Date.now() > circuitOpenTime + CIRCUIT_BREAKER_TIMEOUT) {
        circuitOpen = false;
        halfOpenSuccessCount = 0;
        failureCount = 0;
        circuitOpenTime = null;
        console.log('[BillingService] Circuit breaker half-open');
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
        console.warn('[BillingService] Circuit breaker OPEN');
        store.dispatch(showToast({
            message: 'Billing service temporarily unavailable. Please try again later.',
            type: 'error',
            duration: 5000,
        }));
    }
};

const recordSuccess = () => {
    if (circuitOpen) {
        halfOpenSuccessCount++;
        if (halfOpenSuccessCount >= HALF_OPEN_MAX_SUCCESS) {
            circuitOpen = false;
            failureCount = 0;
            circuitOpenTime = null;
            halfOpenSuccessCount = 0;
            console.log('[BillingService] Circuit breaker CLOSED');
        }
    } else {
        failureCount = Math.max(0, failureCount - 1);
    }
};

// ============================================================================
// Create Axios Instance
// ============================================================================

const billingApiClient = axios.create({
    baseURL: BILLING_API_BASE,
    timeout: 15000, // Reduced from 30s to 15s
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

// ============================================================================
// Request Interceptor
// ============================================================================

billingApiClient.interceptors.request.use(
    async (config) => {
        // Circuit breaker check (skip for GET requests)
        if (isCircuitOpen() && config.method !== 'get') {
            const error = new Error('Service temporarily unavailable');
            error.isCircuitBreakerError = true;
            throw error;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = generateRequestId();
        
        // Get token using secure storage
        const token = await getAccessToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Get tenant ID from secure storage
        let tenantId = await getTenantId();
        
        // Fallback to Redux store if secure storage doesn't have it
        if (!tenantId) {
            const state = store.getState();
            tenantId = state?.auth?.user?.tenant_id || state?.tenant?.currentTenant?.id;
        }

        // Set tenant ID header if available
        if (tenantId) {
            config.headers['X-Tenant-ID'] = tenantId;
        }
        
        if (import.meta.env.DEV) {
            console.log(`[Billing API] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
        }
        
        return config;
    },
    (error) => {
        console.error('[Billing API] Request error:', error);
        return Promise.reject(error);
    }
);

// ============================================================================
// Response Interceptor
// ============================================================================

billingApiClient.interceptors.response.use(
    (response) => {
        recordSuccess();
        
        // Standardize response format
        let responseData = response.data;
        let responseMessage = response.data?.message || response.data?.status || 'Operation successful';
        
        // Handle DRF paginated responses
        if (responseData && typeof responseData === 'object') {
            if ('results' in responseData && 'count' in responseData) {
                // Already paginated, keep as is
                responseData = responseData;
            } else if ('data' in responseData && responseData.data !== undefined) {
                responseData = responseData.data;
            }
        }
        
        return {
            success: true,
            data: responseData,
            status: response.status,
            message: responseMessage,
            timestamp: new Date().toISOString(),
        };
    },
    async (error) => {
        // Handle cancelled requests gracefully
        if (axios.isCancel(error) || error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
            return {
                success: false,
                cancelled: true,
                message: 'Request cancelled',
                status: 0,
            };
        }
        
        recordFailure();
        
        const originalRequest = error.config;
        const status = error.response?.status;
        const errorData = error.response?.data;
        
        // Handle timeout errors
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            return {
                success: false,
                timeout: true,
                message: 'Request timeout. Please try again.',
                status: 408,
            };
        }
        
        // Extract error message
        let message = 'An error occurred';
        if (errorData) {
            message = errorData.message 
                || errorData.error 
                || errorData.detail 
                || errorData.non_field_errors?.[0]
                || error.message;
        } else if (error.message) {
            message = error.message;
        }
        
        // Handle token refresh for 401 errors
        if (status === 401 && !originalRequest?._retry && !originalRequest?.url?.includes('/auth/refresh/')) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return billingApiClient(originalRequest);
                }).catch((err) => Promise.reject(err));
            }
            
            if (originalRequest) originalRequest._retry = true;
            isRefreshing = true;
            
            try {
                const refreshTokenValue = await getRefreshToken();
                
                if (!refreshTokenValue) {
                    throw new Error('No refresh token available');
                }
                
                const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                    refresh: refreshTokenValue,
                });
                
                if (response.data?.access) {
                    const newAccessToken = response.data.access;
                    await setTokens(newAccessToken, refreshTokenValue);
                    
                    if (originalRequest) {
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    }
                    
                    processQueue(null, newAccessToken);
                    return billingApiClient(originalRequest);
                } else {
                    throw new Error('Invalid refresh response');
                }
            } catch (refreshError) {
                console.error('[Billing API] Token refresh failed:', refreshError);
                processQueue(refreshError, null);
                
                await clearTokens();
                await clearTenantId();
                store.dispatch(logout());
                
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
                
                return Promise.reject({
                    success: false,
                    status: 401,
                    message: 'Session expired. Please login again.',
                });
            } finally {
                isRefreshing = false;
            }
        }
        
        // Handle specific status codes (don't show toast for 404s or cancellations)
        if (status !== 404 && message && status !== 401 && !error.cancelled) {
            let toastType = 'error';
            if (status === 402) toastType = 'warning';
            if (status === 409) toastType = 'warning';
            
            store.dispatch(showToast({
                message: message,
                type: toastType,
                duration: status === 402 ? 7000 : 4000,
            }));
        }
        
        // Extract validation errors
        let errors = null;
        if (errorData?.errors) {
            errors = errorData.errors;
        } else if (errorData?.error_details) {
            errors = errorData.error_details;
        }
        
        // Standardize error response
        const standardizedError = {
            success: false,
            status: status || 0,
            message: message,
            errors: errors,
            code: errorData?.code || errorData?.error_code,
            timestamp: new Date().toISOString(),
        };
        
        return Promise.reject(standardizedError);
    }
);

// ============================================================================
// Retry Wrapper
// ============================================================================

const withRetry = async (fn, options = {}) => {
    const {
        maxRetries = MAX_RETRIES,
        baseDelay = BASE_RETRY_DELAY,
        maxDelay = MAX_RETRY_DELAY,
        retryOnStatus = [408, 429, 500, 502, 503, 504],
    } = options;
    
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await fn();
            return result;
        } catch (error) {
            lastError = error;
            
            // Don't retry on auth errors, client errors (except 408, 429), or cancelled requests
            const isAuthError = error.status === 401 || error.status === 403;
            const isClientError = error.status >= 400 && error.status < 500 && ![408, 429].includes(error.status);
            const isCancelled = error.cancelled === true;
            
            if (isAuthError || isClientError || isCancelled) {
                throw error;
            }
            
            const shouldRetry = retryOnStatus.includes(error.status) && attempt < maxRetries;
            
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

// ============================================================================
// Base Billing Service Class
// ============================================================================

class BillingBaseService {
    constructor(resourceName) {
        if (!resourceName) {
            throw new Error('Resource name is required for BillingBaseService');
        }
        this.resourceName = resourceName;
        this.apiClient = billingApiClient;
        this.withRetry = withRetry;
    }
    
    /**
     * Cancel any pending request for the given endpoint
     */
    cancelPendingRequest(endpoint) {
        const controller = activeRequests.get(endpoint);
        if (controller) {
            controller.abort();
            activeRequests.delete(endpoint);
        }
    }
    
    /**
     * Get full endpoint URL
     */
   getEndpoint(endpoint = '') {
       const cleanEndpoint = endpoint.replace(/^\//, '');
       let result = '';
       
        // If endpoint already starts with the resource name, don't add it again
        if (cleanEndpoint.startsWith(this.resourceName)) {
            result = `/${cleanEndpoint}`;
        } else if (this.resourceName === 'admin') {
            result = cleanEndpoint ? `/admin/${cleanEndpoint}` : '/admin/';
        } else if (cleanEndpoint) {
            result = `/${this.resourceName}/${cleanEndpoint}`;
        } else {
            result = `/${this.resourceName}/`;
        }
        
        if (!result.endsWith('/') && !result.includes('?')) {
            result += '/';
        }
        return result;
    }
    
    /**
     * GET /{resource}/ - List all resources with caching and cancellation
     */
    async list(params = {}, options = {}) {
        const { useCache = true, cacheTtl = CACHE_TTL, skipCancel = false } = options;
        const endpoint = this.getEndpoint();
        const cacheKey = getCacheKey(endpoint, params);
        
        // Check cache
        if (useCache && cache.has(cacheKey)) {
            const cached = cache.get(cacheKey);
            if (Date.now() - cached.timestamp < cacheTtl) {
                return cached.data;
            }
            cache.delete(cacheKey);
        }
        
        // Cancel previous pending request for same endpoint
        if (!skipCancel) {
            this.cancelPendingRequest(endpoint);
        }
        
        const controller = new AbortController();
        activeRequests.set(endpoint, controller);
        
        try {
            const result = await this.withRetry(() => 
                this.apiClient.get(endpoint, { 
                    params, 
                    signal: controller.signal,
                })
            );
            
            activeRequests.delete(endpoint);
            
            // Cache successful result
            if (useCache && result.success) {
                cache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now(),
                });
            }
            
            return result;
        } catch (error) {
            activeRequests.delete(endpoint);
            
            if (error.cancelled) {
                return { success: false, cancelled: true, message: 'Request cancelled' };
            }
            throw error;
        }
    }
    
    /**
     * GET /{resource}/{id}/ - Get single resource with caching
     */
    async getById(id, params = {}, options = {}) {
        if (!id) throw new Error('ID is required');
        
        const { useCache = true, cacheTtl = CACHE_TTL } = options;
        const endpoint = this.getEndpoint(`${id}/`);
        const cacheKey = getCacheKey(endpoint, params);
        
        // Check cache
        if (useCache && cache.has(cacheKey)) {
            const cached = cache.get(cacheKey);
            if (Date.now() - cached.timestamp < cacheTtl) {
                return cached.data;
            }
            cache.delete(cacheKey);
        }
        
        const result = await this.withRetry(() => 
            this.apiClient.get(endpoint, { params })
        );
        
        // Cache successful result
        if (useCache && result.success) {
            cache.set(cacheKey, {
                data: result,
                timestamp: Date.now(),
            });
        }
        
        return result;
    }
    
    /**
     * POST /{resource}/ - Create resource
     */
    async create(data) {
        if (!data) throw new Error('Data is required');
        
        // Invalidate cache for list endpoints
        this.invalidateCache();
        
        return this.withRetry(() => this.apiClient.post(this.getEndpoint(), data));
    }
    
    /**
     * PUT/PATCH /{resource}/{id}/ - Update resource
     */
    async update(id, data, partial = true) {
        if (!id) throw new Error('ID is required');
        if (!data) throw new Error('Data is required');
        
        // Invalidate cache
        this.invalidateCache();
        
        const method = partial ? 'patch' : 'put';
        return this.withRetry(() => this.apiClient[method](this.getEndpoint(`${id}/`), data));
    }
    
    /**
     * DELETE /{resource}/{id}/ - Delete resource
     */
    async delete(id) {
        if (!id) throw new Error('ID is required');
        
        // Invalidate cache
        this.invalidateCache();
        
        return this.withRetry(() => this.apiClient.delete(this.getEndpoint(`${id}/`)));
    }
    
    /**
     * GET /{resource}/stats/ - Get statistics
     */
    async getStats(params = {}) {
        return this.withRetry(() => this.apiClient.get(this.getEndpoint('stats/'), { params }));
    }
    
    /**
     * GET /{resource}/export/{format}/ - Export data
     */
    async exportData(format = 'csv', params = {}) {
        const validFormats = ['csv', 'json', 'xlsx', 'pdf'];
        const exportFormat = validFormats.includes(format) ? format : 'csv';
        
        return this.withRetry(() => this.apiClient.get(this.getEndpoint(`export/${exportFormat}/`), {
            params,
            responseType: exportFormat === 'json' ? 'json' : 'blob',
        }));
    }
    
    /**
     * Invalidate cache for this resource
     */
    invalidateCache() {
        for (const key of cache.keys()) {
            if (key.includes(this.resourceName)) {
                cache.delete(key);
            }
        }
    }
    
    /**
     * Clear all cache
     */
    clearCache() {
        cache.clear();
    }
    
    /**
     * Cancel all pending requests for this resource
     */
    cancelAllPendingRequests() {
        for (const [endpoint, controller] of activeRequests.entries()) {
            if (endpoint.includes(this.resourceName)) {
                controller.abort();
                activeRequests.delete(endpoint);
            }
        }
    }
    
    /**
     * Check if service is healthy
     */
    async healthCheck() {
        try {
            const response = await this.apiClient.get('/health/', { timeout: 5000 });
            return { healthy: true, data: response.data };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }
}

// ============================================================================
// Exports
// ============================================================================

export {
    billingApiClient,
    withRetry,
    BillingBaseService,
    cache,
    activeRequests,
};

export default BillingBaseService;