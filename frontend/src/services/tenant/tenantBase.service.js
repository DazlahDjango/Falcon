// frontend/src/services/tenant/tenantBase.service.js
// Tenant Base Service - Following CIA Triad Principles
// Confidentiality, Integrity, Availability
// Version: 2.0.0

import axios from 'axios';
import { store } from '../../store';
import { logout } from '../../store/accounts/slice/authSlice';
import { showToast } from '../../store/tenant/slice/tenantUISlice';
import {
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    clearTokens,
    getTenantId,
    setTenantId
} from '../accounts/storage/secureStorage';
import { auditLog } from './auditService';
import { encryptData, decryptData } from '../security/encryptionService';
import TENANT_API_ENDPOINTS from '../../config/constants/tenantConstants';

// ==================== Configuration ====================
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1/tenant';
const TENANT_API_BASE = API_BASE_URL;

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
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
    refreshQueue.forEach(item => {
        if (error) {
            item.reject(error);
        } else {
            item.resolve(token);
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
    const sensitiveFields = ['api_key', 'secret_key', 'webhook_secret', 'client_secret'];
    const encrypted = { ...data };

    sensitiveFields.forEach(field => {
        if (encrypted[field]) {
            encrypted[field] = encryptData(encrypted[field]);
        }
    });

    return encrypted;
};

const decryptSensitiveData = (data) => {
    const sensitiveFields = ['api_key', 'secret_key', 'webhook_secret', 'client_secret'];
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
            config.headers['Authorization'] = `Bearer ${token}`;
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

        // Skip logging for GET requests to reduce noise
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

                const refreshResponse = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                    refresh: refreshToken,
                });

                if (refreshResponse.data?.access) {
                    await setAccessToken(refreshResponse.data.access);
                    originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.access}`;
                    processRefreshQueue(null, refreshResponse.data.access);
                    return apiClient(originalRequest);
                } else {
                    throw new Error('Refresh failed');
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

    getEndpoint(endpoint = '') {
        const endpointsMap = {
            'tenants': () => TENANT_API_ENDPOINTS.TENANT.LIST,
            'domains': () => TENANT_API_ENDPOINTS.DOMAIN.LIST,
            'backups': () => TENANT_API_ENDPOINTS.BACKUP.LIST,
            'migrations': () => TENANT_API_ENDPOINTS.MIGRATION.LIST,
            'schemas': () => TENANT_API_ENDPOINTS.SCHEMA.LIST,
            'health': () => '/health/',
            'stats': () => '/stats/',
            'provisioning': () => '/provisioning/',
            'resources': () => '/resources/',
            'audit': () => '/audit/',
        };

        const basePath = endpointsMap[this.resourceName];
        if (basePath) {
            const path = basePath();
            return endpoint ? `${path}${endpoint}` : path;
        }

        return `/${this.resourceName}/${endpoint}`;
    }

    getTenantEndpoint(tenantId, endpoint = '') {
        const endpointsMap = {
            'domains': () => TENANT_API_ENDPOINTS.DOMAIN.TENANT_DOMAINS(tenantId),
            'backups': () => TENANT_API_ENDPOINTS.BACKUP.TENANT_BACKUPS(tenantId),
            'migrations': () => TENANT_API_ENDPOINTS.MIGRATION.TENANT_MIGRATIONS(tenantId),
            'schemas': () => TENANT_API_ENDPOINTS.SCHEMA.TENANT_SCHEMAS(tenantId),
            'resources': () => `/tenants/${tenantId}/resources/`,
            'audit': () => `/tenants/${tenantId}/audit/`,
        };

        const getPath = endpointsMap[this.resourceName];
        if (getPath) {
            const path = getPath();
            return endpoint ? `${path}${endpoint}` : path;
        }

        const resourcePath = this.resourceName;
        return endpoint
            ? `/tenants/${tenantId}/${resourcePath}/${endpoint}`
            : `/tenants/${tenantId}/${resourcePath}/`;
    }

    async list(params = {}) {
        const sanitizedParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
        );
        return this.withRetry(() =>
            this.apiClient.get(this.getEndpoint(), { params: sanitizedParams })
        );
    }

    async listForTenant(tenantId, params = {}) {
        if (!tenantId) throw new Error('Tenant ID is required');
        const sanitizedParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
        );
        return this.withRetry(() =>
            this.apiClient.get(this.getTenantEndpoint(tenantId), { params: sanitizedParams })
        );
    }

    async getById(id, params = {}) {
        if (!id) throw new Error('Resource ID is required');
        return this.withRetry(() =>
            this.apiClient.get(this.getEndpoint(`${id}/`), { params })
        );
    }

    async getForTenant(tenantId, resourceId, params = {}) {
        if (!tenantId) throw new Error('Tenant ID is required');
        if (!resourceId) throw new Error('Resource ID is required');
        return this.withRetry(() =>
            this.apiClient.get(this.getTenantEndpoint(tenantId, `${resourceId}/`), { params })
        );
    }

    async create(data, encrypt = true) {
        if (!data || typeof data !== 'object') throw new Error('Valid data object is required');
        const processedData = encrypt ? encryptSensitiveData(data) : data;
        return this.withRetry(() =>
            this.apiClient.post(this.getEndpoint(), processedData)
        );
    }

    async createForTenant(tenantId, data, encrypt = true) {
        if (!tenantId) throw new Error('Tenant ID is required');
        if (!data || typeof data !== 'object') throw new Error('Valid data object is required');
        const processedData = encrypt ? encryptSensitiveData(data) : data;
        return this.withRetry(() =>
            this.apiClient.post(this.getTenantEndpoint(tenantId), processedData)
        );
    }

    async update(id, data, partial = true, encrypt = true) {
        if (!id) throw new Error('Resource ID is required');
        if (!data || typeof data !== 'object') throw new Error('Valid data object is required');
        const processedData = encrypt ? encryptSensitiveData(data) : data;
        const method = partial ? 'patch' : 'put';
        return this.withRetry(() =>
            this.apiClient[method](this.getEndpoint(`${id}/`), processedData)
        );
    }

    async updateForTenant(tenantId, resourceId, data, partial = true, encrypt = true) {
        if (!tenantId) throw new Error('Tenant ID is required');
        if (!resourceId) throw new Error('Resource ID is required');
        if (!data || typeof data !== 'object') throw new Error('Valid data object is required');
        const processedData = encrypt ? encryptSensitiveData(data) : data;
        const method = partial ? 'patch' : 'put';
        return this.withRetry(() =>
            this.apiClient[method](this.getTenantEndpoint(tenantId, `${resourceId}/`), processedData)
        );
    }

    async delete(id, soft = true) {
        if (!id) throw new Error('Resource ID is required');
        const url = soft ? this.getEndpoint(`${id}/soft-delete/`) : this.getEndpoint(`${id}/`);
        return this.withRetry(() =>
            this.apiClient.delete(url)
        );
    }

    async deleteForTenant(tenantId, resourceId, soft = true) {
        if (!tenantId) throw new Error('Tenant ID is required');
        if (!resourceId) throw new Error('Resource ID is required');
        const url = soft
            ? this.getTenantEndpoint(tenantId, `${resourceId}/soft-delete/`)
            : this.getTenantEndpoint(tenantId, `${resourceId}/`);
        return this.withRetry(() =>
            this.apiClient.delete(url)
        );
    }

    async restore(id) {
        if (!id) throw new Error('Resource ID is required');
        return this.withRetry(() =>
            this.apiClient.post(this.getEndpoint(`${id}/restore/`))
        );
    }

    async restoreForTenant(tenantId, resourceId) {
        if (!tenantId) throw new Error('Tenant ID is required');
        if (!resourceId) throw new Error('Resource ID is required');
        return this.withRetry(() =>
            this.apiClient.post(this.getTenantEndpoint(tenantId, `${resourceId}/restore/`))
        );
    }

    async getStats(params = {}) {
        return this.withRetry(() =>
            this.apiClient.get(this.getEndpoint('stats/'), { params })
        );
    }

    async bulkOperation(operation, data) {
        if (!operation || !data) throw new Error('Operation and data are required');
        return this.withRetry(() =>
            this.apiClient.post(this.getEndpoint(`bulk/${operation}/`), data)
        );
    }

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

    async getHistory(id, params = {}) {
        if (!id) throw new Error('Resource ID is required');
        return this.withRetry(() =>
            this.apiClient.get(this.getEndpoint(`${id}/history/`), { params })
        );
    }

    async validate(data) {
        if (!data) throw new Error('Data to validate is required');
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