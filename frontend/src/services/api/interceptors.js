import { getAccessToken } from '../accounts/storage/secureStorage';
import { logout, login } from '../accounts/api/auth';

export const setupInterceptors = (api) => {
    // Request interceptor - add auth token
    api.interceptors.request.use(
        (config) => {
            const token = getAuthToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
    // Response interceptor - handle errors
    api.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            const originalRequest = error.config;
            
            // Handle 401 Unauthorized
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                
                // Try to refresh token
                try {
                    const refreshToken = localStorage.getItem('refresh_token');
                    if (refreshToken) {
                        const response = await api.post('/auth/refresh/', {
                            refresh: refreshToken
                        });
                        localStorage.setItem('access_token', response.data.access);
                        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    // Refresh failed, logout
                    logout();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
            
            // Handle 403 Forbidden
            if (error.response?.status === 403) {
                console.error('Permission denied:', error.response.data);
            }
            
            // Handle 429 Too Many Requests
            if (error.response?.status === 429) {
                const retryAfter = error.response.headers['retry-after'] || 60;
                console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
                
                // Wait and retry
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                return api(originalRequest);
            }
            
            // Handle 500 Server Error
            if (error.response?.status >= 500) {
                console.error('Server error:', error.response.data);
                // Could show a toast notification here
            }
            
            return Promise.reject(error);
        }
    );
};

/**
 * Add request ID for tracing
 * @param {Object} api - Axios instance
 */
export const addRequestIdInterceptor = (api) => {
    api.interceptors.request.use((config) => {
        config.headers['X-Request-ID'] = generateRequestId();
        return config;
    });
};

/**
 * Generate unique request ID
 * @returns {string} Unique ID
 */
const generateRequestId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Logging interceptor for development
 * @param {Object} api - Axios instance
 */
export const addLoggingInterceptor = (api) => {
    if (import.meta.env.MODE === 'development') {
        api.interceptors.request.use((config) => {
            console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.data);
            return config;
        });
        
        api.interceptors.response.use(
            (response) => {
                console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
                return response;
            },
            (error) => {
                console.error(`[API Error] ${error.response?.status} ${error.config?.url}`, error.response?.data);
                return Promise.reject(error);
            }
        );
    }
};

/**
 * Retry interceptor for failed requests
 * @param {Object} api - Axios instance
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryDelay - Delay between retries in ms
 */
export const addRetryInterceptor = (api, maxRetries = 3, retryDelay = 1000) => {
    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const { config } = error;
            if (!config || !config.retry) {
                config.retry = 0;
            }
            
            // Only retry on network errors or 5xx server errors
            const shouldRetry = !error.response || error.response.status >= 500;
            
            if (shouldRetry && config.retry < maxRetries) {
                config.retry += 1;
                console.log(`Retrying request (${config.retry}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay * config.retry));
                return api(config);
            }
            
            return Promise.reject(error);
        }
    );
};