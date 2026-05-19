// src/services/reviews/pip.service.js
// Handles all PIP (Performance Improvement Plan) API calls
// Includes PIP, PIP Actions, and PIP Reviews

import { ReviewsBaseService, apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS as REVIEWS_API } from '../../config/constants';

// ========== PIP Service ==========
class PIPService extends ReviewsBaseService {
    constructor() {
        super(REVIEWS_API.PIPS);
    }

    /**
     * Get my PIPs (employee view)
     * @returns {Promise<Array>} My PIPs
     */
    async getMy() {
        const response = await apiClient.get(REVIEWS_API.PIP_MY);
        return response.data;
    }

    /**
     * Get team PIPs (manager view)
     * @returns {Promise<Array>} Team PIPs
     */
    async getTeam() {
        const response = await apiClient.get(REVIEWS_API.PIP_TEAM);
        return response.data;
    }

    /**
     * Approve PIP
     * @param {string|number} id - PIP ID
     * @returns {Promise<Object>} Approved PIP
     */
    async approve(id) {
        const response = await apiClient.post(REVIEWS_API.PIP_APPROVE(id));
        return response.data;
    }

    /**
     * Extend PIP deadline
     * @param {string|number} id - PIP ID
     * @param {string} newEndDate - New end date (YYYY-MM-DD)
     * @param {string} reason - Extension reason
     * @returns {Promise<Object>} Extended PIP
     */
    async extend(id, newEndDate, reason) {
        const response = await apiClient.post(REVIEWS_API.PIP_EXTEND(id), {
            new_end_date: newEndDate,
            reason,
        });
        return response.data;
    }

    /**
     * Complete PIP with outcome
     * @param {string|number} id - PIP ID
     * @param {string} outcome - 'successful' or 'failed'
     * @param {string} notes - Outcome notes
     * @returns {Promise<Object>} Completed PIP
     */
    async complete(id, outcome, notes = '') {
        const response = await apiClient.post(REVIEWS_API.PIP_COMPLETE(id), {
            outcome,
            notes,
        });
        return response.data;
    }

    /**
     * Get PIP progress statistics
     * @param {string|number} id - PIP ID
     * @returns {Promise<Object>} Progress stats
     */
    async getProgress(id) {
        const response = await apiClient.get(REVIEWS_API.PIP_PROGRESS(id));
        return response.data;
    }

    /**
     * Get active PIPs
     * @returns {Promise<Array>} Active PIPs
     */
    async getActive() {
        const response = await apiClient.get(REVIEWS_API.PIP_ACTIVE);
        return response.data;
    }

    /**
     * Get overdue PIPs
     * @returns {Promise<Array>} Overdue PIPs
     */
    async getOverdue() {
        const response = await apiClient.get(REVIEWS_API.PIP_OVERDUE);
        return response.data;
    }

    /**
     * Get PIP report
     * @returns {Promise<Object>} PIP report data
     */
    async getReport() {
        const response = await apiClient.get(REVIEWS_API.PIP_REPORT);
        return response.data;
    }

    /**
     * Generate PIP from low final rating
     * @param {string|number} ratingId - Final rating ID
     * @param {Object|null} customData - Optional custom PIP data
     * @returns {Promise<Object>} Generated PIP
     */
    async generateFromRating(ratingId, customData = null) {
        const response = await apiClient.post(REVIEWS_API.PIP_GENERATE_FROM_RATING(ratingId), {
            custom_data: customData,
        });
        return response.data;
    }
}

// ========== PIP Action Service ==========
class PIPActionService extends ReviewsBaseService {
    constructor() {
        super(REVIEWS_API.PIP_ACTIONS);
    }

    /**
     * Get all actions for a specific PIP
     * @param {string|number} pipId - PIP ID
     * @returns {Promise<Array>} PIP actions
     */
    async getForPIP(pipId) {
        const response = await apiClient.get(REVIEWS_API.PIP_ACTIONS_FOR_PIP(pipId));
        return response.data;
    }

    /**
     * Complete a PIP action
     * @param {string|number} id - Action ID
     * @param {File|null} evidence - Evidence file (optional)
     * @param {string} notes - Completion notes
     * @returns {Promise<Object>} Completed action
     */
    async complete(id, evidence = null, notes = '') {
        const formData = new FormData();
        if (evidence) formData.append('evidence', evidence);
        if (notes) formData.append('notes', notes);
        
        const response = await apiClient.post(REVIEWS_API.PIP_ACTION_COMPLETE(id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    /**
     * Verify evidence for a completed action (manager only)
     * @param {string|number} id - Action ID
     * @param {boolean} verified - Whether evidence is verified
     * @returns {Promise<Object>} Verified action
     */
    async verify(id, verified = true) {
        const response = await apiClient.post(REVIEWS_API.PIP_ACTION_VERIFY(id), { verified });
        return response.data;
    }
}

// ========== PIP Review Service ==========
class PIPReviewService extends ReviewsBaseService {
    constructor() {
        super(REVIEWS_API.PIP_REVIEWS);
    }

    /**
     * Get all reviews for a specific PIP
     * @param {string|number} pipId - PIP ID
     * @returns {Promise<Array>} PIP reviews
     */
    async getForPIP(pipId) {
        const response = await apiClient.get(REVIEWS_API.PIP_REVIEWS_FOR_PIP(pipId));
        return response.data;
    }
}

export const pipService = new PIPService();
export const pipActionService = new PIPActionService();
export const pipReviewService = new PIPReviewService();