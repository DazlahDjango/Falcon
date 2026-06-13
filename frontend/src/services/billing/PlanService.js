import { BillingBaseService } from './BillingBaseService';
import { PLAN_ENDPOINTS } from '../../config/constants/billingApiConstants';

class PlanServiceClass extends BillingBaseService {
    constructor() { super('plans'); }

    async getPlans(params = {}) { return this.list(params); }
    async getPlan(id) { return this.getById(id); }
    async createPlan(data) { return this.create(data); }
    async updatePlan(id, data) { return this.update(id, data); }
    async deletePlan(id) { return this.delete(id); }
    async getPublicPlans() {
        return this.withRetry(() => this.apiClient.get(PLAN_ENDPOINTS.PUBLIC));
    }
    async getPlanComparison() {
        return this.withRetry(() => this.apiClient.get(PLAN_ENDPOINTS.COMPARISON));
    }
    async syncToPaystack(id) {
        return this.withRetry(() => this.apiClient.post(PLAN_ENDPOINTS.SYNC_PAYSTACK(id)));
    }
    async getPlanLimits(planType) {
        const plans = await this.getPublicPlans();
        const plan = plans?.data?.find(p => p.plan_type === planType);
        return plan?.limits || { maxUsers: 10, maxKpis: 50, maxStorageMb: 100 };
    }
}

export const PlanService = new PlanServiceClass();
export default PlanService;