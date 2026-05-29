import { BaseDashboardService } from './dashboard.service';
import { DASHBOARD_API } from '../../config/constants/dashboardApiConstants';

class SuperAdminDashboardService extends BaseDashboardService {
  constructor() {
    super('super-admin');
  }

  async getDashboardData() {
    return this.withRetry(() => this.apiClient.get('/super-admin/data'));
  }

  async getTenantsList(filters = {}) {
    return this.withRetry(() => this.apiClient.get('/super-admin/tenants', { params: filters }));
  }

  async getTenantDetails(tenantId) {
    if (!tenantId) throw new Error('Tenant ID is required');
    return this.withRetry(() => this.apiClient.get(`/super-admin/tenants/${tenantId}`));
  }

  async refreshTenantSnapshot(tenantId) {
    if (!tenantId) throw new Error('Tenant ID is required');
    return this.withRetry(() => this.apiClient.post(`/super-admin/tenants/${tenantId}/refresh`));
  }

  async getSystemHealth() {
    return this.withRetry(() => this.apiClient.get('/super-admin/system-health'));
  }

  async getSubscriptionAlerts() {
    return this.withRetry(() => this.apiClient.get('/super-admin/subscription-alerts'));
  }

  async getPlatformMetrics() {
    return this.withRetry(() => this.apiClient.get('/super-admin/platform-metrics'));
  }

  async getBillingOverview() {
    return this.withRetry(() => this.apiClient.get('/super-admin/billing'));
  }

  async refreshDashboard() {
    return this.withRetry(() => this.apiClient.post('/super-admin/refresh'));
  }

  async exportDashboard(params = {}) {
    const { period = 'current', format = 'pdf' } = params;
    try {
      const response = await this.apiClient.post(
        DASHBOARD_API.SUPER_ADMIN.EXPORT,
        { period, format },
        { responseType: 'blob' }
      );
      return response.data || response;
    } catch (error) {
      console.error('Failed to export dashboard:', error);
      throw error;
    }
  }

  async getAuditLogs(filters = {}) {
    return this.withRetry(() => this.apiClient.get('/super-admin/audit-logs', { params: filters }));
  }
}

export const superAdminDashboardService = new SuperAdminDashboardService();