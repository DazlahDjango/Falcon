// src/services/reviews/calibration.service.js
// Handles all calibration API calls (sessions, ratings, comments)

import { ReviewsBaseService, apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS } from '../../config/constants/reviewApiConstants';

// ========== Calibration Session Service ==========
class CalibrationSessionService extends ReviewsBaseService {
    constructor() {
        super(REVIEW_API_ENDPOINTS.CALIBRATION_SESSIONS);
    }

    /**S
     * Start a calibration session
     * @param {string|number} id - Session ID
     * @returns {Promise<Object>} Started session
     */
    async start(id) {
        const response = await apiClient.post(REVIEW_API_ENDPOINTS.CALIBRATION_SESSION_START(id));
        return response.data;
    }

    /**
     * Complete a calibration session
     * @param {string|number} id - Session ID
     * @param {string} decisions - Key decisions made
     * @param {string} notes - Session notes
     * @returns {Promise<Object>} Completed session
     */
    async complete(id, decisions = '', notes = '') {
        const response = await apiClient.post(REVIEW_API_ENDPOINTS.CALIBRATION_SESSION_COMPLETE(id), {
            decisions,
            notes,
        });
        return response.data;
    }

    /**
     * Get calibration session report
     * @param {string|number} id - Session ID
     * @returns {Promise<Object>} Session report
     */
    async getReport(id) {
        const response = await apiClient.get(REVIEW_API_ENDPOINTS.CALIBRATION_SESSION_REPORT(id));
        return response.data;
    }

    /**
     * Get my upcoming calibration sessions
     * @returns {Promise<Array>} My sessions
     */
    async getMySessions() {
        const response = await apiClient.get(REVIEW_API_ENDPOINTS.CALIBRATION_SESSION_MY);
        return response.data;
    }

    /**
     * Get outlier report for a cycle
     * @param {string|number} cycleId - Cycle ID
     * @returns {Promise<Object>} Outlier report
     */
    async getOutlierReport(cycleId) {
        const response = await apiClient.get(REVIEW_API_ENDPOINTS.CALIBRATION_OUTLIER_REPORT, {
            params: { cycle_id: cycleId },
        });
        return response.data;
    }

    /**
     * Get calibration sessions for a cycle
     * @param {string|number} cycleId - Cycle ID
     * @returns {Promise<Array>} Cycle sessions
     */
    async getForCycle(cycleId) {
        const response = await apiClient.get(
            `${REVIEW_API_ENDPOINTS.CALIBRATION_SESSIONS}?review_cycle=${cycleId}`
        );
        return response.data;
    }
}

// ========== Calibration Rating Service ==========
class CalibrationRatingService {
    /**
     * Adjust a rating during calibration
     * @param {string|number} sessionId - Session ID
     * @param {string|number} finalRatingId - Final rating ID
     * @param {number} beforeScore - Original score
     * @param {number} afterScore - Adjusted score
     * @param {string} reason - Adjustment reason
     * @returns {Promise<Object>} Rating adjustment
     */
    async adjust(sessionId, finalRatingId, beforeScore, afterScore, reason) {
        const response = await apiClient.post(
            REVIEW_API_ENDPOINTS.CALIBRATION_SESSION_ADJUST_RATING(sessionId),
            {
                final_rating: finalRatingId,
                before_score: beforeScore,
                after_score: afterScore,
                adjustment_reason: reason,
            }
        );
        return response.data;
    }

    /**
     * Get all adjustments for a session
     * @param {string|number} sessionId - Session ID
     * @returns {Promise<Array>} Rating adjustments
     */
    async getForSession(sessionId) {
        const response = await apiClient.get(REVIEW_API_ENDPOINTS.CALIBRATION_RATINGS_FOR_SESSION(sessionId));
        return response.data;
    }
}

// ========== Calibration Comment Service ==========
class CalibrationCommentService {
    /**
     * Add comment to calibration session
     * @param {string|number} sessionId - Session ID
     * @param {string} comment - Comment text
     * @param {string|number|null} parentCommentId - Parent comment ID for replies
     * @returns {Promise<Object>} Added comment
     */
    async add(sessionId, comment, parentCommentId = null) {
        const response = await apiClient.post(
            REVIEW_API_ENDPOINTS.CALIBRATION_SESSION_ADD_COMMENT(sessionId),
            {
                comment,
                parent_comment_id: parentCommentId,
            }
        );
        return response.data;
    }

    /**
     * Get all comments for a session
     * @param {string|number} sessionId - Session ID
     * @returns {Promise<Array>} Session comments
     */
    async getForSession(sessionId) {
        const response = await apiClient.get(REVIEW_API_ENDPOINTS.CALIBRATION_COMMENTS_FOR_SESSION(sessionId));
        return response.data;
    }
}

export const calibrationSessionService = new CalibrationSessionService();
export const calibrationRatingService = new CalibrationRatingService();
export const calibrationCommentService = new CalibrationCommentService();