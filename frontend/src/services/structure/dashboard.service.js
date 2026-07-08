import { BaseStructureService, withRetry } from './base.service';
import { DASHBOARD_ENDPOINTS } from '../../config/constants/structureApiConstants';

class StructureDashboardService extends BaseStructureService {
  constructor() {
    super('dashboard');
  }

  async getOverview() {
    return withRetry(() => this.apiClient.get(DASHBOARD_ENDPOINTS.OVERVIEW));
  }

  async getHierarchyHealth() {
    return withRetry(() => this.apiClient.get(DASHBOARD_ENDPOINTS.HIERARCHY_HEALTH));
  }

  async getTrends(months = 6) {
    return withRetry(() => this.apiClient.get(DASHBOARD_ENDPOINTS.TRENDS, { 
      params: { [DASHBOARD_ENDPOINTS.QUERY_PARAMS.MONTHS]: months } 
    }));
  }

  async getAllDashboardData(months = 6) {
    const [overview, health, trends] = await Promise.all([
      this.getOverview(),
      this.getHierarchyHealth(),
      this.getTrends(months)
    ]);
    return { overview: overview.data, health: health.data, trends: trends.data };
  }
}

export const structureDashboardService = new StructureDashboardService();
export { StructureDashboardService };