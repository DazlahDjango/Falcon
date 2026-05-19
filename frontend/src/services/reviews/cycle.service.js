// src/services/reviews/cycle.service.js
// Handles all review cycle API calls

import { ReviewsBaseService, apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS as REVIEWS_API } from '../../config/constants';

class CycleService extends ReviewsBaseService {
    constructor() {
        super(REVIEWS_API.CYCLES);
    }

    /**
     * Activate a review cycle
     * @param {string|number} id - Cycle ID
     * @returns {Promise<Object>} Activated cycle
     */
    async activate(id) {
        const response = await apiClient.post(REVIEWS_API.CYCLE_ACTIVATE(id));
        return response.data;
    }

    /**
     * Close a review cycle
     * @param {string|number} id - Cycle ID
     * @returns {Promise<Object>} Closed cycle
     */
    async close(id) {
        const response = await apiClient.post(REVIEWS_API.CYCLE_CLOSE(id));
        return response.data;
    }

    /**
     * Archive a review cycle
     * @param {string|number} id - Cycle ID
     * @returns {Promise<Object>} Archived cycle
     */
    async archive(id) {
        const response = await apiClient.post(REVIEWS_API.CYCLE_ARCHIVE(id));
        return response.data;
    }

    /**
     * Get cycle progress statistics
     * @param {string|number} id - Cycle ID
     * @returns {Promise<Object>} Progress stats
     */
    async getProgress(id) {
        const response = await apiClient.get(REVIEWS_API.CYCLE_PROGRESS(id));
        return response.data;
    }

    /**
     * Get current active cycle
     * @returns {Promise<Object>} Active cycle
     */
    async getActive() {
        const response = await apiClient.get(REVIEWS_API.CYCLES_ACTIVE);
        return response.data;
    }

    /**
     * Get upcoming cycles
     * @returns {Promise<Array>} List of upcoming cycles
     */
    async getUpcoming() {
        const response = await apiClient.get(REVIEWS_API.CYCLES_UPCOMING);
        return response.data;
    }

    /**
     * Get cycles the current user participates in
     * @returns {Promise<Array>} List of user's cycles
     */
    async getMyCycles() {
        const response = await apiClient.get(REVIEWS_API.CYCLES_MY);
        return response.data;
    }

    /**
     * Add competencies to a cycle with weights
     * @param {string|number} id - Cycle ID
     * @param {Array} competencies - Array of {competency_id, weight}
     * @returns {Promise<Object>} Updated cycle
     */
    async addCompetencies(id, competencies) {
        const response = await apiClient.post(`${REVIEWS_API.CYCLE_DETAIL(id)}/competencies/`, { competencies });
        return response.data;
    }

    /**
     * Remove a competency from a cycle
     * @param {string|number} cycleId - Cycle ID
     * @param {string|number} competencyId - Competency ID
     * @returns {Promise<Object>} Deletion confirmation
     */
    async removeCompetency(cycleId, competencyId) {
        const response = await apiClient.delete(`${REVIEWS_API.CYCLE_DETAIL(cycleId)}/competencies/${competencyId}/`);
        return response.data;
    }
}

export const cycleService = new CycleService();