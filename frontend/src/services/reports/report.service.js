import { ReportBaseService, withRetry } from './reportBase.service';
import {
    REPORT_ENDPOINTS,
    REPORT_TYPES,
    REPORT_STATUSES,
    REPORT_CATEGORIES,
    REPORT_FORMATS,
} from '../../config/constants/reportApiConstants';

class ReportService extends ReportBaseService {
    constructor() {
        super('reports');
    }

    // ============ Report CRUD ============
    async getReports(params = {}) {
        return withRetry(async () => {
            const response = await this.apiClient.get(REPORT_ENDPOINTS.LIST, { params });
            return response;
        });
    }

    async getReport(id) {
        if (!id) throw new Error('Report ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.get(REPORT_ENDPOINTS.DETAIL(id));
            return response;
        });
    }

    async createReport(data) {
        if (!data) throw new Error('Report data is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(REPORT_ENDPOINTS.CREATE, data);
            return response;
        });
    }

    async updateReport(id, data) {
        if (!id) throw new Error('Report ID is required');
        if (!data) throw new Error('Report data is required');
        return withRetry(async () => {
            const response = await this.apiClient.patch(REPORT_ENDPOINTS.UPDATE(id), data);
            return response;
        });
    }

    async deleteReport(id) {
        if (!id) throw new Error('Report ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.delete(REPORT_ENDPOINTS.DELETE(id));
            return response;
        });
    }

    // ============ Report Actions ============
    async generateReport(id, params = {}) {
        if (!id) throw new Error('Report ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(REPORT_ENDPOINTS.GENERATE(id), params);
            return response;
        });
    }

    async exportReport(id, data) {
        if (!id) throw new Error('Report ID is required');
        if (!data) throw new Error('Export data is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(REPORT_ENDPOINTS.EXPORT(id), data);
            return response;
        });
    }

    async updateReportStatus(id, status) {
        if (!id) throw new Error('Report ID is required');
        if (!status) throw new Error('Status is required');
        return withRetry(async () => {
            const response = await this.apiClient.patch(REPORT_ENDPOINTS.UPDATE_STATUS(id), { status });
            return response;
        });
    }

    async performAction(id, action, data = {}) {
        if (!id) throw new Error('Report ID is required');
        if (!action) throw new Error('Action is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(REPORT_ENDPOINTS.ACTION(id), { action, ...data });
            return response;
        });
    }

    // ============ Specialized Queries ============
    async getMyReports(params = {}) {
        return withRetry(async () => {
            const response = await this.apiClient.get(REPORT_ENDPOINTS.MY_REPORTS, { params });
            return response;
        });
    }

    async getPublicReports(params = {}) {
        return withRetry(async () => {
            const response = await this.apiClient.get(REPORT_ENDPOINTS.PUBLIC_REPORTS, { params });
            return response;
        });
    }

    // ============ Reference Data ============
    async getReportTypes() {
        return withRetry(async () => {
            const response = await this.apiClient.get(REPORT_ENDPOINTS.TYPES);
            return response;
        });
    }

    async getReportStatuses() {
        return withRetry(async () => {
            const response = await this.apiClient.get(REPORT_ENDPOINTS.STATUSES);
            return response;
        });
    }

    // ============ Bulk Operations ============
    async bulkDeleteReports(ids) {
        if (!ids || !ids.length) throw new Error('Report IDs are required');
        return withRetry(async () => {
            const response = await this.apiClient.post(`${REPORT_ENDPOINTS.LIST}bulk_delete/`, { ids });
            return response;
        });
    }

    async bulkPublishReports(ids) {
        if (!ids || !ids.length) throw new Error('Report IDs are required');
        return withRetry(async () => {
            const response = await this.apiClient.post(`${REPORT_ENDPOINTS.LIST}bulk_publish/`, { ids });
            return response;
        });
    }
}

export const reportService = new ReportService();
