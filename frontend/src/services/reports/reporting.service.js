import { ReportBaseService, withRetry } from './reportBase.service';
import { REPORTING_ENDPOINTS } from '../../config/constants/reportApiConstants';

class ReportingService extends ReportBaseService {
    constructor() {
        super('reporting');
    }

    async generateReport(data) {
        if (!data) throw new Error('Generation data is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(REPORTING_ENDPOINTS.GENERATE, data);
            return response;
        });
    }

    async exportReport(data) {
        if (!data) throw new Error('Export data is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(REPORTING_ENDPOINTS.EXPORT, data);
            return response;
        });
    }

    async bulkExport(data) {
        if (!data || !data.report_ids) throw new Error('Report IDs are required');
        return withRetry(async () => {
            const response = await this.apiClient.post(REPORTING_ENDPOINTS.BULK_EXPORT, data);
            return response;
        });
    }

    async getTaskStatus(taskId) {
        if (!taskId) throw new Error('Task ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.get(REPORTING_ENDPOINTS.STATUS(taskId));
            return response;
        });
    }
}

export const reportingService = new ReportingService();