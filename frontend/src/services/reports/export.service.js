import { ReportBaseService, withRetry } from './reportBase.service';
import { EXPORT_ENDPOINTS } from '../../config/constants/reportApiConstants';

class ExportService extends ReportBaseService {
    constructor() {
        super('exports');
    }

    async getExports(params = {}) {
        return withRetry(async () => {
            const response = await this.apiClient.get(EXPORT_ENDPOINTS.LIST, { params });
            return response;
        });
    }

    async getExport(id) {
        if (!id) throw new Error('Export ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.get(EXPORT_ENDPOINTS.DETAIL(id));
            return response;
        });
    }

    async createExport(data) {
        if (!data) throw new Error('Export data is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(EXPORT_ENDPOINTS.CREATE, data);
            return response;
        });
    }

    async downloadExport(id) {
        if (!id) throw new Error('Export ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.get(EXPORT_ENDPOINTS.DOWNLOAD(id), {
                responseType: 'blob'
            });
            return response;
        });
    }

    async regenerateExport(id) {
        if (!id) throw new Error('Export ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(EXPORT_ENDPOINTS.REGENERATE(id));
            return response;
        });
    }

    async getMyExports(params = {}) {
        return withRetry(async () => {
            const response = await this.apiClient.get(EXPORT_ENDPOINTS.MY_EXPORTS, { params });
            return response;
        });
    }

    async getExportFormats() {
        return withRetry(async () => {
            const response = await this.apiClient.get(EXPORT_ENDPOINTS.FORMATS);
            return response;
        });
    }
}

export const exportService = new ExportService();
