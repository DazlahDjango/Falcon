import { BaseStructureService, withRetry } from './base.service';
import { COST_CENTER_ENDPOINTS } from '../../config/constants/structureApiConstants';

class CostCenterService extends BaseStructureService {
  constructor() {
    super('cost-centers');
  }

  async getByCode(code) {
    if (!code) throw new Error('Cost center code is required');
    return withRetry(() => this.apiClient.get(COST_CENTER_ENDPOINTS.BY_CODE(code)));
  }

  async getByFiscalYear(year) {
    if (!year) throw new Error('Fiscal year is required');
    return withRetry(() => this.apiClient.get(COST_CENTER_ENDPOINTS.BY_FISCAL_YEAR(year)));
  }

  async getByOrgUnit(orgUnitId) {
    if (!orgUnitId) throw new Error('Organization unit ID is required');
    return withRetry(() => this.apiClient.get(COST_CENTER_ENDPOINTS.BY_ORG_UNIT(orgUnitId)));
  }

  async getByLevel(level) {
    if (!level) throw new Error('Level is required');
    return withRetry(() => this.apiClient.get(COST_CENTER_ENDPOINTS.BY_LEVEL(level)));
  }

  async getStats() {
    return withRetry(() => this.apiClient.get(COST_CENTER_ENDPOINTS.STATS));
  }

  async getChildren(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(COST_CENTER_ENDPOINTS.CHILDREN(id)));
  }

  async getUtilization(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(COST_CENTER_ENDPOINTS.UTILIZATION(id)));
  }
}

export const costCenterService = new CostCenterService();
export { CostCenterService };