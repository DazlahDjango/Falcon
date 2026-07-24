import { ReportBaseService, withRetry } from './reportBase.service';
import { ANALYTICS_ENDPOINTS } from '../../config/constants/reportApiConstants';

class AnalyticsService extends ReportBaseService {
    constructor() {
        super('analytics');
    }

    async trendAnalysis(data) {
        if (!data) throw new Error('Analysis data is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(ANALYTICS_ENDPOINTS.TREND, data);
            return response;
        });
    }

    async performanceAnalysis(data) {
        if (!data) throw new Error('Analysis data is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(ANALYTICS_ENDPOINTS.PERFORMANCE, data);
            return response;
        });
    }

    async comparativeAnalysis(data) {
        if (!data) throw new Error('Analysis data is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(ANALYTICS_ENDPOINTS.COMPARATIVE, data);
            return response;
        });
    }

    async predictiveAnalysis(data) {
        if (!data) throw new Error('Analysis data is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(ANALYTICS_ENDPOINTS.PREDICTIVE, data);
            return response;
        });
    }

    async anomalyDetection(data) {
        if (!data) throw new Error('Analysis data is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(ANALYTICS_ENDPOINTS.ANOMALY, data);
            return response;
        });
    }
}

export const analyticsService = new AnalyticsService();

