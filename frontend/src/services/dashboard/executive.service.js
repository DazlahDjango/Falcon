import { BaseDashboardService } from './dashboard.service';
import { DASHBOARD_API } from '../../config/constants/dashboardApiConstants';

class ExecutiveDashboardService extends BaseDashboardService {
  constructor() {
    super('executive');
  }

  async getDashboardData(userId = null, filters = {}) {
    const params = { ...filters };
    if (userId) params.user_id = userId;
    return this.withRetry(() => this.apiClient.get('/executive/data', { params }));
  }

  async getDepartments() {
    return this.withRetry(() => this.apiClient.get('/executive/departments'));
  }

  async getDepartmentDetails(departmentId) {
    if (!departmentId) throw new Error('Department ID is required');
    return this.withRetry(() => this.apiClient.get(`/executive/departments/${departmentId}`));
  }

  async getTrends() {
    return this.withRetry(() => this.apiClient.get('/executive/trends'));
  }

  async getTopIssues() {
    return this.withRetry(() => this.apiClient.get('/executive/issues'));
  }

  async refreshDashboard() {
    return this.withRetry(() => this.apiClient.post('/executive/refresh'));
  }

  async exportDashboard(params = {}) {
    const { period = 'current', format = 'pdf' } = params;
    try {
      const response = await this.apiClient.post(
        DASHBOARD_API.EXECUTIVE.EXPORT,
        { period, format },
        { responseType: 'blob' }
      );
      return response.data || response;
    } catch (error) {
      console.error('Failed to export dashboard:', error);
      throw error;
    }
  }

  async getKpiTrends(kpiId, period = 'monthly') {
    if (!kpiId) throw new Error('KPI ID is required');
    return this.withRetry(() => this.apiClient.get(`/executive/kpis/${kpiId}/trends`, { params: { period } }));
  }
}

export const executiveDashboardService = new ExecutiveDashboardService();