import { ReportBaseService, withRetry } from './reportBase.service';
import { SHARE_ENDPOINTS } from '../../config/constants/reportApiConstants';

class ShareService extends ReportBaseService {
    constructor() {
        super('shares');
    }

    async getShares(params = {}) {
        return withRetry(async () => {
            const response = await this.apiClient.get(SHARE_ENDPOINTS.LIST, { params });
            return response;
        });
    }

    async getShare(id) {
        if (!id) throw new Error('Share ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.get(SHARE_ENDPOINTS.DETAIL(id));
            return response;
        });
    }

    async createShare(data) {
        if (!data) throw new Error('Share data is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(SHARE_ENDPOINTS.CREATE, data);
            return response;
        });
    }

    async updateShare(id, data) {
        if (!id) throw new Error('Share ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.patch(SHARE_ENDPOINTS.UPDATE(id), data);
            return response;
        });
    }

    async deleteShare(id) {
        if (!id) throw new Error('Share ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.delete(SHARE_ENDPOINTS.DELETE(id));
            return response;
        });
    }

    async accessShare(token, password = null) {
        if (!token) throw new Error('Share token is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(SHARE_ENDPOINTS.ACCESS(token), { token, password });
            return response;
        });
    }

    async deactivateShare(id) {
        if (!id) throw new Error('Share ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(SHARE_ENDPOINTS.DEACTIVATE(id));
            return response;
        });
    }

    async activateShare(id) {
        if (!id) throw new Error('Share ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(SHARE_ENDPOINTS.ACTIVATE(id));
            return response;
        });
    }

    async getSharesByReport(reportId) {
        if (!reportId) throw new Error('Report ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.get(SHARE_ENDPOINTS.BY_REPORT(reportId));
            return response;
        });
    }

    async getShareTypes() {
        return withRetry(async () => {
            const response = await this.apiClient.get(SHARE_ENDPOINTS.TYPES);
            return response;
        });
    }

    async getSharePermissions() {
        return withRetry(async () => {
            const response = await this.apiClient.get(SHARE_ENDPOINTS.PERMISSIONS);
            return response;
        });
    }
}

export const shareService = new ShareService();

