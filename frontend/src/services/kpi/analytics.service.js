import api from '../api';
import { API_ENDPOINTS } from '../api/endpoints';

class AnalyticsService {
    async getKPISummaries(params = {}) {
        const response = await api.get(API_ENDPOINTS.ANALYTICS.KPI_SUMMARIES, { params });
        return response.data;
    }
    async getDepartmentRollups(params = {}) {
        const response = await api.get(API_ENDPOINTS.ANALYTICS.DEPARTMENT_ROLLUPS, { params });
        return response.data;
    }
    async getOrganizationHealth(params = {}) {
        const response = await api.get(API_ENDPOINTS.ANALYTICS.ORGANIZATION_HEALTH, { params });
        return response.data;
    }
    async getKPITrends(kpiId) {
        const response = await api.get(API_ENDPOINTS.ANALYTICS.TRENDS(kpiId));
        return response.data;
    }
    async getInsights(year = null, month = null) {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.get(API_ENDPOINTS.ANALYTICS.INSIGHTS, { params });
        return response.data;
    }
    async getPredictions() {
        const response = await api.get(API_ENDPOINTS.ANALYTICS.PREDICTIONS);
        return response.data;
    }
    async getDepartmentComparison(year = null, month = null) {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.get('/analytics/department-comparison/', { params });
        return response.data;
    }
    async getScoreDistribution(year = null, month = null) {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.get('/analytics/score-distribution/', { params });
        return response.data;
    }
}

export default new AnalyticsService();