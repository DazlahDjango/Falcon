import { BaseStructureService, withRetry } from './base.service';

export class PositionService extends BaseStructureService {
  constructor() {
    super('positions');
  }

  async getByCode(jobCode) {
    if (!jobCode) throw new Error('Job code is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/positions/by-code/${jobCode}/`);
      return response;
    });
  }

  async getVacant(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get('/positions/vacant/', { params });
      return response;
    });
  }

  async getIncumbents(id) {
    if (!id) throw new Error('Position ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(this.getEndpoint(`${id}/incumbents/`));
      return response;
    });
  }

  async getReportingChain(id) {
    if (!id) throw new Error('Position ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/positions/reporting-chain/${id}/`);
      return response;
    });
  }

  async getByLevelRange(minLevel, maxLevel, params = {}) {
    if (minLevel === undefined || maxLevel === undefined) {
      throw new Error('Min and max levels are required');
    }
    return withRetry(async () => {
      const response = await this.apiClient.get('/positions/', {
        params: { level_gte: minLevel, level_lte: maxLevel, ...params },
      });
      return response;
    });
  }

  async getByGrade(grade, params = {}) {
    if (!grade) throw new Error('Grade is required');
    return withRetry(async () => {
      const response = await this.apiClient.get('/positions/', {
        params: { grade, ...params },
      });
      return response;
    });
  }

  async validate(data) {
    if (!data) throw new Error('Data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/positions/validate/', data);
      return response;
    });
  }

  async getDirectReports(positionId) {
    if (!positionId) throw new Error('Position ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get('/positions/', {
        params: { reports_to_id: positionId },
      });
      return response;
    });
  }
}

export const positionService = new PositionService();