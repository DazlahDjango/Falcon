import api from '../api';
import { API_ENDPOINTS } from '../api/endpoints';

class ScoreService {
    async getScores(params = {}) {
        const response = await api.get(API_ENDPOINTS.SCORE.LIST, { params });
        return response.data;
    }
    async getScore(id) {
        const response = await api.get(API_ENDPOINTS.SCORE.DETAIL(id));
        return response.data;
    }
    async getMyScores(year = null, month = null) {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.get(API_ENDPOINTS.SCORE.MY_SCORES, { params });
        return response.data;
    }
    async getTeamScores(year = null, month = null) {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.get(API_ENDPOINTS.SCORE.TEAM_SCORES, { params });
        return response.data;
    }
    async getScoreStatistics(year = null, month = null) {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.get(API_ENDPOINTS.SCORE.STATISTICS, { params });
        return response.data;
    }
    async getAggregatedScores(params = {}) {
        const response = await api.get(API_ENDPOINTS.SCORE.AGGREGATED, { params });
        return response.data;
    }
    async getOrganizationScores(year = null, month = null) {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.get(API_ENDPOINTS.SCORE.ORGANIZATION, { params });
        return response.data;
    }
    async getDepartmentScores(year = null, month = null) {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.get(API_ENDPOINTS.SCORE.DEPARTMENTS, { params });
        return response.data;
    }
    async getDepartmentRanking(year = null, month = null) {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.get(API_ENDPOINTS.SCORE.RANKING, { params });
        return response.data;
    }
    async getTrafficLights(params = {}) {
        const response = await api.get(API_ENDPOINTS.SCORE.TRAFFIC_LIGHTS, { params });
        return response.data;
    }
    async getRedAlerts(year = null, month = null) {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.get(API_ENDPOINTS.SCORE.RED_ALERTS, { params });
        return response.data;
    }
    async getMyRedAlerts() {
        const response = await api.get(API_ENDPOINTS.SCORE.MY_RED_ALERTS);
        return response.data;
    }
    async getScoreHistory(kpiId, userId) {
        const response = await api.get(API_ENDPOINTS.SCORE.LIST, {
            params: { kpi: kpiId, user: userId, ordering: '-year,-month' }
        });
        return response.data;
    }
}
export default new ScoreService();