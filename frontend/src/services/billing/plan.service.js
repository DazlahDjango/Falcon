import { BaseBillingService, withRetry } from './client';
import { PLAN_API_ENDPOINTS } from '../../config/constants/billingApiConstants';

class PlanService extends BaseBillingService {
    constructor() {
        super('plans');
    }

    async getPlans(params = {}) {
        return withRetry(() => this.apiClient.get(PLAN_API_ENDPOINTS.LIST, { params }));
    }

    async getPlanById(id) {
        return withRetry(() => this.apiClient.get(PLAN_API_ENDPOINTS.DETAIL(id)));
    }

    async getPlanFeatures(id) {
        return withRetry(() => this.apiClient.get(PLAN_API_ENDPOINTS.FEATURES(id)));
    }

    async getPlanSubscriptions(id) {
        return withRetry(() => this.apiClient.get(PLAN_API_ENDPOINTS.SUBSCRIPTIONS(id)));
    }

    async comparePlans(planIds) {
        if (!planIds || planIds.length < 2) {
            throw new Error('At least 2 plans are required for comparison');
        }
        return withRetry(() => this.apiClient.post(PLAN_API_ENDPOINTS.COMPARE, { plan_ids: planIds }));
    }

    async getPlanPricing(id, interval = 'month') {
        return withRetry(() => this.apiClient.get(`${PLAN_API_ENDPOINTS.DETAIL(id)}pricing/`, {
            params: { interval }
        }));
    }
}

export const planService = new PlanService();
export default planService;