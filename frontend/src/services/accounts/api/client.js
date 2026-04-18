import axios from 'axios';
import { getAccessToken } from '../storage/secureStorage';

// Create axios instance
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    async (config) => {
        // ✅ CRITICAL: Skip token for auth endpoints
        const isAuthEndpoint = config.url?.includes('/auth/login') || 
                               config.url?.includes('/auth/register') ||
                               config.url?.includes('/auth/refresh') ||
                               config.url?.includes('/auth/password-reset') ||
                               config.url?.includes('/auth/verify-email') ||
                               config.url?.includes('/auth/resend-verification');
        if (isAuthEndpoint) {
            console.log('[API] Skipping auth token for:', config.url);
            return config;
        }
        const token = await getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Break circular dependency by using direct localStorage lookup
        // We use the 'falcon_' prefix defined in our storage system
        const tenantId = localStorage.getItem('falcon_tenant_id');
        
        if (tenantId) {
            config.headers['X-Tenant-ID'] = tenantId;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Simplified
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.log('[API] 401 Unauthorized');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        
        return Promise.reject(error);
    }
);

// Setup Function
export const setupAxiosInterceptors = () => {
    console.log('[API] Axios interceptors configured');
};

// Exports
const request = {
    get: (url, config = {}) => apiClient.get(url, config),
    post: (url, data, config = {}) => apiClient.post(url, data, config),
    put: (url, data, config = {}) => apiClient.put(url, data, config),
    patch: (url, data, config = {}) => apiClient.patch(url, data, config),
    delete: (url, config = {}) => apiClient.delete(url, config)
};

const upload = (url, formData, onProgress) => {
    return apiClient.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        }
    });
};

export { apiClient, request, upload };
export default apiClient;