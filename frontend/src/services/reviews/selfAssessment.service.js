// src/services/reviews/selfAssessment.service.js
// Handles all self assessment API calls

import { ReviewsBaseService, apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS as REVIEWS_API } from '../../config/constants';

class SelfAssessmentService extends ReviewsBaseService {
    constructor() {
        super(REVIEWS_API.SELF_ASSESSMENTS);
    }

    /**
     * Get my self assessment for current active cycle
     * @returns {Promise<Object>} My self assessment
     */
    async getMy() {
        const response = await apiClient.get(REVIEWS_API.SELF_ASSESSMENT_MY);
        return response.data;
    }

    /**
     * Submit self assessment for review
     * @param {string|number} id - Assessment ID
     * @returns {Promise<Object>} Submitted assessment
     */
    async submit(id) {
        const response = await apiClient.post(REVIEWS_API.SELF_ASSESSMENT_SUBMIT(id));
        return response.data;
    }

    /**
     * Get team self assessments (for managers)
     * @returns {Promise<Array>} Team assessments
     */
    async getTeam() {
        const response = await apiClient.get(REVIEWS_API.SELF_ASSESSMENT_TEAM);
        return response.data;
    }

    /**
     * Get pending self assessments
     * @returns {Promise<Array>} Pending assessments
     */
    async getPending() {
        const response = await apiClient.get(REVIEWS_API.SELF_ASSESSMENT_PENDING);
        return response.data;
    }

    /**
     * Get all self assessments for a cycle
     * @param {string|number} cycleId - Cycle ID
     * @returns {Promise<Array>} Cycle assessments
     */
    async getForCycle(cycleId) {
        const response = await apiClient.get(`${REVIEWS_API.SELF_ASSESSMENTS}?review_cycle=${cycleId}`);
        return response.data;
    }

    /**
     * Save competency ratings for self assessment
     * @param {string|number} id - Assessment ID
     * @param {Array} ratings - Array of {competency_id, rating, comment}
     * @returns {Promise<Object>} Updated assessment
     */
    async saveRatings(id, ratings) {
        const response = await apiClient.post(`${REVIEWS_API.SELF_ASSESSMENT_DETAIL(id)}/ratings/`, { ratings });
        return response.data;
    }
}

export const selfAssessmentService = new SelfAssessmentService();