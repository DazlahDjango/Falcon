// src/services/reviews/insight.service.js
// Handles AI insights generation and management API calls

import { apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS as REVIEWS_API } from '../../config/constants';

class InsightService {
    /**
     * Get all insights for a tenant
     * @param {Object} params - Query parameters (type, status, limit, offset)
     * @returns {Promise<Object>} List of insights with pagination
     */
    async getInsights(params = {}) {
        const response = await apiClient.get(REVIEWS_API.ANALYTICS_INSIGHTS, { params });
        return response.data;
    }

    /**
     * Generate new insights manually
     * @param {Object} data - Generation parameters (type, department_id, manager_id)
     * @returns {Promise<Object>} Generated insights
     */
    async generateInsights(data = {}) {
        const response = await apiClient.post(REVIEWS_API.ANALYTICS_INSIGHTS_GENERATE, data);
        return response.data;
    }

    /**
     * Dismiss an insight (mark as read/acknowledged)
     * @param {string|number} insightId - Insight ID
     * @returns {Promise<Object>} Updated insight status
     */
    async dismissInsight(insightId) {
        const response = await apiClient.post(REVIEWS_API.ANALYTICS_INSIGHTS_DISMISS(insightId));
        return response.data;
    }

    /**
     * Get insights by type
     * @param {string} type - Insight type (positive, negative, warning, opportunity, trend)
     * @param {Object} params - Additional query parameters
     * @returns {Promise<Array>} Filtered insights
     */
    async getInsightsByType(type, params = {}) {
        return this.getInsights({ ...params, type });
    }

    /**
     * Get unread insights count
     * @returns {Promise<Object>} Count of unread insights
     */
    async getUnreadCount() {
        const response = await this.getInsights({ status: 'unread', limit: 1 });
        return { count: response.count };
    }

    /**
     * Mark multiple insights as read
     * @param {Array} insightIds - Array of insight IDs
     * @returns {Promise<Object>} Updated count
     */
    async bulkDismissInsights(insightIds) {
        const promises = insightIds.map(id => this.dismissInsight(id));
        await Promise.all(promises);
        return { dismissed: insightIds.length };
    }
}

// Create and export singleton instance
export const insightService = new InsightService();
export default insightService;