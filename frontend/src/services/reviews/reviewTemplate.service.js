// src/services/reviews/reviewTemplate.service.js
// Handles all review template API calls for customizable review forms

import { ReviewsBaseService, apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS as REVIEWS_API } from '../../config/constants';

class ReviewTemplateService extends ReviewsBaseService {
    constructor() {
        super(REVIEWS_API.REVIEW_TEMPLATES);
    }

    /**
     * Get the default review template for the tenant
     * @returns {Promise<Object>} Default template
     */
    async getDefault() {
        const response = await apiClient.get(`${REVIEWS_API.REVIEW_TEMPLATES}?is_default=true`);
        return response.data;
    }

    /**
     * Get templates for a specific review type
     * @param {string} reviewType - 'self_assessment', 'supervisor_review', '360_feedback'
     * @returns {Promise<Array>} Templates for the review type
     */
    async getByType(reviewType) {
        let endpoint;
        switch (reviewType) {
            case 'self_assessment':
                endpoint = REVIEWS_API.REVIEW_TEMPLATES_SELF_ASSESSMENT;
                break;
            case 'supervisor_review':
                endpoint = REVIEWS_API.REVIEW_TEMPLATES_SUPERVISOR_REVIEW;
                break;
            case '360_feedback':
                endpoint = REVIEWS_API.REVIEW_TEMPLATES_360_FEEDBACK;
                break;
            default:
                endpoint = REVIEWS_API.REVIEW_TEMPLATES;
        }
        const response = await apiClient.get(endpoint);
        return response.data;
    }

    /**
     * Set a template as the default
     * @param {string|number} id - Template ID
     * @returns {Promise<Object>} Updated template
     */
    async setDefault(id) {
        const response = await apiClient.post(`${REVIEWS_API.REVIEW_TEMPLATES}${id}/set-default/`);
        return response.data;
    }

    /**
     * Duplicate an existing template
     * @param {string|number} id - Template ID to duplicate
     * @param {Object} data - New template data (name, etc.)
     * @returns {Promise<Object>} Duplicated template
     */
    async duplicate(id, data) {
        const response = await apiClient.post(`${REVIEWS_API.REVIEW_TEMPLATES}${id}/duplicate/`, data);
        return response.data;
    }
}

export const reviewTemplateService = new ReviewTemplateService();