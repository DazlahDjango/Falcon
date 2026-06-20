// src/services/reviews/report.service.js
// Handles all report generation API calls

import { apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS as REVIEWS_API } from '../../config/constants/reviewApiConstants';

class ReportService {
    /**
     * Get employee review summary report
     * @param {string|number} employeeId - Employee ID
     * @param {string|number} cycleId - Review cycle ID
     * @returns {Promise<Object>} Employee summary report
     */
    async getEmployeeSummary(employeeId, cycleId) {
        const response = await apiClient.post(REVIEWS_API.REPORTS_EMPLOYEE_SUMMARY, {
            employee_id: employeeId,
            cycle_id: cycleId,
        });
        return response.data;
    }

    /**
     * Get team review summary report (for managers)
     * @param {string|number} managerId - Manager ID
     * @param {string|number} cycleId - Review cycle ID
     * @returns {Promise<Object>} Team summary report
     */
    async getTeamSummary(managerId, cycleId) {
        const response = await apiClient.post(REVIEWS_API.REPORTS_TEAM_SUMMARY, {
            manager_id: managerId,
            cycle_id: cycleId,
        });
        return response.data;
    }

    /**
     * Get cycle summary report
     * @param {string|number} cycleId - Review cycle ID
     * @returns {Promise<Object>} Cycle summary report
     */
    async getCycleSummary(cycleId) {
        const response = await apiClient.post(REVIEWS_API.REPORTS_CYCLE_SUMMARY, {
            cycle_id: cycleId,
        });
        return response.data;
    }

    /**
     * Get PIP summary report
     * @returns {Promise<Object>} PIP summary report
     */
    async getPIPSummary() {
        const response = await apiClient.post(REVIEWS_API.REPORTS_PIP_SUMMARY);
        return response.data;
    }

    /**
     * Get calibration summary report for a cycle
     * @param {string|number} cycleId - Review cycle ID
     * @returns {Promise<Object>} Calibration summary report
     */
    async getCalibrationSummary(cycleId) {
        const response = await apiClient.post(REVIEWS_API.REPORTS_CALIBRATION_SUMMARY, {
            cycle_id: cycleId,
        });
        return response.data;
    }

    /**
     * Get rating distribution report for a cycle
     * @param {string|number} cycleId - Review cycle ID
     * @returns {Promise<Object>} Rating distribution report
     */
    async getRatingDistribution(cycleId) {
        const response = await apiClient.post(REVIEWS_API.REPORTS_RATING_DISTRIBUTION, {
            cycle_id: cycleId,
        });
        return response.data;
    }

    /**
     * Get organization-wide strategic summary report
     * @param {string|number} cycleId - Review cycle ID
     * @returns {Promise<Object>} Organization strategic summary report
     */
    async getOrganizationSummary(cycleId) {
        const response = await apiClient.post(REVIEWS_API.REPORTS_ORGANIZATION_SUMMARY, {
            cycle_id: cycleId,
        });
        return response.data;
    }

    /**
     * Export report to file
     * @param {string} reportType - 'ratings', 'pips', 'calibration'
     * @param {string|number} cycleId - Review cycle ID
     * @param {string} format - 'csv', 'excel', 'pdf'
     * @returns {Promise<Object>} Export data
     */
    async export(reportType, cycleId, format = 'csv') {
        const response = await apiClient.post(REVIEWS_API.REPORTS_EXPORT, {
            report_type: reportType,
            cycle_id: cycleId,
            format,
        });
        return response.data;
    }
}

export const reportService = new ReportService();