import axios from 'axios';
import { setupInterceptors } from './interceptors';
import { API_BASE_URL } from './endpoints';

// Create axios instance
const api = axios.create({
    baseURL: '/api/v1',
    timeout: 60000, // Increased from 30s to 60s for analytics endpoints
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Setup interceptors
setupInterceptors(api);

export default api;