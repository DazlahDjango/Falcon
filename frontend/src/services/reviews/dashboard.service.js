// src/services/reviews/dashboard.service.js
// Reviews Dashboard API service

import { reviewsApiClient } from '../api';

class ReviewsDashboardService {
  _validateDashboardResponse(response, dashboardName) {
    if (!response || response.data == null || typeof response.data !== 'object') {
      throw new Error(`Invalid ${dashboardName} dashboard response from server`);
    }
    return response.data;
  }

  async getStaffDashboard() {
    const response = await reviewsApiClient.get('/dashboard/staff/');
    return this._validateDashboardResponse(response, 'staff');
  }

  async getSupervisorDashboard() {
    const response = await reviewsApiClient.get('/dashboard/supervisor/');
    return this._validateDashboardResponse(response, 'supervisor');
  }

  async getExecutiveDashboard(departmentId = null) {
    const params = departmentId ? { department_id: departmentId } : {};
    const response = await reviewsApiClient.get('/dashboard/executive/', { params });
    return this._validateDashboardResponse(response, 'executive');
  }

  async getAdminDashboard() {
    const response = await reviewsApiClient.get('/dashboard/admin/');
    return this._validateDashboardResponse(response, 'admin');
  }

  async getMetrics() {
    const response = await reviewsApiClient.get('/dashboard/metrics/');
    return this._validateDashboardResponse(response, 'metrics');
  }
}

export const reviewsDashboardService = new ReviewsDashboardService();
export default reviewsDashboardService;