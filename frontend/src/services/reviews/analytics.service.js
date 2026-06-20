// src/services/reviews/analytics.service.js
// Handles all analytics API calls for company, department, and manager analytics

import { apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS as REVIEWS_API } from '../../config/constants';

class AnalyticsService {
    // ========== Company Analytics ==========
    
    /**
     * Get company level analytics
     * @param {Object} params - Query parameters (period, start_date, end_date)
     * @returns {Promise<Object>} Company analytics data
     */
    async getCompanyAnalytics(params = {}) {
        const response = await apiClient.get(REVIEWS_API.ANALYTICS_COMPANY, { params });
        return response.data;
    }

    /**
     * Get company analytics trends over time
     * @param {Object} params - Query parameters (period, months, start_date, end_date)
     * @returns {Promise<Object>} Trend data with historical scores
     */
    async getCompanyTrends(params = {}) {
        const response = await apiClient.get(REVIEWS_API.ANALYTICS_COMPANY_TRENDS, { params });
        return response.data;
    }

    /**
     * Get company summary statistics
     * @param {string|number} cycleId - Optional cycle ID to filter
     * @returns {Promise<Object>} Summary statistics
     */
    async getCompanySummary(cycleId = null) {
        const params = cycleId ? { cycle_id: cycleId } : {};
        const response = await apiClient.get(REVIEWS_API.ANALYTICS_COMPANY_SUMMARY, { params });
        return response.data;
    }

    // ========== Department Analytics ==========
    
    /**
     * Get all departments analytics
     * @param {Object} params - Query parameters (period, cycle_id, sort_by)
     * @returns {Promise<Array>} List of department analytics
     */
    async getDepartmentsAnalytics(params = {}) {
        const response = await apiClient.get(REVIEWS_API.ANALYTICS_DEPARTMENTS, { params });
        return response.data;
    }

    /**
     * Get specific department analytics
     * @param {string|number} departmentId - Department ID
     * @param {Object} params - Query parameters (period, cycle_id)
     * @returns {Promise<Object>} Department analytics data
     */
    async getDepartmentAnalytics(departmentId, params = {}) {
        const response = await apiClient.get(REVIEWS_API.ANALYTICS_DEPARTMENT_DETAIL(departmentId), { params });
        return response.data;
    }

    /**
     * Get department analytics trends
     * @param {string|number} departmentId - Department ID
     * @param {Object} params - Query parameters (period, months)
     * @returns {Promise<Object>} Department trend data
     */
    async getDepartmentTrends(departmentId, params = {}) {
        const response = await apiClient.get(REVIEWS_API.ANALYTICS_DEPARTMENT_TRENDS(departmentId), { params });
        return response.data;
    }

    // ========== Manager Analytics ==========
    
    /**
     * Get all managers analytics
     * @param {Object} params - Query parameters (period, cycle_id, sort_by)
     * @returns {Promise<Array>} List of manager analytics
     */
    async getManagersAnalytics(params = {}) {
        const response = await apiClient.get(REVIEWS_API.ANALYTICS_MANAGERS, { params });
        return response.data;
    }

    /**
     * Get specific manager analytics
     * @param {string|number} managerId - Manager ID
     * @param {Object} params - Query parameters (period, cycle_id)
     * @returns {Promise<Object>} Manager analytics data
     */
    async getManagerAnalytics(managerId, params = {}) {
        const response = await apiClient.get(REVIEWS_API.ANALYTICS_MANAGER_DETAIL(managerId), { params });
        return response.data;
    }

    /**
     * Get manager's team analytics
     * @param {string|number} managerId - Manager ID
     * @param {Object} params - Query parameters (cycle_id, include_details)
     * @returns {Promise<Object>} Team analytics including members
     */
    async getManagerTeam(managerId, params = {}) {
        const response = await apiClient.get(REVIEWS_API.ANALYTICS_MANAGER_TEAM(managerId), { params });
        return response.data;
    }

    // ========== Export Functions ==========
    
    /**
     * Export analytics data
     * @param {string} type - Analytics type (company, departments, managers)
     * @param {string} format - Export format (pdf, xlsx, csv)
     * @param {Object} params - Query parameters
     * @returns {Promise<Blob>} File blob for download
     */
    async exportAnalytics(type, format = 'pdf', params = {}) {
        const response = await apiClient.post(REVIEWS_API.EXPORT_ANALYTICS, {
            analytics_type: type,
            format: format,
            ...params
        }, {
            responseType: 'blob'
        });
        return response.data;
    }
}

// Create and export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;