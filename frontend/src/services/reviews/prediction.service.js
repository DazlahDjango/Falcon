// src/services/reviews/prediction.service.js
// Handles flight risk predictions and performance forecasts API calls

import { apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS as REVIEWS_API } from '../../config/constants';

class PredictionService {
    /**
     * Get all predictions (flight risk, performance forecasts)
     * @param {Object} params - Query parameters (risk_level, department_id, limit, offset)
     * @returns {Promise<Object>} List of predictions
     */
    async getPredictions(params = {}) {
        const response = await apiClient.get(REVIEWS_API.ANALYTICS_PREDICTIONS, { params });
        return response.data;
    }

    /**
     * Get high risk employees only
     * @param {Object} params - Query parameters (department_id, manager_id, threshold)
     * @returns {Promise<Array>} List of high risk employees
     */
    async getHighRiskEmployees(params = {}) {
        const response = await apiClient.get(REVIEWS_API.ANALYTICS_HIGH_RISK_EMPLOYEES, { params });
        return response.data;
    }

    /**
     * Get risk assessment for a specific employee
     * @param {string|number} employeeId - Employee ID
     * @param {Object} params - Query parameters (include_factors, detailed)
     * @returns {Promise<Object>} Employee risk assessment
     */
    async getEmployeeRisk(employeeId, params = {}) {
        const response = await apiClient.get(REVIEWS_API.ANALYTICS_EMPLOYEE_RISK(employeeId), { params });
        return response.data;
    }

    /**
     * Get predictions filtered by risk level
     * @param {string} riskLevel - Risk level (low, medium, high, critical)
     * @param {Object} params - Additional parameters
     * @returns {Promise<Array>} Filtered predictions
     */
    async getPredictionsByRiskLevel(riskLevel, params = {}) {
        return this.getPredictions({ ...params, risk_level: riskLevel });
    }

    /**
     * Export predictions data
     * @param {string} format - Export format (pdf, xlsx, csv)
     * @param {Object} params - Query parameters
     * @returns {Promise<Blob>} File blob for download
     */
    async exportPredictions(format = 'pdf', params = {}) {
        const response = await apiClient.post(REVIEWS_API.EXPORT_ANALYTICS, {
            analytics_type: 'predictions',
            format: format,
            ...params
        }, {
            responseType: 'blob'
        });
        return response.data;
    }
}

// Create and export singleton instance
export const predictionService = new PredictionService();
export default predictionService;