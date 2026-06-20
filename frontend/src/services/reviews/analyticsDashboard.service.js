// src/services/reviews/analyticsDashboard.service.js
// Handles analytics dashboard widgets API calls (CRUD operations)

import { ReviewsBaseService, apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS as REVIEWS_API } from '../../config/constants';

class AnalyticsDashboardService extends ReviewsBaseService {
    constructor() {
        super(REVIEWS_API.DASHBOARD_WIDGETS);
    }

    /**
     * Get widget data (preview/actual data for a widget)
     * @param {string|number} widgetId - Widget ID
     * @param {Object} params - Query parameters (refresh, period)
     * @returns {Promise<Object>} Widget data
     */
    async getWidgetData(widgetId, params = {}) {
        const response = await apiClient.get(REVIEWS_API.DASHBOARD_WIDGET_DATA(widgetId), { params });
        return response.data;
    }

    /**
     * Refresh a specific widget's data
     * @param {string|number} widgetId - Widget ID
     * @returns {Promise<Object>} Refreshed widget data
     */
    async refreshWidget(widgetId) {
        const response = await apiClient.post(REVIEWS_API.DASHBOARD_WIDGET_REFRESH(widgetId));
        return response.data;
    }

    /**
     * Reorder analytics dashboard widgets
     * @param {Array} widgetsOrder - Array of widget objects with id and order
     * @returns {Promise<Object>} Updated widgets order
     */
    async reorderWidgets(widgetsOrder) {
        const response = await apiClient.post(REVIEWS_API.DASHBOARD_WIDGET_REORDER, {
            widgets: widgetsOrder
        });
        return response.data;
    }

    /**
     * Update widget configuration
     * @param {string|number} widgetId - Widget ID
     * @param {Object} config - Widget configuration
     * @returns {Promise<Object>} Updated widget
     */
    async updateWidgetConfig(widgetId, config) {
        const response = await apiClient.patch(REVIEWS_API.DASHBOARD_WIDGET_CONFIG(widgetId), {
            config: config
        });
        return response.data;
    }

    /**
     * Get user's analytics dashboard layout
     * @returns {Promise<Array>} List of user's widgets with layout
     */
    async getUserAnalyticsDashboard() {
        const response = await this.getAll({ user_specific: true });
        return response.data || response.results || response;
    }

    /**
     * Reset analytics dashboard to default layout
     * @returns {Promise<Object>} Default dashboard widgets
     */
    async resetAnalyticsDashboard() {
        const response = await apiClient.post(`${REVIEWS_API.DASHBOARD_WIDGETS}reset/`);
        return response.data;
    }
}

// Create and export singleton instance
export const analyticsDashboardService = new AnalyticsDashboardService();
export default analyticsDashboardService;