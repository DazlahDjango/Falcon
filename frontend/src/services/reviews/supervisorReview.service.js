// src/services/reviews/supervisorReview.service.js
// Handles all supervisor review API calls

import { ReviewsBaseService, apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS as REVIEWS_API } from '../../config/constants';

class SupervisorReviewService extends ReviewsBaseService {
    constructor() {
        super(REVIEWS_API.SUPERVISOR_REVIEWS);
    }

    /**
     * Get manager's review queue
     * @returns {Promise<Array>} Review queue
     */
    async getQueue() {
        const response = await apiClient.get(REVIEWS_API.SUPERVISOR_REVIEW_QUEUE);
        return response.data;
    }

    /**
     * Submit supervisor review
     * @param {string|number} id - Review ID
     * @returns {Promise<Object>} Submitted review
     */
    async submit(id) {
        const response = await apiClient.post(REVIEWS_API.SUPERVISOR_REVIEW_SUBMIT(id));
        return response.data;
    }

    /**
     * Approve supervisor review (HR only)
     * @param {string|number} id - Review ID
     * @returns {Promise<Object>} Approved review
     */
    async approve(id) {
        const response = await apiClient.post(REVIEWS_API.SUPERVISOR_REVIEW_APPROVE(id));
        return response.data;
    }

    /**
     * Reject supervisor review (HR only)
     * @param {string|number} id - Review ID
     * @param {string} reason - Rejection reason
     * @returns {Promise<Object>} Rejected review
     */
    async reject(id, reason) {
        const response = await apiClient.post(REVIEWS_API.SUPERVISOR_REVIEW_REJECT(id), { reason });
        return response.data;
    }

    /**
     * Get supervisor review for specific employee
     * @param {string|number} employeeId - Employee ID
     * @param {string|number} cycleId - Cycle ID
     * @returns {Promise<Object>} Employee review
     */
    async getForEmployee(employeeId, cycleId) {
        const response = await apiClient.get(
            `${REVIEWS_API.SUPERVISOR_REVIEWS}?employee=${employeeId}&review_cycle=${cycleId}`
        );
        return response.data;
    }

    /**
     * Get all supervisor reviews for a cycle
     * @param {string|number} cycleId - Cycle ID
     * @returns {Promise<Array>} Cycle reviews
     */
    async getForCycle(cycleId) {
        const response = await apiClient.get(`${REVIEWS_API.SUPERVISOR_REVIEWS}?review_cycle=${cycleId}`);
        return response.data;
    }

    /**
     * Save competency ratings for supervisor review
     * @param {string|number} id - Review ID
     * @param {Array} ratings - Array of {competency_id, rating, comment}
     * @returns {Promise<Object>} Updated review
     */
    async saveRatings(id, ratings) {
        const response = await apiClient.post(`${REVIEWS_API.SUPERVISOR_REVIEW_DETAIL(id)}/ratings/`, { ratings });
        return response.data;
    }

    /**
     * Get comparison between self assessment and supervisor review
     * @param {string|number} id - Review ID
     * @returns {Promise<Object>} Comparison data
     */
    async getComparison(id) {
        const response = await apiClient.get(`${REVIEWS_API.SUPERVISOR_REVIEW_DETAIL(id)}/compare/`);
        return response.data;
    }
}

export const supervisorReviewService = new SupervisorReviewService();