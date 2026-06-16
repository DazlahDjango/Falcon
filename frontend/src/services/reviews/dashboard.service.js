// src/services/reviews/dashboard.service.js
// Reviews Dashboard API service

import { reviewsApiClient } from '../api';

class ReviewsDashboardService {
  async getStaffDashboard() {
    const response = await reviewsApiClient.get('/dashboard/staff/');
    return response.data;
  }

  async getSupervisorDashboard() {
    const response = await reviewsApiClient.get('/dashboard/supervisor/');
    return response.data;
  }

  async getExecutiveDashboard(departmentId = null) {
    const params = departmentId ? { department_id: departmentId } : {};
    const response = await reviewsApiClient.get('/dashboard/executive/', { params });
    return response.data;
  }

  async getAdminDashboard() {
    const response = await reviewsApiClient.get('/dashboard/admin/');
    return response.data;
  }

  async getMetrics() {
    const response = await reviewsApiClient.get('/dashboard/metrics/');
    return response.data;
  }
}

export const reviewsDashboardService = new ReviewsDashboardService();
export default reviewsDashboardService;