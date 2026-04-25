import api from '../api';
import { API_ENDPOINTS } from '../api/endpoints';

class DashboardService {
    async getIndividualDashboard(year = null, month = null) {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.get(API_ENDPOINTS.DASHBOARD.INDIVIDUAL, { params });
        return response.data;
    }
    async getManagerDashboard(year = null, month = null) {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.get(API_ENDPOINTS.DASHBOARD.MANAGER, { params });
        return response.data;
    }
    async getExecutiveDashboard(year = null, month = null) {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.get(API_ENDPOINTS.DASHBOARD.EXECUTIVE, { params });
        return response.data;
    }
    async getChampionDashboard(year = null, month = null) {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.get(API_ENDPOINTS.DASHBOARD.CHAMPION, { params });
        return response.data;
    }
    async refreshDashboard(dashboardType, year = null, month = null) {
        const params = { dashboard_type: dashboardType };
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.post('/dashboard/refresh/', params);
        return response.data;
    }
}
export default new DashboardService();