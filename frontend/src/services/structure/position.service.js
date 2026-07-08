import { BaseStructureService, withRetry } from './base.service';
import { POSITION_ENDPOINTS } from '../../config/constants/structureApiConstants';

class PositionService extends BaseStructureService {
  constructor() {
    super('positions');
  }

  async getByCode(jobCode) {
    if (!jobCode) throw new Error('Job code is required');
    return withRetry(() => this.apiClient.get(POSITION_ENDPOINTS.BY_CODE(jobCode)));
  }

  async getVacant() {
    return withRetry(() => this.apiClient.get(POSITION_ENDPOINTS.VACANT));
  }

  async getStats() {
    return withRetry(() => this.apiClient.get(POSITION_ENDPOINTS.STATS));
  }

  async getIncumbents(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(POSITION_ENDPOINTS.INCUMBENTS(id)));
  }

  async getReportingChain(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(POSITION_ENDPOINTS.REPORTING_CHAIN(id)));
  }

  async getReports(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(POSITION_ENDPOINTS.REPORTS(id)));
  }
}

export const positionService = new PositionService();
export { PositionService };