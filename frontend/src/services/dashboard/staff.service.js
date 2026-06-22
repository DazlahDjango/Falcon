// frontend/src/services/dashboard/staff.service.js

import { BaseDashboardService } from './dashboard.service';
import { DASHBOARD_API } from '../../config/constants/dashboardApiConstants';

class StaffService extends BaseDashboardService {
  constructor() {
    super('staff');
  }

  /**
   * Get staff dashboard data
   * @param {Object} params - Query parameters
   * @param {string} params.period - Period (current, monthly, quarterly, yearly)
   */
  async getDashboardData(params = {}) {
    const { period = 'current' } = params;
    const queryParams = new URLSearchParams();
    
    if (period) queryParams.append('period', period);
    
    const url = `${DASHBOARD_API.STAFF.BASE}${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.apiClient.get(url);
  }

  /**
   * Get staff's KPIs with performance data
   * @param {string} period - Period
   */
  async getMyKPIs(period = 'current') {
    return this.apiClient.get(`${DASHBOARD_API.STAFF.BASE}/kpis?period=${period}`);
  }

  /**
   * Get pending submissions awaiting approval
   */
  async getPendingSubmissions() {
    return this.apiClient.get(DASHBOARD_API.STAFF.PENDING_SUBMISSIONS);
  }

  /**
   * Submit KPI actual data for approval
   * @param {Object} data - Submission data
   * @param {string} data.kpiId - KPI ID
   * @param {number} data.value - Actual value
   * @param {string} data.comments - Optional comments
   */
  async submitKPI(data) {
    return this.apiClient.post(DASHBOARD_API.STAFF.SUBMIT_KPI, {
      kpi_id: data.kpiId,
      value: data.value,
      comments: data.comments || ''
    });
  }

  /**
   * Get mission status report
   * @param {string} period - Period
   */
  async getMissionStatus(period = 'current') {
    return this.apiClient.get(`${DASHBOARD_API.STAFF.MISSION_STATUS}?period=${period}`);
  }

  /**
   * Update mission status report
   * @param {Object} data - Mission status data
   */
  async updateMissionStatus(data) {
    return this.apiClient.put(DASHBOARD_API.STAFF.MISSION_STATUS, data);
  }

  /**
   * Get pending tasks for staff
   */
  async getPendingTasks() {
    return this.apiClient.get(DASHBOARD_API.STAFF.TASKS);
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboard() {
    return this.apiClient.post(DASHBOARD_API.STAFF.REFRESH);
  }

  async exportDashboard(params = {}) {
    const { period = 'current', format = 'pdf' } = params;
    try {
      const response = await this.apiClient.post(
        DASHBOARD_API.STAFF.EXPORT,
        { period, format },
        { responseType: 'blob' }
      );
      return response.data || response;
    } catch (error) {
      console.error('Failed to export dashboard:', error);
      throw error;
    }
  }
}

export const staffService = new StaffService();
