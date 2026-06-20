// src/services/reviews/reviewsBase.service.js
// Base service class for all reviews services
// Provides common CRUD methods and axios instance

import axios from 'axios';
import { getAccessToken, getRefreshToken, getTenantId, clearTenantId, clearTokens } from '../accounts/storage/secureStorage';
// ========== API Configuration ==========
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const REVIEWS_API_BASE = `${API_BASE_URL}/reviews`;

// ========== Create Axios Instance ==========
const apiClient = axios.create({
    baseURL: REVIEWS_API_BASE,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// ========== Request Interceptor ==========
apiClient.interceptors.request.use(
    async (config) => {
        // Add auth token
        const token = await getAccessToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Add tenant ID
        const tenantId = await getTenantId();
        if (tenantId) {
            config.headers['X-Tenant-ID'] = tenantId;
        }

        // Add cycle ID if available
        const cycleId = localStorage.getItem('current_cycle_id');
        if (cycleId) {
            config.headers['X-Review-Cycle-ID'] = cycleId;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ========== Response Interceptor ==========
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle token refresh on 401
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = await getRefreshToken();
                const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                    refresh: refreshToken,
                });
                if (response.data?.access) {
                    localStorage.setItem('falcon_access_token', response.data.access);
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// ========== Base Service Class ==========
export class ReviewsBaseService {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    /**
     * Get all records with optional query parameters
     * @param {Object} params - Query parameters (page, page_size, filters)
     * @returns {Promise<Object>} List of records
     */
    async getAll(params = {}) {
        const response = await apiClient.get(this.endpoint, { params });
        return response.data;
    }

    /**
     * Get single record by ID
     * @param {string|number} id - Record ID
     * @returns {Promise<Object>} Record details
     */
    async getById(id) {
        const response = await apiClient.get(`${this.endpoint}${id}/`);
        return response.data;
    }

    /**
     * Create new record
     * @param {Object} data - Record data
     * @returns {Promise<Object>} Created record
     */
    async create(data) {
        const response = await apiClient.post(this.endpoint, data);
        return response.data;
    }

    /**
     * Update existing record (full update)
     * @param {string|number} id - Record ID
     * @param {Object} data - Updated data
     * @returns {Promise<Object>} Updated record
     */
    async update(id, data) {
        const response = await apiClient.put(`${this.endpoint}${id}/`, data);
        return response.data;
    }

    /**
     * Partial update of record (PATCH)
     * @param {string|number} id - Record ID
     * @param {Object} data - Partial data to update
     * @returns {Promise<Object>} Updated record
     */
    async patch(id, data) {
        const response = await apiClient.patch(`${this.endpoint}${id}/`, data);
        return response.data;
    }

    /**
     * Delete record (soft delete)
     * @param {string|number} id - Record ID
     * @returns {Promise<Object>} Deletion confirmation
     */
    async delete(id) {
        const response = await apiClient.delete(`${this.endpoint}${id}/`);
        return response.data;
    }
}

export { apiClient };