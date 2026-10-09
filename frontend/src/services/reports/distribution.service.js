import { ReportBaseService, withRetry } from './reportBase.service';
import { DISTRIBUTION_ENDPOINTS } from '../../config/constants/reportApiConstants';

class DistributionService extends ReportBaseService {
    constructor() {
        super('distributions');
    }

    async getDistributions(params = {}) {
        return withRetry(async () => {
            const response = await this.apiClient.get(DISTRIBUTION_ENDPOINTS.LIST, { params });
            return response;
        });
    }

    async getDistribution(id) {
        if (!id) throw new Error('Distribution List ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.get(DISTRIBUTION_ENDPOINTS.DETAIL(id));
            return response;
        });
    }

    async createDistribution(data) {
        if (!data) throw new Error('Distribution List data is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(DISTRIBUTION_ENDPOINTS.CREATE, data);
            return response;
        });
    }

    async updateDistribution(id, data) {
        if (!id) throw new Error('Distribution List ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.patch(DISTRIBUTION_ENDPOINTS.UPDATE(id), data);
            return response;
        });
    }

    async deleteDistribution(id) {
        if (!id) throw new Error('Distribution List ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.delete(DISTRIBUTION_ENDPOINTS.DELETE(id));
            return response;
        });
    }
}

export const distributionService = new DistributionService();
export default distributionService;
