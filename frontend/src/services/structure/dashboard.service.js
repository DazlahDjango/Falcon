import { BaseStructureService } from './base.service';

class DashboardService extends BaseStructureService {
  constructor() {
    super('dashboard');  // This creates /api/v1/structure/dashboard/
  }
  
  async getOverview() {
    return this.apiClient.get('/dashboard/overview/');
  }
  
  async getHierarchyHealth() {
    return this.apiClient.get('/dashboard/hierarchy-health/');
  }
  
  async getTrends(months = 6) {
    return this.apiClient.get('/dashboard/trends/', { params: { months } });
  }
  
  async getMetrics() {
    // Alias for getOverview() to maintain compatibility
    return this.getOverview();
  }
}

export const dashboardService = new DashboardService();