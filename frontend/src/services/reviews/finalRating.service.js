// src/services/reviews/finalRating.service.js
// Handles all final rating API calls

import { ReviewsBaseService, apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS as REVIEWS_API } from '../../config/constants';

class FinalRatingService extends ReviewsBaseService {
    constructor() {
        super(REVIEWS_API.FINAL_RATINGS);
    }

    /**
     * Get my final rating for current/completed cycle
     * @returns {Promise<Object>} My final rating
     */
    async getMy() {
        const response = await apiClient.get(REVIEWS_API.FINAL_RATING_MY);
        return response.data;
    }

    /**
     * Get team final ratings (for managers)
     * @returns {Promise<Array>} Team final ratings
     */
    async getTeam() {
        const response = await apiClient.get(REVIEWS_API.FINAL_RATING_TEAM);
        return response.data;
    }

    /**
     * Approve final rating (HR only)
     * @param {string|number} id - Rating ID
     * @param {string} notes - Approval notes
     * @returns {Promise<Object>} Approved rating
     */
    async approve(id, notes = '') {
        const response = await apiClient.post(REVIEWS_API.FINAL_RATING_APPROVE(id), { notes });
        return response.data;
    }

    /**
     * Lock final rating as final (cannot be changed)
     * @param {string|number} id - Rating ID
     * @returns {Promise<Object>} Locked rating
     */
    async lock(id) {
        const response = await apiClient.post(REVIEWS_API.FINAL_RATING_LOCK(id));
        return response.data;
    }

    /**
     * Calibrate final rating (adjust score)
     * @param {string|number} id - Rating ID
     * @param {number} adjustedScore - New score
     * @param {string} reason - Adjustment reason
     * @returns {Promise<Object>} Calibrated rating
     */
    async calibrate(id, adjustedScore, reason) {
        const response = await apiClient.post(REVIEWS_API.FINAL_RATING_CALIBRATE(id), {
            adjusted_score: adjustedScore,
            reason,
        });
        return response.data;
    }

    /**
     * Get rating distribution for a cycle
     * @param {string|number} cycleId - Cycle ID
     * @returns {Promise<Object>} Rating distribution
     */
    async getDistribution(cycleId) {
        const response = await apiClient.get(REVIEWS_API.FINAL_RATING_DISTRIBUTION, {
            params: { cycle_id: cycleId },
        });
        return response.data;
    }

    /**
     * Export final ratings
     * @param {string|number} cycleId - Cycle ID
     * @param {string} format - 'csv', 'excel', or 'pdf'
     * @param {boolean} includeDetails - Include detailed scores
     * @returns {Promise<Object>} Export data
     */
    async export(cycleId, format = 'csv', includeDetails = false) {
        const response = await apiClient.post(REVIEWS_API.FINAL_RATING_EXPORT, {
            cycle_id: cycleId,
            format,
            include_details: includeDetails,
        });
        return response.data;
    }

    /**
     * Get final ratings for a cycle
     * @param {string|number} cycleId - Cycle ID
     * @returns {Promise<Array>} Cycle final ratings
     */
    async getForCycle(cycleId) {
        const response = await apiClient.get(`${REVIEWS_API.FINAL_RATINGS}?review_cycle=${cycleId}`);
        return response.data;
    }
}

export const finalRatingService = new FinalRatingService();