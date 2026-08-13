import { BaseTenantService } from './tenantBase.service';
import { DASHBOARD_ENDPOINTS } from '../../config/constants/tenantApiConstants';

class DashboardService extends BaseTenantService {
  constructor() {
    super('dashboard');
  }

  async getSuperAdminDashboard() {
    return this.withRetry(() =>
      this.apiClient.get(DASHBOARD_ENDPOINTS.SUPER_ADMIN)
    );
  }

  async getClientAdminDashboard() {
    return this.withRetry(() =>
      this.apiClient.get(DASHBOARD_ENDPOINTS.CLIENT_ADMIN)
    );
  }
}

export const dashboardService = new DashboardService();