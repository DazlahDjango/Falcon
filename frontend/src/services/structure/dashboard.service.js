import { BaseStructureService, withRetry } from './base.service';
import { DASHBOARD_ENDPOINTS } from '../../config/constants/structureApiConstants';

class StructureDashboardService extends BaseStructureService {
  constructor() {
    super('dashboard');
  }

  async getOverview() {
    const res = await withRetry(() => this.apiClient.get(DASHBOARD_ENDPOINTS.OVERVIEW));
    return this.unwrap(res);
  }

  async getHierarchyHealth() {
    const res = await withRetry(() => this.apiClient.get(DASHBOARD_ENDPOINTS.HIERARCHY_HEALTH));
    return this.unwrap(res);
  }

  async getTrends(months = 6) {
    const res = await withRetry(() => this.apiClient.get(DASHBOARD_ENDPOINTS.TRENDS, { 
      params: { [DASHBOARD_ENDPOINTS.QUERY_PARAMS.MONTHS]: months } 
    }));
    return this.unwrap(res);
  }

  async getAllDashboardData(months = 6) {
    const [overview, health, trends] = await Promise.all([
      this.getOverview(),
      this.getHierarchyHealth(),
      this.getTrends(months)
    ]);
    return { 
      overview: this.unwrap(overview), 
      health: this.unwrap(health), 
      trends: this.unwrap(trends) 
    };
  }
}

export const structureDashboardService = new StructureDashboardService();
export { StructureDashboardService };