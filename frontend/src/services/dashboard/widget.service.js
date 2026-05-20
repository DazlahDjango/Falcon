import { BaseDashboardService } from './dashboard.service';

class WidgetService extends BaseDashboardService {
  constructor() {
    super('widgets');
  }

  async getWidgets() {
    return this.withRetry(() => this.apiClient.get('/widgets'));
  }

  async getWidgetById(widgetId) {
    if (!widgetId) throw new Error('Widget ID is required');
    return this.withRetry(() => this.apiClient.get(`/widgets/${widgetId}`));
  }

  async getWidgetsByDashboard(dashboardId) {
    if (!dashboardId) throw new Error('Dashboard ID is required');
    return this.withRetry(() => this.apiClient.get(`/widgets/by-dashboard/${dashboardId}`));
  }

  async createWidget(widgetData) {
    if (!widgetData) throw new Error('Widget data is required');
    return this.withRetry(() => this.apiClient.post('/widgets', widgetData));
  }

  async updateWidget(widgetId, widgetData) {
    if (!widgetId) throw new Error('Widget ID is required');
    if (!widgetData) throw new Error('Widget data is required');
    return this.withRetry(() => this.apiClient.patch(`/widgets/${widgetId}`, widgetData));
  }

  async deleteWidget(widgetId) {
    if (!widgetId) throw new Error('Widget ID is required');
    return this.withRetry(() => this.apiClient.delete(`/widgets/${widgetId}`));
  }

  async bulkUpdatePositions(updates) {
    if (!updates || !updates.length) throw new Error('Updates are required');
    return this.withRetry(() => this.apiClient.post('/widgets/bulk-position', updates));
  }
}

export const widgetService = new WidgetService();