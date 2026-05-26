// frontend/src/services/dashboard/readOnly.service.js

import { BaseDashboardService } from './dashboard.service';
import { DASHBOARD_API } from '../../config/constants/dashboardApiConstants';

class ReadOnlyService extends BaseDashboardService {
  constructor() {
    super('read-only');
  }

  /**
   * Get read-only dashboard data
   * @param {Object} params - Query parameters
   * @param {string} params.period - Period
   * @param {string} params.viewType - View type (executive, manager, staff)
   */
  async getDashboardData(params = {}) {
    const { period = 'current', viewType = 'executive' } = params;
    const queryParams = new URLSearchParams();
    
    if (period) queryParams.append('period', period);
    if (viewType) queryParams.append('view_type', viewType);
    
    const url = `${DASHBOARD_API.READ_ONLY.BASE}${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.apiClient.get(url);
  }

  /**
   * Get executive view (read-only)
   * @param {string} period - Period
   */
  async getExecutiveView(period = 'current') {
    return this.getDashboardData({ period, viewType: 'executive' });
  }

  /**
   * Get manager view (read-only)
   * @param {string} period - Period
   */
  async getManagerView(period = 'current') {
    return this.getDashboardData({ period, viewType: 'manager' });
  }

  /**
   * Get staff view (read-only)
   * @param {string} period - Period
   */
  async getStaffView(period = 'current') {
    return this.getDashboardData({ period, viewType: 'staff' });
  }

  /**
   * Export dashboard data
   * @param {Object} params - Export parameters
   * @param {string} params.period - Period
   * @param {string} params.viewType - View type
   * @param {string} params.format - Export format (pdf, excel, csv)
   */
  async exportDashboard(params = {}) {
    const { period = 'current', viewType = 'executive', format = 'pdf' } = params;
    return this.apiClient.get(DASHBOARD_API.READ_ONLY.EXPORT, {
      params: { period, view_type: viewType, format },
      responseType: 'blob'
    });
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboard() {
    return this.apiClient.post(DASHBOARD_API.READ_ONLY.REFRESH);
  }
}

export const readOnlyService = new ReadOnlyService();
export default readOnlyService;