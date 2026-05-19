// src/services/reviews/promotion.service.js
// Handles all promotion recommendation API calls

import { ReviewsBaseService, apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS as REVIEWS_API } from '../../config/constants';

class PromotionService extends ReviewsBaseService {
    constructor() {
        super(REVIEWS_API.PROMOTIONS);
    }

    /**
     * Get my promotion recommendations (employee view)
     * @returns {Promise<Array>} My promotions
     */
    async getMy() {
        const response = await apiClient.get(`${REVIEWS_API.PROMOTIONS}?employee=me`);
        return response.data;
    }

    /**
     * Get team promotion recommendations (manager view)
     * @returns {Promise<Array>} Team promotions
     */
    async getTeam() {
        const response = await apiClient.get(`${REVIEWS_API.PROMOTIONS}?team=true`);
        return response.data;
    }

    /**
     * Get pending promotions (HR/Admin view)
     * @returns {Promise<Array>} Pending promotions
     */
    async getPending() {
        const response = await apiClient.get(`${REVIEWS_API.PROMOTIONS}?status=pending`);
        return response.data;
    }

    /**
     * Approve a promotion recommendation
     * @param {string|number} id - Promotion ID
     * @param {string} notes - Approval notes
     * @returns {Promise<Object>} Approved promotion
     */
    async approve(id, notes = '') {
        const response = await apiClient.post(`${REVIEWS_API.PROMOTIONS}${id}/approve/`, { notes });
        return response.data;
    }

    /**
     * Reject a promotion recommendation
     * @param {string|number} id - Promotion ID
     * @param {string} reason - Rejection reason
     * @returns {Promise<Object>} Rejected promotion
     */
    async reject(id, reason) {
        const response = await apiClient.post(`${REVIEWS_API.PROMOTIONS}${id}/reject/`, { reason });
        return response.data;
    }

    /**
     * Mark promotion as completed (employee was promoted)
     * @param {string|number} id - Promotion ID
     * @param {string} actualDate - Actual promotion date (YYYY-MM-DD)
     * @param {number} newSalary - New salary after promotion
     * @returns {Promise<Object>} Completed promotion
     */
    async complete(id, actualDate, newSalary = null) {
        const response = await apiClient.post(`${REVIEWS_API.PROMOTIONS}${id}/complete/`, {
            actual_date: actualDate,
            new_salary: newSalary,
        });
        return response.data;
    }

    /**
     * Get promotion statistics for the organization
     * @param {number} year - Year to filter
     * @returns {Promise<Object>} Promotion statistics
     */
    async getStats(year = null) {
        const params = year ? { year } : {};
        const response = await apiClient.get(`${REVIEWS_API.PROMOTIONS}stats/`, { params });
        return response.data;
    }
}

export const promotionService = new PromotionService();