import { ReportBaseService, withRetry } from './reportBase.service';
import { DASHBOARD_ENDPOINTS } from '../../config/constants/reportApiConstants';

class DashboardService extends ReportBaseService {
    constructor() {
        super('dashboards');
    }

    async getDashboards(params = {}) {
        return withRetry(async () => {
            const response = await this.apiClient.get(DASHBOARD_ENDPOINTS.LIST, { params });
            return response;
        });
    }

    async getDashboard(id) {
        if (!id) throw new Error('Dashboard ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.get(DASHBOARD_ENDPOINTS.DETAIL(id));
            return response;
        });
    }

    async createDashboard(data) {
        if (!data) throw new Error('Dashboard data is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(DASHBOARD_ENDPOINTS.CREATE, data);
            return response;
        });
    }

    async updateDashboard(id, data) {
        if (!id) throw new Error('Dashboard ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.patch(DASHBOARD_ENDPOINTS.UPDATE(id), data);
            return response;
        });
    }

    async deleteDashboard(id) {
        if (!id) throw new Error('Dashboard ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.delete(DASHBOARD_ENDPOINTS.DELETE(id));
            return response;
        });
    }

    async performAction(id, action, data = {}) {
        if (!id) throw new Error('Dashboard ID is required');
        if (!action) throw new Error('Action is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(DASHBOARD_ENDPOINTS.ACTION(id), { action, ...data });
            return response;
        });
    }

    async updateLayout(id, layout) {
        if (!id) throw new Error('Dashboard ID is required');
        if (!layout) throw new Error('Layout data is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(DASHBOARD_ENDPOINTS.LAYOUT(id), { layout });
            return response;
        });
    }

    async refreshDashboard(id) {
        if (!id) throw new Error('Dashboard ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(DASHBOARD_ENDPOINTS.REFRESH(id));
            return response;
        });
    }

    async recordView(id) {
        if (!id) throw new Error('Dashboard ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(DASHBOARD_ENDPOINTS.RECORD_VIEW(id));
            return response;
        });
    }

    async getMyDashboards(params = {}) {
        return withRetry(async () => {
            const response = await this.apiClient.get(DASHBOARD_ENDPOINTS.MY_DASHBOARDS, { params });
            return response;
        });
    }

    async getDefaultDashboard() {
        return withRetry(async () => {
            const response = await this.apiClient.get(DASHBOARD_ENDPOINTS.DEFAULT);
            return response;
        });
    }

    async getDashboardTypes() {
        return withRetry(async () => {
            const response = await this.apiClient.get(DASHBOARD_ENDPOINTS.TYPES);
            return response;
        });
    }
}

export const dashboardService = new DashboardService();
