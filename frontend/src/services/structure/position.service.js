import { BaseStructureService, withRetry } from './base.service';
import { POSITION_ENDPOINTS } from '../../config/constants/structureApiConstants';

class PositionService extends BaseStructureService {
  constructor() {
    super('positions');
  }

  async getByCode(jobCode) {
    if (!jobCode) throw new Error('Job code is required');
    const response = await withRetry(() => this.apiClient.get(POSITION_ENDPOINTS.BY_CODE(jobCode)));
    return this.unwrap(response);
  }

  async getVacant() {
    const response = await withRetry(() => this.apiClient.get(POSITION_ENDPOINTS.VACANT));
    return this.unwrap(response);
  }

  async getStats() {
    const response = await withRetry(() => this.apiClient.get(POSITION_ENDPOINTS.STATS));
    return this.unwrap(response);
  }

  async getIncumbents(id) {
    if (!id) throw new Error('ID is required');
    const response = await withRetry(() => this.apiClient.get(POSITION_ENDPOINTS.INCUMBENTS(id)));
    return this.unwrap(response);
  }

  async getReportingChain(id) {
    if (!id) throw new Error('ID is required');
    const response = await withRetry(() => this.apiClient.get(POSITION_ENDPOINTS.REPORTING_CHAIN(id)));
    return this.unwrap(response);
  }

  async getReports(id) {
    if (!id) throw new Error('ID is required');
    const response = await withRetry(() => this.apiClient.get(POSITION_ENDPOINTS.REPORTS(id)));
    return this.unwrap(response);
  }
}

export const positionService = new PositionService();
export { PositionService };