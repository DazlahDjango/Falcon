// src/services/reviews/coefficient.service.js
// Handles all coefficient API calls for department/role score adjustments

import { ReviewsBaseService, apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS } from '../../config/constants';

class CoefficientService extends ReviewsBaseService {
    constructor() {
        super(REVIEW_API_ENDPOINTS.COEFFICIENTS);
    }

    /**
     * Get coefficients for a specific department
     * @param {string|number} departmentId - Department ID
     * @returns {Promise<Array>} Department coefficients
     */
    async getForDepartment(departmentId) {
        const response = await apiClient.get(`${REVIEW_API_ENDPOINTS.COEFFICIENTS}?department=${departmentId}`);
        return response.data;
    }

    /**
     * Get coefficients for a specific position
     * @param {string|number} positionId - Position ID
     * @returns {Promise<Array>} Position coefficients
     */
    async getForPosition(positionId) {
        const response = await apiClient.get(`${REVIEW_API_ENDPOINTS.COEFFICIENTS}?position=${positionId}`);
        return response.data;
    }

    /**
     * Get coefficients for a specific user
     * @param {string|number} userId - User ID
     * @returns {Promise<Array>} User coefficients
     */
    async getForUser(userId) {
        const response = await apiClient.get(`${REVIEW_API_ENDPOINTS.COEFFICIENTS}?user=${userId}`);
        return response.data;
    }

    /**
     * Get active coefficients only
     * @returns {Promise<Array>} Active coefficients
     */
    async getActive() {
        const response = await apiClient.get(`${REVIEW_API_ENDPOINTS.COEFFICIENTS}?is_active=true`);
        return response.data;
    }
}

export const coefficientService = new CoefficientService();