import api from '../api';
import { readFileAsText, readFileAsJSON } from '../../utils/kpi/export';

/**
 * File Service
 * Handles file upload and download operations
 */
class FileService {
    /**
     * Upload file
     * @param {File} file - File to upload
     * @param {string} endpoint - Upload endpoint
     * @param {Object} additionalData - Additional form data
     * @returns {Promise<Object>} Upload response
     */
    async uploadFile(file, endpoint, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value);
        });
        
        const response = await api.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data;
    }

    /**
     * Download file
     * @param {string} endpoint - Download endpoint
     * @param {Object} params - Query parameters
     * @param {string} filename - Output filename
     * @returns {Promise<Blob>} File blob
     */
    async downloadFile(endpoint, params = {}, filename) {
        const response = await api.get(endpoint, {
            params,
            responseType: 'blob',
        });
        
        // Trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return response.data;
    }

    /**
     * Upload KPI template
     * @param {File} file - Template file
     * @param {string} frameworkId - Framework ID
     * @returns {Promise<Object>} Upload result
     */
    async uploadKPITemplate(file, frameworkId) {
        return this.uploadFile(file, '/kpi/bulk/kpi-upload/', { framework_id: frameworkId });
    }

    /**
     * Upload actual data
     * @param {File} file - Data file
     * @param {number} year - Year
     * @param {number} month - Month
     * @returns {Promise<Object>} Upload result
     */
    async uploadActualData(file, year, month) {
        return this.uploadFile(file, '/kpi/bulk/actual-upload/', { year, month });
    }

    /**
     * Upload targets
     * @param {File} file - Targets file
     * @param {number} year - Year
     * @returns {Promise<Object>} Upload result
     */
    async uploadTargets(file, year) {
        return this.uploadFile(file, '/kpi/bulk/target-upload/', { year });
    }

    /**
     * Download template
     * @param {string} type - Template type (kpi, actual, target)
     * @returns {Promise<Blob>} Template file
     */
    async downloadTemplate(type) {
        return this.downloadFile(`/kpi/bulk/templates/${type}/`, {}, `${type}_template.csv`);
    }

    /**
     * Download report
     * @param {string} type - Report type
     * @param {Object} params - Report parameters
     * @returns {Promise<Blob>} Report file
     */
    async downloadReport(type, params = {}) {
        const filename = `report_${type}_${new Date().toISOString().slice(0, 19)}.pdf`;
        return this.downloadFile(`/kpi/export/reports/`, { type, ...params }, filename);
    }
}

export default new FileService();