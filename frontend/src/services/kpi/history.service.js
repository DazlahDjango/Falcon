import { BaseKPIService, withRetry } from './kpiBase.service';
import { HISTORY_ENDPOINTS } from '../api/endpoints';

class HistoryService extends BaseKPIService {
  constructor() {
    super('history');
  }

  // ============ KPI History ============
  async getKPIHistory(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(HISTORY_ENDPOINTS.KPI, { params });
      return response;
    });
  }

  async getKPIHistoryForKPI(kpiId, params = {}) {
    if (!kpiId) throw new Error('KPI ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(HISTORY_ENDPOINTS.FOR_KPI(kpiId), { params });
      return response;
    });
  }

  // ============ Actual History ============
  async getActualHistory(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(HISTORY_ENDPOINTS.ACTUAL, { params });
      return response;
    });
  }

  async getActualHistoryForActual(actualId, params = {}) {
    if (!actualId) throw new Error('Actual ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(HISTORY_ENDPOINTS.FOR_ACTUAL(actualId), { params });
      return response;
    });
  }

  // ============ Target History ============
  async getTargetHistory(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(HISTORY_ENDPOINTS.TARGET, { params });
      return response;
    });
  }

  async getTargetHistoryForTarget(targetId, params = {}) {
    if (!targetId) throw new Error('Target ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(HISTORY_ENDPOINTS.FOR_TARGET(targetId), { params });
      return response;
    });
  }
}

export const historyService = new HistoryService();