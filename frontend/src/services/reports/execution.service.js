import { ReportBaseService, withRetry } from './reportBase.service';
import { EXECUTION_ENDPOINTS } from '../../config/constants/reportApiConstants';

class ExecutionService extends ReportBaseService {
    constructor() {
        super('executions');
    }

    async getExecutions(params = {}) {
        return withRetry(async () => {
            const response = await this.apiClient.get(EXECUTION_ENDPOINTS.LIST, { params });
            return response;
        });
    }

    async getExecution(id) {
        if (!id) throw new Error('Execution ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.get(EXECUTION_ENDPOINTS.DETAIL(id));
            return response;
        });
    }

    async getExecutionLogs(id) {
        if (!id) throw new Error('Execution ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.get(EXECUTION_ENDPOINTS.LOGS(id));
            return response;
        });
    }

    async getExecutionsByReport(reportId) {
        if (!reportId) throw new Error('Report ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.get(EXECUTION_ENDPOINTS.BY_REPORT(reportId));
            return response;
        });
    }

    async getExecutionStatuses() {
        return withRetry(async () => {
            const response = await this.apiClient.get(EXECUTION_ENDPOINTS.STATUSES);
            return response;
        });
    }
}

export const executionService = new ExecutionService();

