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

  async getTrends(months) {
    return withRetry(() => this.apiClient.get(DASHBOARD_ENDPOINTS.TRENDS, { params: { months } }));
  }

  async getAllDashboardData(months) {
    const [overview, health, trends] = await Promise.all([
      this.getOverview(),
      this.getHierarchyHealth(),
      this.getTrends(months)
    ]);
    return { overview, health, trends };
  }
}

export const structureDashboardService = new StructureDashboardService();
export { StructureDashboardService };