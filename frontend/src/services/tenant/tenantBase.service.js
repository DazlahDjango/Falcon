// services/tenant/tenantBase.service.js
// Tenant Base Service - Following CIA Triad Principles
// Confidentiality, Integrity, Availability
// Version: 1.0.0

import axios from 'axios';
import { store } from '../../store';
import { logout } from '../../store/accounts/slice/authSlice';
import { showToast } from '../../store/slices/uiSlice';
import {
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    clearTokens,
    getTenantId,
    setTenantId
} from '../accounts/storage/secureStorage';
import { encryptData, decryptData } from '../security/encryptionService';
import { auditLog } from '../audit/auditService';

// ==================== Configuration ====================
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const TENANT_API_BASE = `${API_BASE_URL}/tenant`;

// Security Headers
const SECURITY_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
};

// Rate Limiting Configuration
const RATE_LIMIT = {
    MAX_REQUESTS: 100,
    TIME_WINDOW: 60000, // 1 minute
    requestCount: 0,
    windowStart: Date.now(),
};

// Retry Configuration
const RETRY_CONFIG = {
    MAX_ATTEMPTS: 3,
    BASE_DELAY: 1000,
    MAX_DELAY: 10000,
    RETRY_STATUSES: [408, 429, 500, 502, 503, 504],
};

// Circuit Breaker Configuration
const CIRCUIT_BREAKER = {
    FAILURE_THRESHOLD: 5,
    TIMEOUT: 60000, // 1 minute
    HALF_OPEN_TIMEOUT: 30000,
    failures: 0,
    state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
    lastFailureTime: null,
    lastSuccessTime: null,
};

// Token Refresh Queue
let isRefreshing = false;
let refreshQueue = [];

