import { BaseStructureService, withRetry } from './base.service';
import { COST_CENTER_ENDPOINTS } from '../../config/constants/structureApiConstants';

class CostCenterService extends BaseStructureService {
  constructor() {
    super('cost-centers');
  }

  async getByCode(code) {
    if (!code) throw new Error('Cost center code is required');
    const response = await withRetry(() => this.apiClient.get(COST_CENTER_ENDPOINTS.BY_CODE(code)));
    return this.unwrap(response);
  }

  async getByFiscalYear(year) {
    if (!year) throw new Error('Fiscal year is required');
    const response = await withRetry(() => this.apiClient.get(COST_CENTER_ENDPOINTS.BY_FISCAL_YEAR(year)));
    return this.unwrap(response);
  }

  async getByOrgUnit(orgUnitId) {
    if (!orgUnitId) throw new Error('Organization unit ID is required');
    const response = await withRetry(() => this.apiClient.get(COST_CENTER_ENDPOINTS.BY_ORG_UNIT(orgUnitId)));
    return this.unwrap(response);
  }

  async getByLevel(level) {
    if (!level) throw new Error('Level is required');
    const response = await withRetry(() => this.apiClient.get(COST_CENTER_ENDPOINTS.BY_LEVEL(level)));
    return this.unwrap(response);
  }

  async getStats() {
    const response = await withRetry(() => this.apiClient.get(COST_CENTER_ENDPOINTS.STATS));
    return this.unwrap(response);
  }

  async getChildren(id) {
    if (!id) throw new Error('ID is required');
    const response = await withRetry(() => this.apiClient.get(COST_CENTER_ENDPOINTS.CHILDREN(id)));
    return this.unwrap(response);
  }

  async getUtilization(id) {
    if (!id) throw new Error('ID is required');
    const response = await withRetry(() => this.apiClient.get(COST_CENTER_ENDPOINTS.UTILIZATION(id)));
    return this.unwrap(response);
  }
}

export const costCenterService = new CostCenterService();
export { CostCenterService };
