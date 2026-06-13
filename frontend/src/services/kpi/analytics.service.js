import { BaseKPIService, withRetry } from './kpiBase.service';
import {
  KPI_SUMMARY_ENDPOINTS,
  DEPARTMENT_ROLLUP_ENDPOINTS,
  ORGANIZATION_HEALTH_ENDPOINTS,
  ANALYTICS_ENDPOINTS,
  CUSTOM_REPORT_ENDPOINTS,
} from '../api/endpoints';

class AnalyticsService extends BaseKPIService {
  constructor() {
    super('analytics');
  }

  // ============ KPI Summaries ============
  async getKPISummaries(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(KPI_SUMMARY_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async getKPISummaryBySector(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(KPI_SUMMARY_ENDPOINTS.BY_SECTOR, { params });
      return response;
    });
  }

  // ============ Department Rollups ============
  async getDepartmentRollups(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(DEPARTMENT_ROLLUP_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async getDepartmentRanking(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(DEPARTMENT_ROLLUP_ENDPOINTS.RANKING, { params });
      return response;
    });
  }

  // ============ Organization Health ============
  async getOrganizationHealth(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(ORGANIZATION_HEALTH_ENDPOINTS.CURRENT, { params });
      return response;
    });
  }

  async getOrganizationHealthHistory(months = 12) {
    return withRetry(async () => {
      const response = await this.apiClient.get(ORGANIZATION_HEALTH_ENDPOINTS.HISTORY, { params: { months } });
      return response;
    });
  }

  // ============ Analytics Insights ============
  async getInsights(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(ANALYTICS_ENDPOINTS.INSIGHTS, { params });
      return response;
    });
  }

  async getPredictions(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(ANALYTICS_ENDPOINTS.PREDICTIONS, { params });
      return response;
    });
  }

  async getHeatmap(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(ANALYTICS_ENDPOINTS.HEATMAP, { params });
      return response;
    });
  }

  async exportAnalytics(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(ANALYTICS_ENDPOINTS.EXPORT, { params });
      return response;
    });
  }

  // ============ Custom Reports ============
  async createCustomReport(reportType, format = 'pdf', filters = {}) {
    if (!reportType) throw new Error('Report type is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(CUSTOM_REPORT_ENDPOINTS.CREATE, {
        report_type: reportType,
        format,
        filters,
      });
      return response;
    });
  }

  async getReportStatus(taskId) {
    if (!taskId) throw new Error('Task ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(CUSTOM_REPORT_ENDPOINTS.STATUS(taskId));
      return response;
    });
  }
}

export const analyticsService = new AnalyticsService();