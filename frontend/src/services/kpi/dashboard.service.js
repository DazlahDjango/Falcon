import { BaseKPIService, withRetry } from './kpiBase.service';
import { DASHBOARD_ENDPOINTS } from '../api/endpoints';

class DashboardService extends BaseKPIService {
  constructor() {
    super('dashboard');
  }

  async getIndividualDashboard(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(DASHBOARD_ENDPOINTS.INDIVIDUAL, { params });
      return response;
    });
  }

  async getManagerDashboard(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(DASHBOARD_ENDPOINTS.MANAGER, { params });
      return response;
    });
  }

  async getExecutiveDashboard(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(DASHBOARD_ENDPOINTS.EXECUTIVE, { params });
      return response;
    });
  }

  async getChampionDashboard(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(DASHBOARD_ENDPOINTS.CHAMPION, { params });
      return response;
    });
  }

  async getAdminOverview(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(DASHBOARD_ENDPOINTS.ADMIN_OVERVIEW, { params });
      return response;
    });
  }
}

export const dashboardService = new DashboardService();