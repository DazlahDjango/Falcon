// src/services/reviews/feedback.service.js
// Handles all feedback API calls (requests, responses, summaries)

import { ReviewsBaseService, apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS as REVIEWS_API } from '../../config/constants';

// ========== Feedback Request Service ==========
class FeedbackRequestService extends ReviewsBaseService {
    constructor() {
        super(REVIEWS_API.FEEDBACK_REQUESTS);
    }

    /**
     * Get pending feedback requests for current user
     * @returns {Promise<Array>} Pending requests
     */
    async getPending() {
        const response = await apiClient.get(REVIEWS_API.FEEDBACK_REQUEST_PENDING);
        return response.data;
    }

    /**
     * Send reminder for feedback request
     * @param {string|number} id - Request ID
     * @returns {Promise<Object>} Reminder status
     */
    async sendReminder(id) {
        const response = await apiClient.post(REVIEWS_API.FEEDBACK_REQUEST_REMIND(id));
        return response.data;
    }

    /**
     * Get feedback requests for a specific subject
     * @param {string|number} subjectId - Subject (employee) ID
     * @param {string|number} cycleId - Cycle ID
     * @returns {Promise<Array>} Feedback requests
     */
    async getForSubject(subjectId, cycleId) {
        const response = await apiClient.get(
            `${REVIEWS_API.FEEDBACK_REQUESTS}?subject=${subjectId}&review_cycle=${cycleId}`
        );
        return response.data;
    }
}

// ========== Feedback Response Service ==========
class FeedbackResponseService {
    /**
     * Submit feedback response
     * @param {string|number} requestId - Feedback request ID
     * @param {Object} data - Response data (ratings, comments)
     * @returns {Promise<Object>} Submitted response
     */
    async submit(requestId, data) {
        const response = await apiClient.post(REVIEWS_API.FEEDBACK_RESPONSE_SUBMIT(requestId), data);
        return response.data;
    }

    /**
     * Get response for a specific request
     * @param {string|number} requestId - Request ID
     * @returns {Promise<Object>} Feedback response
     */
    async getForRequest(requestId) {
        const response = await apiClient.get(REVIEWS_API.FEEDBACK_RESPONSE_FOR_REQUEST(requestId));
        return response.data;
    }
}

// ========== Feedback Summary Service ==========
class FeedbackSummaryService extends ReviewsBaseService {
    constructor() {
        super(REVIEWS_API.FEEDBACK_SUMMARIES);
    }

    /**
     * Get my feedback summary for latest cycle
     * @returns {Promise<Object>} My feedback summary
     */
    async getMy() {
        const response = await apiClient.get(REVIEWS_API.FEEDBACK_SUMMARY_MY);
        return response.data;
    }

    /**
     * Share feedback summary with subject (HR only)
     * @param {string|number} id - Summary ID
     * @returns {Promise<Object>} Shared summary
     */
    async share(id) {
        const response = await apiClient.post(REVIEWS_API.FEEDBACK_SUMMARY_SHARE(id));
        return response.data;
    }

    /**
     * Get summary for specific employee and cycle
     * @param {string|number} employeeId - Employee ID
     * @param {string|number} cycleId - Cycle ID
     * @returns {Promise<Object>} Employee summary
     */
    async getForEmployee(employeeId, cycleId) {
        const response = await apiClient.get(
            `${REVIEWS_API.FEEDBACK_SUMMARIES}?subject=${employeeId}&review_cycle=${cycleId}`
        );
        return response.data;
    }
}

export const feedbackRequestService = new FeedbackRequestService();
export const feedbackResponseService = new FeedbackResponseService();
export const feedbackSummaryService = new FeedbackSummaryService();