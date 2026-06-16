// src/services/reviews/report.service.js
// Reports API service

import { reviewsApiClient } from '../api';

class ReviewsReportService {
  async getEmployeeSummary(employeeId, cycleId) {
    const response = await reviewsApiClient.post('/reports/employee-summary/', {
      employee_id: employeeId,
      cycle_id: cycleId,
    });
    return response.data;
  }

  async getTeamSummary(managerId, cycleId) {
    const response = await reviewsApiClient.post('/reports/team-summary/', {
      manager_id: managerId,
      cycle_id: cycleId,
    });
    return response.data;
  }

  async getCycleStats(cycleId) {
    const response = await reviewsApiClient.get('/reports/cycle-stats/', {
      params: { cycle_id: cycleId },
    });
    return response.data;
  }

  async getPIPSummary() {
    const response = await reviewsApiClient.get('/reports/pip-summary/');
    return response.data;
  }

  async getCalibrationSummary(cycleId) {
    const response = await reviewsApiClient.post('/reports/calibration-summary/', {
      cycle_id: cycleId,
    });
    return response.data;
  }

  async getRatingDistribution(cycleId) {
    const response = await reviewsApiClient.get('/reports/rating-distribution/', {
      params: { cycle_id: cycleId },
    });
    return response.data;
  }

  async exportReport(reportType, cycleId, format = 'csv') {
    const response = await reviewsApiClient.post('/reports/export/', {
      report_type: reportType,
      cycle_id: cycleId,
      format,
    });
    return response.data;
  }
}

export const reviewsReportService = new ReviewsReportService();
export default reviewsReportService;