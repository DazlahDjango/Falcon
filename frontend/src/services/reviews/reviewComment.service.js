// src/services/reviews/reviewComment.service.js
// Handles all review comment API calls (generic comments for any review model)

import { ReviewsBaseService, apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS as REVIEWS_API } from '../../config/constants';

class ReviewCommentService extends ReviewsBaseService {
    constructor() {
        super(REVIEWS_API.REVIEW_COMMENTS);
    }

    /**
     * Get comments for a specific parent object
     * @param {string} parentType - Parent type (selfassessment, supervisorreview, finalrating, pip, etc.)
     * @param {string|number} parentId - Parent object ID
     * @returns {Promise<Array>} Comments for the parent
     */
    async getForParent(parentType, parentId) {
        const response = await apiClient.get(
            `${REVIEWS_API.REVIEW_COMMENTS}?content_type=${parentType}&object_id=${parentId}`
        );
        return response.data;
    }

    /**
     * Add a comment to a parent object
     * @param {string} parentType - Parent type
     * @param {string|number} parentId - Parent object ID
     * @param {string} comment - Comment text
     * @param {string} commentType - 'general', 'question', 'clarification', 'feedback', 'approval', 'dispute', 'resolution'
     * @param {string} visibility - 'public', 'manager_only', 'hr_only', 'private'
     * @param {string|number|null} parentCommentId - For replies
     * @returns {Promise<Object>} Created comment
     */
    async add(parentType, parentId, comment, commentType = 'general', visibility = 'public', parentCommentId = null) {
        const response = await apiClient.post(REVIEWS_API.REVIEW_COMMENTS, {
            content_type: parentType,
            object_id: parentId,
            comment,
            comment_type: commentType,
            visibility,
            parent_comment_id: parentCommentId,
        });
        return response.data;
    }

    /**
     * Update a comment (only author can update)
     * @param {string|number} id - Comment ID
     * @param {string} comment - New comment text
     * @returns {Promise<Object>} Updated comment
     */
    async update(id, comment) {
        const response = await apiClient.patch(`${REVIEWS_API.REVIEW_COMMENTS}${id}/`, { comment });
        return response.data;
    }

    /**
     * Delete a comment (soft delete)
     * @param {string|number} id - Comment ID
     * @returns {Promise<Object>} Deletion confirmation
     */
    async delete(id) {
        const response = await apiClient.delete(`${REVIEWS_API.REVIEW_COMMENTS}${id}/`);
        return response.data;
    }

    /**
     * Resolve a comment (for action items)
     * @param {string|number} id - Comment ID
     * @returns {Promise<Object>} Resolved comment
     */
    async resolve(id) {
        const response = await apiClient.post(`${REVIEWS_API.REVIEW_COMMENTS}${id}/resolve/`);
        return response.data;
    }
}

export const reviewCommentService = new ReviewCommentService();