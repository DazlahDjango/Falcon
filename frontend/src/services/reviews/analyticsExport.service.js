// src/services/reviews/analyticsExport.service.js
// Handles analytics and reporting export/download functionality

import { apiClient } from './reviewsBase.service';
import { REVIEW_API_ENDPOINTS as REVIEWS_API } from '../../config/constants';

class AnalyticsExportService {
    /**
     * Export analytics data (company, departments, managers)
     * @param {string} type - Analytics type (company, departments, managers)
     * @param {string} format - Export format (pdf, xlsx, csv)
     * @param {Object} params - Query parameters
     * @returns {Promise<Blob>} File blob for download
     */
    async exportAnalytics(type, format = 'pdf', params = {}) {
        const response = await apiClient.post(REVIEWS_API.EXPORT_ANALYTICS, {
            export_type: type,
            format: format,
            ...params
        }, {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Export analytics reports
     * @param {string} reportType - Report type (employee, team, cycle, department, company)
     * @param {string} format - Export format (pdf, xlsx, csv)
     * @param {Object} data - Report specific data (employee_id, cycle_id, etc.)
     * @returns {Promise<Blob>} File blob for download
     */
    async exportAnalyticsReport(reportType, format = 'pdf', data = {}) {
        const response = await apiClient.post(REVIEWS_API.EXPORT_REPORTS, {
            report_type: reportType,
            format: format,
            ...data
        }, {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     Export assessment analytics
     * @param {string} assessmentType - Assessment type (self, supervisor, final)
     * @param {string} format - Export format (pdf, xlsx, csv)
     * @param {Object} params - Query parameters (cycle_id, employee_id)
     * @returns {Promise<Blob>} File blob for download
     */
    async exportAssessmentAnalytics(assessmentType, format = 'pdf', params = {}) {
        const response = await apiClient.post(REVIEWS_API.EXPORT_ASSESSMENTS, {
            assessment_type: assessmentType,
            format: format,
            ...params
        }, {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Export PIP analytics data
     * @param {string} format - Export format (pdf, xlsx, csv)
     * @param {Object} params - Query parameters (status, employee_id, pip_id)
     * @returns {Promise<Blob>} File blob for download
     */
    async exportPIPAnalytics(format = 'pdf', params = {}) {
        const response = await apiClient.post(REVIEWS_API.EXPORT_PIPS, {
            format: format,
            ...params
        }, {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Export feedback analytics
     * @param {string} format - Export format (pdf, xlsx, csv)
     * @param {Object} params - Query parameters (cycle_id, employee_id)
     * @returns {Promise<Blob>} File blob for download
     */
    async exportFeedbackAnalytics(format = 'pdf', params = {}) {
        const response = await apiClient.post(REVIEWS_API.EXPORT_FEEDBACK, {
            format: format,
            ...params
        }, {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Export predictions data
     * @param {string} format - Export format (pdf, xlsx, csv)
     * @param {Object} params - Query parameters (risk_level, department_id)
     * @returns {Promise<Blob>} File blob for download
     */
    async exportPredictionsAnalytics(format = 'pdf', params = {}) {
        const response = await apiClient.post(REVIEWS_API.EXPORT_ANALYTICS, {
            analytics_type: 'predictions',
            format: format,
            ...params
        }, {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Check export job status
     * @param {string} exportId - Export job ID
     * @returns {Promise<Object>} Job status (pending, processing, completed, failed)
     */
    async getExportStatus(exportId) {
        const response = await apiClient.get(REVIEWS_API.EXPORT_STATUS(exportId));
        return response.data;
    }

    /**
     * Download a completed export
     * @param {string} exportId - Export job ID
     * @returns {Promise<Blob>} File blob for download
     */
    async downloadExport(exportId) {
        const response = await apiClient.get(REVIEWS_API.EXPORT_DOWNLOAD(exportId), {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Helper: Trigger file download from blob
     * @param {Blob} blob - File blob
     * @param {string} filename - Desired filename
     */
    downloadBlob(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }

    /**
     * Helper: Get filename from Content-Disposition header
     * @param {Object} response - Axios response
     * @returns {string} Extracted filename
     */
    getFilenameFromResponse(response) {
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                return filenameMatch[1].replace(/['"]/g, '');
            }
        }
        return `analytics_export_${Date.now()}.pdf`;
    }
}

// Create and export singleton instance
export const analyticsExportService = new AnalyticsExportService();
export default analyticsExportService;