// src/services/reviews/ratingScale.service.js
// Handles all rating scale API calls

import { ReviewsBaseService, apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS as REVIEWS_API } from '../../config/constants';

class RatingScaleService extends ReviewsBaseService {
    constructor() {
        super(REVIEWS_API.RATING_SCALES);
    }

    /**
     * Set a rating scale as the default for the tenant
     * @param {string|number} id - Rating scale ID
     * @returns {Promise<Object>} Updated rating scale
     */
    async setDefault(id) {
        const response = await apiClient.post(REVIEWS_API.RATING_SCALE_SET_DEFAULT(id));
        return response.data;
    }

    /**
     * Get the default rating scale for the current tenant
     * @returns {Promise<Object>} Default rating scale
     */
    async getDefault() {
        const response = await apiClient.get(REVIEWS_API.RATING_SCALE_DEFAULT);
        return response.data;
    }

    /**
     * Convert a score using a rating scale
     * @param {Object} data - { score, from_type, to_type, rating_scale_id }
     * @returns {Promise<Object>} Converted score
     */
    async convertScore(data) {
        const response = await apiClient.post(REVIEWS_API.RATING_SCALE_CONVERT, data);
        return response.data;
    }
}

export const ratingScaleService = new RatingScaleService();