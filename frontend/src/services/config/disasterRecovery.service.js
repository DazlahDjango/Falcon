import { BaseConfigService } from './configBase.service';
import { CONFIG_API } from '../../config/constants/configApiConstants';

class DisasterRecoveryService extends BaseConfigService {
  constructor() {
    super('dr-plans');
  }
  async getPlans(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DR_PLANS, { params }));
  }
  async getPlan(planId) {
    return this.withRetry(() => this.apiClient.get(`${CONFIG_API.DR_PLANS}/${planId}/`));
  }
  async createPlan(data) {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.DR_PLANS, data));
  }
  async updatePlan(planId, data) {
    return this.withRetry(() => this.apiClient.patch(`${CONFIG_API.DR_PLANS}/${planId}/`, data));
  }
  async deletePlan(planId) {
    return this.withRetry(() => this.apiClient.delete(`${CONFIG_API.DR_PLANS}/${planId}/`));
  }
  async executePlan(planId, executionType = 'actual') {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.EXECUTE_DR_PLAN(planId), { execution_type: executionType }));
  }
  async runDrill(planId) {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.DR_DRILL(planId)));
  }
  async failover(executionId) {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.FAILOVER(executionId)));
  }
  async failback(executionId) {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.FAILBACK(executionId)));
  }
  async getMetrics(appName = null) {
    const url = appName ? `${CONFIG_API.DR_METRICS}?app_name=${appName}` : CONFIG_API.DR_METRICS;
    return this.withRetry(() => this.apiClient.get(url));
  }
  async getExecutions(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DR_EXECUTIONS, { params }));
  }
  async getDRStats(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DASHBOARD_DR, { params }));
  }
}

export const disasterRecoveryService = new DisasterRecoveryService();