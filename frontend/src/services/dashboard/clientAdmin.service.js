import { BaseDashboardService } from './dashboard.service';

class ClientAdminDashboardService extends BaseDashboardService {
  constructor() {
    super('client-admin');
  }

  async getDashboardData() {
    return this.withRetry(() => this.apiClient.get('/client-admin/data'));
  }

  async getComplianceStatus() {
    return this.withRetry(() => this.apiClient.get('/client-admin/compliance'));
  }

  async getPendingApprovals(page = 1, pageSize = 20) {
    return this.withRetry(() => this.apiClient.get('/client-admin/pending-approvals', {
      params: { page, page_size: pageSize }
    }));
  }

  async approveSubmission(submissionId, comments = '') {
    if (!submissionId) throw new Error('Submission ID is required');
    return this.withRetry(() => this.apiClient.post(`/client-admin/approvals/${submissionId}/approve`, { comments }));
  }

  async rejectSubmission(submissionId, reason = '') {
    if (!submissionId) throw new Error('Submission ID is required');
    return this.withRetry(() => this.apiClient.post(`/client-admin/approvals/${submissionId}/reject`, { reason }));
  }

  async getMissingDataAlerts() {
    return this.withRetry(() => this.apiClient.get('/client-admin/missing-data'));
  }

  async getUserActivity(days = 30) {
    return this.withRetry(() => this.apiClient.get('/client-admin/user-activity', {
      params: { days }
    }));
  }

  async getKpiBreakdown() {
    return this.withRetry(() => this.apiClient.get('/client-admin/kpi-breakdown'));
  }

  async getTenantSettings() {
    return this.withRetry(() => this.apiClient.get('/client-admin/settings'));
  }

  async updateTenantSettings(settings) {
    if (!settings) throw new Error('Settings are required');
    return this.withRetry(() => this.apiClient.patch('/client-admin/settings', settings));
  }

  async getUsersList(filters = {}) {
    return this.withRetry(() => this.apiClient.get('/client-admin/users', { params: filters }));
  }

  async getUserDetails(userId) {
    if (!userId) throw new Error('User ID is required');
    return this.withRetry(() => this.apiClient.get(`/client-admin/users/${userId}`));
  }

  async refreshDashboard() {
    return this.withRetry(() => this.apiClient.post('/client-admin/refresh'));
  }
}

export const clientAdminDashboardService = new ClientAdminDashboardService();