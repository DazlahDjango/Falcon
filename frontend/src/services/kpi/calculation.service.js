import { BaseKPIService, withRetry } from './kpiBase.service';
import { CALCULATION_ENDPOINTS } from '../api/endpoints';

class CalculationService extends BaseKPIService {
  constructor() {
    super('calculations');
  }

  async triggerCalculation(year, month, force = false, userIds = null) {
    if (!year) throw new Error('Year is required');
    if (!month) throw new Error('Month is required');
    
    return withRetry(async () => {
      const response = await this.apiClient.post(CALCULATION_ENDPOINTS.TRIGGER, {
        year,
        month,
        force,
        user_ids: userIds,
      });
      return response;
    });
  }

  async getCalculationStatus(taskId) {
    if (!taskId) throw new Error('Task ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(CALCULATION_ENDPOINTS.STATUS(taskId));
      return response;
    });
  }

  async checkCalculationStatus(year, month) {
    return withRetry(async () => {
      const response = await this.apiClient.get(CALCULATION_ENDPOINTS.TRIGGER, {
        params: { year, month },
      });
      return response;
    });
  }
}

export const calculationService = new CalculationService();