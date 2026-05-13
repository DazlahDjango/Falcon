import { BaseBillingService, withRetry } from './client';

class PlanService extends BaseBillingService {
    constructor() {
        super('plans');
    }
    async getPlans(params = {}) {
        return withRetry(() => this.apiClient.get(this.getEndpoint(), { params }));
    }
    async getPublicPlans() {
        return withRetry(() => this.apiClient.get('/plans/public/'));
    }
    async getPlanById(id) {
        return this.getById(id);
    }
    async getPlanBySlug(slug) {
        return withRetry(() => this.apiClient.get(`/plans/by-slug/${slug}/`));
    }
    async getPlanFeatures(id) {
        return withRetry(() => this.apiClient.get(this.getEndpoint(`${id}/features/`)));
    }
    async getPlanSubscriptions(id) {
        return withRetry(() => this.apiClient.get(this.getEndpoint(`${id}/subscriptions/`)));
    }
    async comparePlans(planIds) {
        if (!planIds || planIds.length < 2) {
            throw new Error('At least 2 plans are required for comparison');
        }
        return withRetry(() => this.apiClient.post('/plans/compare/', { plan_ids: planIds }));
    }
    async getRecommendedPlan() {
        return withRetry(() => this.apiClient.get('/plans/recommended/'));
    }
    async getPlanPricing(id, interval = 'month') {
        return withRetry(() => this.apiClient.get(this.getEndpoint(`${id}/pricing/`), {
            params: { interval }
        }));
    }
}
export const planService = new PlanService();
export default planService;