import { BaseKPIService, withRetry } from './kpiBase.service';
import {
  TARGET_ENDPOINTS,
  MONTHLY_PHASING_ENDPOINTS,
  CASCADE_ENDPOINTS,
} from '../api/endpoints';

class TargetService extends BaseKPIService {
  constructor() {
    super('targets');
  }

  // ============ Annual Targets ============
  async getTargets(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(TARGET_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async getTarget(id) {
    if (!id) throw new Error('Target ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(TARGET_ENDPOINTS.DETAIL(id));
      return response;
    });
  }

  async createTarget(data) {
    if (!data) throw new Error('Target data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(TARGET_ENDPOINTS.CREATE, data);
      return response;
    });
  }

  async updateTarget(id, data) {
    if (!id) throw new Error('Target ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.patch(TARGET_ENDPOINTS.UPDATE(id), data);
      return response;
    });
  }

  async deleteTarget(id) {
    if (!id) throw new Error('Target ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.delete(TARGET_ENDPOINTS.DELETE(id));
      return response;
    });
  }

  async phaseTarget(id, strategy = 'equal_split', strategyParams = {}, overwrite = true) {
    if (!id) throw new Error('Target ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(TARGET_ENDPOINTS.PHASE(id), {
        strategy,
        strategy_params: strategyParams,
        overwrite,
      });
      return response;
    });
  }

  async bulkPhaseTargets(year, strategy = 'equal_split') {
    if (!year) throw new Error('Year is required for bulk phasing');
    return withRetry(async () => {
      const response = await this.apiClient.post(TARGET_ENDPOINTS.BULK_PHASE, {
        year,
        strategy,
      });
      return response;
    });
  }

  async getPhasing(id) {
    if (!id) throw new Error('Target ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(TARGET_ENDPOINTS.PHASING(id));
      return response;
    });
  }

  async validateTarget(id) {
    if (!id) throw new Error('Target ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(TARGET_ENDPOINTS.VALIDATE(id));
      return response;
    });
  }

  // ============ Monthly Phasing ============
  async getMonthlyPhasing(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(MONTHLY_PHASING_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async updateMonthlyPhasing(id, data) {
    if (!id) throw new Error('Phasing ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.patch(MONTHLY_PHASING_ENDPOINTS.UPDATE(id), data);
      return response;
    });
  }

  async bulkUpdateMonthlyPhasing(annualTargetId, months) {
    if (!annualTargetId) throw new Error('Annual Target ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(MONTHLY_PHASING_ENDPOINTS.BULK_UPDATE, {
        annual_target: annualTargetId,
        months,
      });
      return response;
    });
  }

  async lockPhasing(id) {
    if (!id) throw new Error('Phasing ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(MONTHLY_PHASING_ENDPOINTS.LOCK(id));
      return response;
    });
  }

  async lockPhasingCycle(performanceCycle) {
    if (!performanceCycle) throw new Error('Performance cycle is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(MONTHLY_PHASING_ENDPOINTS.LOCK_CYCLE, { performance_cycle: performanceCycle });
      return response;
    });
  }

  async unlockPhasingCycle(performanceCycle) {
    if (!performanceCycle) throw new Error('Performance cycle is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(MONTHLY_PHASING_ENDPOINTS.UNLOCK_CYCLE, { performance_cycle: performanceCycle });
      return response;
    });
  }

  // ============ Cascade Rules & Maps ============
  async getCascadeRules(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(CASCADE_ENDPOINTS.RULES, { params });
      return response;
    });
  }

  async getCascadeRule(id) {
    if (!id) throw new Error('Rule ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(CASCADE_ENDPOINTS.RULE_DETAIL(id));
      return response;
    });
  }

  async createCascadeRule(data) {
    if (!data) throw new Error('Rule data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(CASCADE_ENDPOINTS.RULE_CREATE, data);
      return response;
    });
  }

  async updateCascadeRule(id, data) {
    if (!id) throw new Error('Rule ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.patch(CASCADE_ENDPOINTS.RULE_UPDATE(id), data);
      return response;
    });
  }

  async deleteCascadeRule(id) {
    if (!id) throw new Error('Rule ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.delete(CASCADE_ENDPOINTS.RULE_DELETE(id));
      return response;
    });
  }

  async setDefaultCascadeRule(id) {
    if (!id) throw new Error('Rule ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(CASCADE_ENDPOINTS.SET_DEFAULT_RULE(id));
      return response;
    });
  }

  async getCascadeMaps(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(CASCADE_ENDPOINTS.MAPS, { params });
      return response;
    });
  }

  async createCascadeMap(data) {
    if (!data) throw new Error('Cascade map data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(CASCADE_ENDPOINTS.MAP_CREATE, data);
      return response;
    });
  }

  async cascadeDepartment(deptTargetId, ruleId, userIds = [], weights = {}) {
    if (!deptTargetId) throw new Error('Department target ID is required');
    if (!ruleId) throw new Error('Rule ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(CASCADE_ENDPOINTS.CASCADE_DEPARTMENT, {
        department_target: deptTargetId,
        cascade_rule: ruleId,
        user_ids: userIds,
        weights,
      });
      return response;
    });
  }

  async getCascadeTree(orgTargetId) {
    if (!orgTargetId) throw new Error('Organization target ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(CASCADE_ENDPOINTS.TREE, { params: { organization_target: orgTargetId } });
      return response;
    });
  }

  async repairCascade(kpiId, year) {
    if (!kpiId) throw new Error('KPI ID is required');
    if (!year) throw new Error('Year is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(CASCADE_ENDPOINTS.REPAIR, { kpi_id: kpiId, year });
      return response;
    });
  }

  async getContributors(orgTargetId) {
    if (!orgTargetId) throw new Error('Organization target ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(CASCADE_ENDPOINTS.CONTRIBUTORS, { params: { organization_target: orgTargetId } });
      return response;
    });
  }

  async getUserContributions(userId, year) {
    return withRetry(async () => {
      const params = {};
      if (userId) params.user_id = userId;
      if (year) params.year = year;
      const response = await this.apiClient.get(CASCADE_ENDPOINTS.USER_CONTRIBUTIONS, { params });
      return response;
    });
  }

  async rollbackCascadeMap(mapId) {
    if (!mapId) throw new Error('Cascade map ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.delete(CASCADE_ENDPOINTS.ROLLBACK(mapId));
      return response;
    });
  }

  async rollbackOrganizationCascade(orgTargetId) {
    if (!orgTargetId) throw new Error('Organization target ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(CASCADE_ENDPOINTS.ROLLBACK_ORGANIZATION, { organization_target: orgTargetId });
      return response;
    });
  }

  async verifyCascadeIntegrity(orgTargetId) {
    if (!orgTargetId) throw new Error('Organization target ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(CASCADE_ENDPOINTS.VERIFY_INTEGRITY, { params: { organization_target: orgTargetId } });
      return response;
    });
  }
}

export const targetService = new TargetService();