// ==================== Helper Functions ====================
const generateCorrelationId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${crypto.randomUUID?.() || Math.random()}`;
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const checkRateLimit = () => {
    const now = Date.now();
    if (now - RATE_LIMIT.windowStart > RATE_LIMIT.TIME_WINDOW) {
        RATE_LIMIT.requestCount = 0;
        RATE_LIMIT.windowStart = now;
    }

    if (RATE_LIMIT.requestCount >= RATE_LIMIT.MAX_REQUESTS) {
        throw new Error('RATE_LIMIT_EXCEEDED');
    }
    RATE_LIMIT.requestCount++;
};

const getCircuitBreakerState = () => {
    if (CIRCUIT_BREAKER.state === 'OPEN') {
        if (Date.now() - CIRCUIT_BREAKER.lastFailureTime > CIRCUIT_BREAKER.TIMEOUT) {
            CIRCUIT_BREAKER.state = 'HALF_OPEN';
            console.warn('[TenantService] Circuit breaker transitioning to HALF_OPEN');
        } else {
            return 'OPEN';
        }
    }
    return CIRCUIT_BREAKER.state;
};

const recordSuccess = () => {
    CIRCUIT_BREAKER.lastSuccessTime = Date.now();
    if (CIRCUIT_BREAKER.state === 'HALF_OPEN') {
        CIRCUIT_BREAKER.state = 'CLOSED';
        CIRCUIT_BREAKER.failures = 0;
        console.info('[TenantService] Circuit breaker closed after success');
    }
    CIRCUIT_BREAKER.failures = Math.max(0, CIRCUIT_BREAKER.failures - 1);
};

const recordFailure = () => {
    CIRCUIT_BREAKER.failures++;
    CIRCUIT_BREAKER.lastFailureTime = Date.now();

    if (CIRCUIT_BREAKER.failures >= CIRCUIT_BREAKER.FAILURE_THRESHOLD) {
        CIRCUIT_BREAKER.state = 'OPEN';
        console.error('[TenantService] Circuit breaker opened due to failures');
    }
};

const processRefreshQueue = (error, token = null) => {
    refreshQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });
    refreshQueue = [];
};

// ==================== Audit Logging ====================
const logAudit = async (action, resource, resourceId, details = {}) => {
    try {
        await auditLog({
            action,
            resource,
            resourceId,
            service: 'tenant',
            timestamp: new Date().toISOString(),
            ...details,
        });
    } catch (error) {
        console.error('[TenantService] Audit log failed:', error);
    }
};

// ==================== Encryption Helpers ====================
const encryptSensitiveData = (data) => {
    const sensitiveFields = ['api_key', 'secret_key', 'webhook_secret'];
    const encrypted = { ...data };

    sensitiveFields.forEach(field => {
        if (encrypted[field]) {
            encrypted[field] = encryptData(encrypted[field]);
        }
    });

    return encrypted;
};

const decryptSensitiveData = (data) => {
    const sensitiveFields = ['api_key', 'secret_key', 'webhook_secret'];
    const decrypted = { ...data };

    sensitiveFields.forEach(field => {
        if (decrypted[field]) {
            try {
                decrypted[field] = decryptData(decrypted[field]);
            } catch (error) {
                console.error(`Failed to decrypt ${field}:`, error);
            }
        }
    });

    return decrypted;
};

// ==================== Create Axios Instance ====================
const apiClient = axios.create({
    baseURL: TENANT_API_BASE,
    timeout: 30000,
    headers: SECURITY_HEADERS,
    withCredentials: true,
    validateStatus: (status) => status >= 200 && status < 500,
});

// ==================== Request Interceptor ====================
apiClient.interceptors.request.use(
    async (config) => {
        // Check circuit breaker
        const circuitState = getCircuitBreakerState();
        if (circuitState === 'OPEN') {
            throw new Error('CIRCUIT_OPEN');
        }

        // Check rate limit
        checkRateLimit();

        // Add correlation ID for request tracking
        config.headers['X-Correlation-ID'] = generateCorrelationId();

        // Add request timestamp
        config.headers['X-Request-Time'] = Date.now().toString();

        // Add authentication token
        const token = await getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add tenant ID
        const tenantId = await getTenantId();
        if (tenantId) {
            config.headers['X-Tenant-ID'] = tenantId;
        }

        // Add security headers for non-GET requests
        if (config.method !== 'get') {
            config.headers['X-CSRF-Protection'] = '1';
            config.headers['X-Idempotency-Key'] = generateCorrelationId();
        }

        // Log request in development
        if (import.meta.env.DEV) {
            console.log(`[TenantService] ${config.method.toUpperCase()} ${config.url}`, {
                correlationId: config.headers['X-Correlation-ID'],
                tenantId,
            });
        }

        return config;
    },
    (error) => {
        console.error('[TenantService] Request Error:', error);
        return Promise.reject(error);
    }
);

// ==================== Response Interceptor ====================
apiClient.interceptors.response.use(
    async (response) => {
        recordSuccess();

        // Log successful operation
        if (response.config.method !== 'get') {
            await logAudit(
                response.config.method.toUpperCase(),
                response.config.url,
                response.data?.id || response.data?.tenant_id,
                { status: response.status }
            );
        }

        // Standardize successful response
        return {
            success: true,
            data: response.data,
            status: response.status,
            message: response.data?.message || 'Operation successful',
            timestamp: new Date().toISOString(),
            correlationId: response.config.headers['X-Correlation-ID'],
        };
    },
    async (error) => {
        recordFailure();

        const originalRequest = error.config;
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        // Handle circuit breaker open
        if (error.message === 'CIRCUIT_OPEN') {
            return Promise.reject({
                success: false,
                status: 503,
                message: 'Service temporarily unavailable. Please try again later.',
                code: 'SERVICE_UNAVAILABLE',
            });
        }

        // Handle rate limiting
        if (error.message === 'RATE_LIMIT_EXCEEDED') {
            return Promise.reject({
                success: false,
                status: 429,
                message: 'Too many requests. Please try again later.',
                code: 'RATE_LIMIT_EXCEEDED',
            });
        }

        // Handle token refresh for 401 errors
        if (status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue request while token is refreshing
                return new Promise((resolve, reject) => {
                    refreshQueue.push({ resolve, reject, config: originalRequest });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await getRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                    refresh: refreshToken,
                });

                if (response.data?.access) {
                    await setAccessToken(response.data.access);
                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                    processRefreshQueue(null, response.data.access);
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                processRefreshQueue(refreshError, null);

                // Clear all tokens and redirect to login
                await clearTokens();
                await setTenantId(null);
                store.dispatch(logout());

                // Redirect to login
                if (typeof window !== 'undefined') {
                    window.location.href = '/login?session=expired';
                }

                return Promise.reject({
                    success: false,
                    status: 401,
                    message: 'Session expired. Please login again.',
                    code: 'SESSION_EXPIRED',
                });
            } finally {
                isRefreshing = false;
            }
        }

        // Handle specific error codes
        const errorResponse = {
            success: false,
            status: status || 0,
            message,
            code: error.response?.data?.code || 'UNKNOWN_ERROR',
            timestamp: new Date().toISOString(),
            correlationId: originalRequest?.headers?.['X-Correlation-ID'],
        };

        // Add validation errors if present
        if (error.response?.data?.errors) {
            errorResponse.errors = error.response.data.errors;
        }

        // Handle specific status codes
        switch (status) {
            case 400:
                errorResponse.message = errorResponse.message || 'Invalid request data';
                break;
            case 403:
                errorResponse.message = 'You do not have permission to perform this action';
                store.dispatch(showToast({ message: errorResponse.message, type: 'error' }));
                break;
            case 404:
                errorResponse.message = errorResponse.message || 'Resource not found';
                errorResponse.code = 'NOT_FOUND';
                break;
            case 409:
                errorResponse.message = 'Resource conflict. Please refresh and try again';
                break;
            case 422:
                errorResponse.message = 'Validation failed';
                break;
            case 429:
                errorResponse.message = 'Rate limit exceeded. Please try again later.';
                break;
            case 500:
            case 502:
            case 503:
            case 504:
                errorResponse.message = 'Server error. Please try again later.';
                store.dispatch(showToast({ message: 'Service temporarily unavailable', type: 'error' }));
                break;
            default:
                if (!status) {
                    errorResponse.message = 'Network error. Please check your connection.';
                }
        }

        // Log error for monitoring
        console.error('[TenantService] Error:', errorResponse);

        return Promise.reject(errorResponse);
    }
);

// ==================== Retry Logic with Exponential Backoff ====================
const withRetry = async (fn, options = {}) => {
    const {
        maxAttempts = RETRY_CONFIG.MAX_ATTEMPTS,
        baseDelay = RETRY_CONFIG.BASE_DELAY,
        maxDelay = RETRY_CONFIG.MAX_DELAY,
        retryStatuses = RETRY_CONFIG.RETRY_STATUSES,
    } = options;

    let lastError;
    let attempt = 1;

    while (attempt <= maxAttempts) {
        try {
            const result = await fn();
            return result;
        } catch (error) {
            lastError = error;

            const shouldRetry = retryStatuses.includes(error.status) && attempt < maxAttempts;

            if (!shouldRetry) {
                throw error;
            }

            // Exponential backoff with jitter
            const delayMs = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
            const jitter = Math.random() * 100;
            const waitTime = delayMs + jitter;

            console.warn(`[TenantService] Retry ${attempt}/${maxAttempts} after ${waitTime}ms`);
            await delay(waitTime);
            attempt++;
        }
    }

    throw lastError;
};

// ==================== Base Tenant Service Class ====================
class BaseTenantService {
    constructor(resourceName) {
        if (!resourceName) {
            throw new Error('Resource name is required');
        }

        this.resourceName = resourceName;
        this.apiClient = apiClient;
        this.withRetry = withRetry;
    }

    /**
     * Get endpoint URL
     * @param {string} endpoint - Optional endpoint suffix
     * @returns {string} Full endpoint URL
     */
    getEndpoint(endpoint = '') {
        const base = `/${this.resourceName}`;
        return endpoint ? `${base}/${endpoint}` : `${base}/`;
    }

    /**
     * List resources with pagination and filters
     * @param {Object} params - Query parameters
     * @returns {Promise} Response with list of resources
     */
    async list(params = {}) {
        // Sanitize params to remove null/undefined values
        const sanitizedParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
        );

        return this.withRetry(() =>
            this.apiClient.get(this.getEndpoint(), { params: sanitizedParams })
        );
    }

    /**
     * Get resource by ID
     * @param {string|number} id - Resource ID
     * @param {Object} params - Additional query parameters
     * @returns {Promise} Response with resource data
     */
    async getById(id, params = {}) {
        if (!id) {
            throw new Error('Resource ID is required');
        }

        return this.withRetry(() =>
            this.apiClient.get(this.getEndpoint(`${id}/`), { params })
        );
    }

    /**
     * Create new resource
     * @param {Object} data - Resource data
     * @param {boolean} encrypt - Whether to encrypt sensitive data
     * @returns {Promise} Response with created resource
     */
    async create(data, encrypt = true) {
        if (!data || typeof data !== 'object') {
            throw new Error('Valid data object is required');
        }

        // Encrypt sensitive data for confidentiality
        const processedData = encrypt ? encryptSensitiveData(data) : data;

        return this.withRetry(() =>
            this.apiClient.post(this.getEndpoint(), processedData)
        );
    }

    /**
     * Update resource
     * @param {string|number} id - Resource ID
     * @param {Object} data - Update data
     * @param {boolean} partial - Whether this is a partial update (PATCH vs PUT)
     * @param {boolean} encrypt - Whether to encrypt sensitive data
     * @returns {Promise} Response with updated resource
     */
    async update(id, data, partial = true, encrypt = true) {
        if (!id) {
            throw new Error('Resource ID is required');
        }

        if (!data || typeof data !== 'object') {
            throw new Error('Valid data object is required');
        }

        const processedData = encrypt ? encryptSensitiveData(data) : data;
        const method = partial ? 'patch' : 'put';

        return this.withRetry(() =>
            this.apiClient[method](this.getEndpoint(`${id}/`), processedData)
        );
    }

    /**
     * Delete resource
     * @param {string|number} id - Resource ID
     * @param {boolean} soft - Soft delete vs hard delete
     * @returns {Promise} Response confirming deletion
     */
    async delete(id, soft = true) {
        if (!id) {
            throw new Error('Resource ID is required');
        }

        const url = soft ? this.getEndpoint(`${id}/soft-delete/`) : this.getEndpoint(`${id}/`);

        return this.withRetry(() =>
            this.apiClient.delete(url)
        );
    }

    /**
     * Restore soft-deleted resource
     * @param {string|number} id - Resource ID
     * @returns {Promise} Response with restored resource
     */
    async restore(id) {
        if (!id) {
            throw new Error('Resource ID is required');
        }

        return this.withRetry(() =>
            this.apiClient.post(this.getEndpoint(`${id}/restore/`))
        );
    }

    /**
     * Get resource statistics
     * @param {Object} params - Query parameters
     * @returns {Promise} Response with statistics
     */
    async getStats(params = {}) {
        return this.withRetry(() =>
            this.apiClient.get(this.getEndpoint('stats/'), { params })
        );
    }

    /**
     * Bulk operations
     * @param {string} operation - Bulk operation type
     * @param {Object} data - Bulk operation data
     * @returns {Promise} Response with bulk operation results
     */
    async bulkOperation(operation, data) {
        if (!operation || !data) {
            throw new Error('Operation and data are required');
        }

        return this.withRetry(() =>
            this.apiClient.post(this.getEndpoint(`bulk/${operation}/`), data)
        );
    }

    /**
     * Export data
     * @param {string} format - Export format (csv, json, xlsx)
     * @param {Object} params - Query parameters
     * @returns {Promise} Response with exported data
     */
    async exportData(format = 'csv', params = {}) {
        const validFormats = ['csv', 'json', 'xlsx'];
        if (!validFormats.includes(format)) {
            throw new Error(`Invalid format. Must be one of: ${validFormats.join(', ')}`);
        }

        const responseType = format === 'json' ? 'json' : 'blob';

        return this.withRetry(() =>
            this.apiClient.get(this.getEndpoint(`export/${format}/`), {
                params,
                responseType,
            })
        );
    }

    /**
     * Get resource history/audit trail
     * @param {string|number} id - Resource ID
     * @param {Object} params - Query parameters
     * @returns {Promise} Response with history data
     */
    async getHistory(id, params = {}) {
        if (!id) {
            throw new Error('Resource ID is required');
        }

        return this.withRetry(() =>
            this.apiClient.get(this.getEndpoint(`${id}/history/`), { params })
        );
    }

    /**
     * Validate resource data without saving
     * @param {Object} data - Data to validate
     * @returns {Promise} Response with validation results
     */
    async validate(data) {
        if (!data) {
            throw new Error('Data to validate is required');
        }

        return this.withRetry(() =>
            this.apiClient.post(this.getEndpoint('validate/'), data)
        );
    }
}

// ==================== Exports ====================
export {
    apiClient,
    withRetry,
    BaseTenantService,
    encryptSensitiveData,
    decryptSensitiveData,
    logAudit,
};

export default BaseTenantService;