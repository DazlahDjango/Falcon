import { BillingBaseService } from './BillingBaseService';
import { PLAN_ENDPOINTS } from '../../config/constants/billingApiConstants';

class PlanServiceClass extends BillingBaseService {
    constructor() {
        super('plans');
    }
    async getPlans(params = {}) {
        return this.list(params);
    }
    async getPlan(id) {
        return this.getById(id);
    }
    async getPopularPlan() {
        return this.withRetry(() => 
            this.apiClient.get(PLAN_ENDPOINTS.POPULAR)
        );
    }
    async comparePlans(planIds) {
        if (!planIds || planIds.length === 0) {
            throw new Error('At least one plan ID is required');
        }
        
        if (planIds.length > 5) {
            throw new Error('Cannot compare more than 5 plans at once');
        }
        
        return this.withRetry(() => 
            this.apiClient.post(PLAN_ENDPOINTS.COMPARE, { plan_ids: planIds })
        );
    }
    async createPlan(planData) {
        return this.create(planData);
    }
    async updatePlan(id, planData) {
        return this.update(id, planData);
    }
    async deletePlan(id) {
        return this.delete(id);
    }
    async getPlanFeatures(planType) {
        const plans = await this.getPlans({ plan_type: planType });
        return plans.data?.features || [];
    }
    async getPricing() {
        const plans = await this.getPlans();
        const pricing = {};
        for (const plan of plans.data || []) {
            pricing[plan.plan_type] = {
                monthly: plan.price,
                yearly: plan.yearly_price || plan.price * 10,
                currency: plan.currency,
            };
        }
        
        return pricing;
    }
}

export const PlanService = new PlanServiceClass();
export default PlanService;