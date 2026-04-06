import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../services/accounts/storage/secureStorage';
import { refreshToken } from './auth';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/api/v1',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};
apiClient.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        const tenantId = localStorage.getItem('tenant_id');
        if (tenantId) {
            config.headers['X-Tenant-Id'] = tenantId;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (originalRequest._retry) {
            return Promise.reject(error);
        }
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url?.includes('/auth/login')) {
                return Promise.reject(error);
            }
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({resolve, reject});
                })
                    .then(() => apiClient(originalRequest))
                    .catch(err => Promise.reject(err));
            }
            originalRequest._retry = true
            isRefreshing = true
            try {
                const refreshTokenValue = getRefreshToken();
                if (!refreshTokenValue) {
                    throw new Error('No refresh token');
                }
                const response = await refreshToken(refreshTokenValue);
                const { access, refresh } = response.data;
                setTokens(access, refresh);
                processQueue(null, access);
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearTokens();
                window.dispatchEvent(new CustomEvent('auth:logout'));
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        if (error.response?.status === 403) {
            window.dispatchEvent(new CustomEvent('auth:forbidden', {
                detail: {message: error.response?.data?.message || 'Access denied'}
            }));
        }
        if (error.response?.status === 429) {
            const retryAfter = error.response.headers['retry-after'] || 5;
            window.dispatchEvent(new CustomEvent('api:rate-limited', { 
                detail: { retryAfter, message: 'Too many requests' }
            }));
        }
        if (error.response?.status >= 500) {
            window.dispatchEvent(new CustomEvent('api:server-error', { 
                detail: { message: 'Server error. Please try again later.' }
            }));
        }
        return Promise.reject(error);
    }
);
const request = {
    get: (url, config = {}) => apiClient.get(url, config),
    post: (url, data, config = {}) => apiClient.post(url, data, config),
    put: (url, data, config = {}) => apiClient.put(url, data, config),
    patch: (url, data, config = {}) => apiClient.patch(url, data, config),
    delete: (url, config = {}) => apiClient.delete(url, config)
};
const upload = (url, formData, onProgress) => {
    return apiClient.post(url, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        }
    });
};
export { apiClient, request, upload };