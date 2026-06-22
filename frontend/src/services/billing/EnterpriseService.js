import { BillingBaseService } from './BillingBaseService';
import { ENTERPRISE_ENDPOINTS } from '../../config/constants/billingApiConstants';

class EnterpriseServiceClass extends BillingBaseService {
    constructor() { super('enterprise'); }

    async getOverrides(params = {}) { return this.list(params); }
    async getOverride(id) { return this.getById(id); }
    async createOverride(data) { return this.create(data); }
    async updateOverride(id, data) { return this.update(id, data); }
    async deleteOverride(id) { return this.delete(id); }
    async getActiveOverride(tenantId) {
        return this.withRetry(() => this.apiClient.get(ENTERPRISE_ENDPOINTS.ACTIVE(tenantId)));
    }
    async expireOverrides() {
        return this.withRetry(() => this.apiClient.post(ENTERPRISE_ENDPOINTS.EXPIRE));
    }
    async createDynamicPlan(planData) {
        return this.withRetry(() => this.apiClient.post(ENTERPRISE_ENDPOINTS.DYNAMIC_PLAN_CREATE, planData));
    }
    async updateDynamicPlan(planId, planData) {
        return this.withRetry(() => this.apiClient.put(ENTERPRISE_ENDPOINTS.DYNAMIC_PLAN_UPDATE(planId), planData));
    }
    async getAllDynamicPlans() {
        return this.withRetry(() => this.apiClient.get(ENTERPRISE_ENDPOINTS.DYNAMIC_PLAN_LIST));
    }
}

export const EnterpriseService = new EnterpriseServiceClass();
export default EnterpriseService;