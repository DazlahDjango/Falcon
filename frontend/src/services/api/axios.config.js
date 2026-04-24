import axios from 'axios';

// Default config
export const defaultConfig = {
    baseURL: process.env.REACT_APP_API_URL || '/api/v1',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
};
// Create axios instance with default config
export const axiosInstance = axios.create(defaultConfig);
// Export configuration for use in services
export const apiConfig = {
    baseURL: defaultConfig.baseURL,
    timeout: defaultConfig.timeout,
    maxRetries: 3,
    retryDelay: 1000,
};