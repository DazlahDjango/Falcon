/**
 * Export Service - Export KPIs, Scores, Reports
 */
import { BaseKPIService, withRetry } from './kpiBase.service';
import { EXPORT_ENDPOINTS } from '../api/endpoints';

class ExportService extends BaseKPIService {
  constructor() {
    super('export');
  }

  async exportKPIs(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(EXPORT_ENDPOINTS.KPIS, {
        params,
        responseType: 'blob',
      });
      return response;
    });
  }

  async exportScores(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(EXPORT_ENDPOINTS.SCORES, {
        params,
        responseType: 'blob',
      });
      return response;
    });
  }

  async exportReport(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(EXPORT_ENDPOINTS.REPORTS, {
        params,
        responseType: 'blob',
      });
      return response;
    });
  }

  async exportDepartmentReport(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(EXPORT_ENDPOINTS.DEPARTMENT_REPORT, {
        params,
        responseType: 'blob',
      });
      return response;
    });
  }

  async exportKPIDetail(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(EXPORT_ENDPOINTS.KPI_DETAIL, {
        params,
        responseType: 'blob',
      });
      return response;
    });
  }
}

export const exportService = new ExportService();