import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { getAccessToken, getRefreshToken, setTokens, getTenantId, clearTokens, clearTenantId } from '../accounts/storage/secureStorage';
import { store } from '../../store';
import { logout } from '../../store/accounts/slice/authSlice';
import { showToast } from '../../store/ui/slices/uiSlice';
import environment from '../../config/environment';

const API_BASE_URL = environment.API_URL || 'http://localhost:8000/api/v1';
const BILLING_API_BASE = `${API_BASE_URL}/billing`;
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const RETRY_ON_STATUS = [408, 429, 500, 502, 503, 504];

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
    if (failureCount >= 5) {
        circuitOpen = true;
        circuitResetTime = Date.now() + 60000;
        console.warn('[BillingAPI] Circuit breaker opened');
    }
};

const recordSuccess = () => {
    failureCount = Math.max(0, failureCount - 1);
};

// Create axios instance
const billingApiClient = axios.create({
    baseURL: BILLING_API_BASE,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Request-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

billingApiClient.interceptors.request.use(
    async (config) => {
        if (isCircuitOpen() && config.method === 'get') {
            throw new Error('Service temporarily unavailable. Please try again later');
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
            console.log(`[BillingAPI] ${config.method.toUpperCase()} ${config.url}`);
        }

        return config;
    },
    (error) => {
        console.error('[BillingAPI] request error:', error);
        return Promise.reject(error);
    }
);

billingApiClient.interceptors.response.use(
    (response) => {
        recordSuccess();
        if (import.meta.env.DEV) {
            console.log(`[BillingAPI] Response ${response.status}: ${response.config.url}`);
        }
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
                }).then(() => billingApiClient(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await getRefreshToken();
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                        refresh: refreshToken,
                    });

                    if (response.data?.access) {
                        await setTokens(response.data.access, refreshToken);
                        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                        processQueue(null, response.data.access);
                        return billingApiClient(originalRequest);
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

        if (status === 402) {
            store.dispatch(showToast({ message: message || 'Payment required. Please update your subscription.', type: 'warning' }));
        } else if (status === 403) {
            store.dispatch(showToast({ message: 'You do not have permission to access this billing resource', type: 'error' }));
        } else if (status === 429) {
            store.dispatch(showToast({ message: 'Too many requests. Please try again later.', type: 'error' }));
        } else if (status >= 500) {
            store.dispatch(showToast({ message: 'Server error. Please try again.', type: 'error' }));
        }

        const standardizedError = {
            success: false,
            status: status || 0,
            message,
            code: error.response?.data?.code,
            errors: error.response?.data?.errors || null,
            timestamp: new Date().toISOString(),
        };

        return Promise.reject(standardizedError);
    }
);

const withRetry = async (fn, options = {}) => {
    const { maxRetries = MAX_RETRIES, retryDelay = RETRY_DELAY, retryOnStatus = RETRY_ON_STATUS } = options;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const shouldRetry = retryOnStatus.includes(error.status) && attempt < maxRetries;
            if (shouldRetry) {
                console.warn(`[BillingAPI] Retry ${attempt}/${maxRetries}`);
                await delay(retryDelay * attempt);
                continue;
            }
            throw error;
        }
    }
    throw lastError;
};

let stripePromise = null;
export const getStripe = () => {
    if (!stripePromise && STRIPE_PUBLIC_KEY) {
        stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
    }
    return stripePromise;
};
class BaseBillingService {
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
}
export { billingApiClient, withRetry, BaseBillingService };
export default billingApiClient;