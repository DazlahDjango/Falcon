import { BaseStructureService, withRetry } from './base.service';

export class CostCenterService extends BaseStructureService {
  constructor() {
    super('cost-centers');
  }

  async getByCode(code) {
    if (!code) throw new Error('Cost center code is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/cost-centers/by-code/${code}/`);
      return response;
    });
  }

  async getByFiscalYear(year) {
    if (!year) throw new Error('Fiscal year is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/cost-centers/by-fiscal-year/${year}/`);
      return response;
    });
  }

  async getChildren(id) {
    if (!id) throw new Error('Cost center ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(this.getEndpoint(`${id}/children/`));
      return response;
    });
  }
  
  async getTree(includeInactive = false) {
    return withRetry(async () => {
      const response = await this.apiClient.get('/cost-centers/tree/', {
        params: { include_inactive: includeInactive },
      });
      return response;
    });
  }
  
  async getBudgetUtilization(id) {
    if (!id) throw new Error('Cost center ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(this.getEndpoint(`${id}/budget-utilization/`));
      return response;
    });
  }

  async validate(data) {
    if (!data) throw new Error('Data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/cost-centers/validate/', data);
      return response;
    });
  }
}

export const costCenterService = new CostCenterService();