import { ReportBaseService, withRetry } from './reportBase.service';
import { WIDGET_ENDPOINTS } from '../../config/constants/reportApiConstants';

class WidgetService extends ReportBaseService {
    constructor() {
        super('widgets');
    }

    async getWidgets(params = {}) {
        return withRetry(async () => {
            const response = await this.apiClient.get(WIDGET_ENDPOINTS.LIST, { params });
            return response;
        });
    }

    async getWidget(id) {
        if (!id) throw new Error('Widget ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.get(WIDGET_ENDPOINTS.DETAIL(id));
            return response;
        });
    }

    async createWidget(data) {
        if (!data) throw new Error('Widget data is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(WIDGET_ENDPOINTS.CREATE, data);
            return response;
        });
    }

    async updateWidget(id, data) {
        if (!id) throw new Error('Widget ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.patch(WIDGET_ENDPOINTS.UPDATE(id), data);
            return response;
        });
    }

    async deleteWidget(id) {
        if (!id) throw new Error('Widget ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.delete(WIDGET_ENDPOINTS.DELETE(id));
            return response;
        });
    }

    async getWidgetData(id) {
        if (!id) throw new Error('Widget ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.get(WIDGET_ENDPOINTS.DATA(id));
            return response;
        });
    }

    async performAction(id, action) {
        if (!id) throw new Error('Widget ID is required');
        if (!action) throw new Error('Action is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(WIDGET_ENDPOINTS.ACTION(id), { action });
            return response;
        });
    }

    async refreshWidget(id) {
        if (!id) throw new Error('Widget ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(WIDGET_ENDPOINTS.REFRESH(id));
            return response;
        });
    }

    async getWidgetTypes() {
        return withRetry(async () => {
            const response = await this.apiClient.get(WIDGET_ENDPOINTS.TYPES);
            return response;
        });
    }

    async getWidgetsByDashboard(dashboardId) {
        if (!dashboardId) throw new Error('Dashboard ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.get(WIDGET_ENDPOINTS.BY_DASHBOARD(dashboardId));
            return response;
        });
    }
}

export const widgetService = new WidgetService();
