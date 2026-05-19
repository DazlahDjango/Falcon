// src/services/reviews/competency.service.js
// Handles all competency, competency category, and competency rating API calls

import { ReviewsBaseService, apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS } from '../../config/constants';

// ========== Competency Service ==========
class CompetencyService extends ReviewsBaseService {
    constructor() {
        super(REVIEW_API_ENDPOINTS.COMPETENCIES);
    }

    /**
     * Get all active competencies only
     * @returns {Promise<Array>} List of active competencies
     */
    async getActive() {
        const response = await apiClient.get(REVIEW_API_ENDPOINTS.COMPETENCY_ACTIVE);
        return response.data;
    }

    /**
     * Get all required competencies only
     * @returns {Promise<Array>} List of required competencies
     */
    async getRequired() {
        const response = await apiClient.get(REVIEW_API_ENDPOINTS.COMPETENCY_REQUIRED);
        return response.data;
    }
}

// ========== Competency Category Service ==========
class CompetencyCategoryService extends ReviewsBaseService {
    constructor() {
        super(REVIEW_API_ENDPOINTS.COMPETENCY_CATEGORIES);
    }
}

// ========== Competency Rating Service ==========
class CompetencyRatingService {
    /**
     * Get competency ratings for a self assessment
     * @param {string|number} assessmentId - Self assessment ID
     * @returns {Promise<Array>} List of competency ratings
     */
    async getForSelfAssessment(assessmentId) {
        const response = await apiClient.get(REVIEW_API_ENDPOINTS.COMPETENCY_RATINGS_BY_ASSESSMENT(assessmentId));
        return response.data;
    }

    /**
     * Get competency ratings for a supervisor review
     * @param {string|number} reviewId - Supervisor review ID
     * @returns {Promise<Array>} List of competency ratings
     */
    async getForSupervisorReview(reviewId) {
        const response = await apiClient.get(REVIEW_API_ENDPOINTS.COMPETENCY_RATINGS_BY_REVIEW(reviewId));
        return response.data;
    }

    /**
     * Bulk create competency ratings
     * @param {Object} data - { parent_id, parent_type, ratings[] }
     * @returns {Promise<Array>} Created ratings
     */
    async bulkCreate(data) {
        const response = await apiClient.post(REVIEW_API_ENDPOINTS.COMPETENCY_RATINGS_BULK, data);
        return response.data;
    }
}

export const competencyService = new CompetencyService();
export const competencyCategoryService = new CompetencyCategoryService();
export const competencyRatingService = new CompetencyRatingService();