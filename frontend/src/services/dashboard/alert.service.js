import { BaseDashboardService } from './dashboard.service';

class DashboardAlertService extends BaseDashboardService {
  constructor() {
    super('alerts');
  }

  async getAlerts(filters = {}) {
    return this.withRetry(() => this.apiClient.get('/alerts', { params: filters }));
  }

  async getAlertById(alertId) {
    if (!alertId) throw new Error('Alert ID is required');
    return this.withRetry(() => this.apiClient.get(`/alerts/${alertId}`));
  }

  async createAlert(alertData) {
    if (!alertData) throw new Error('Alert data is required');
    return this.withRetry(() => this.apiClient.post('/alerts', alertData));
  }

  async updateAlert(alertId, alertData) {
    if (!alertId) throw new Error('Alert ID is required');
    if (!alertData) throw new Error('Alert data is required');
    return this.withRetry(() => this.apiClient.patch(`/alerts/${alertId}`, alertData));
  }

  async deleteAlert(alertId) {
    if (!alertId) throw new Error('Alert ID is required');
    return this.withRetry(() => this.apiClient.delete(`/alerts/${alertId}`));
  }

  async suppressAlert(alertId, durationMinutes = 60) {
    if (!alertId) throw new Error('Alert ID is required');
    return this.withRetry(() => this.apiClient.post(`/alerts/${alertId}/suppress`, { duration_minutes: durationMinutes }));
  }

  async triggerAlert(alertId) {
    if (!alertId) throw new Error('Alert ID is required');
    return this.withRetry(() => this.apiClient.post(`/alerts/${alertId}/trigger`));
  }
}

export const dashboardAlertService = new DashboardAlertService();