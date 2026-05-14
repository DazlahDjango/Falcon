import { BaseBillingService, withRetry } from './client';
import { SUBSCRIPTION_API_ENDPOINTS } from '../../config/constants/billingApiConstants';

class SubscriptionService extends BaseBillingService {
    constructor() {
        super('subscriptions');
    }

    async getSubscriptions(params = {}) {
        return withRetry(() => this.apiClient.get(SUBSCRIPTION_API_ENDPOINTS.LIST, { params }));
    }

    async getCurrentSubscription() {
        return withRetry(() => this.apiClient.get(SUBSCRIPTION_API_ENDPOINTS.CURRENT));
    }

    async getSubscriptionStatus() {
        return withRetry(() => this.apiClient.get(SUBSCRIPTION_API_ENDPOINTS.STATUS));
    }

    async getSubscriptionById(id) {
        return withRetry(() => this.apiClient.get(SUBSCRIPTION_API_ENDPOINTS.DETAIL(id)));
    }

    async createSubscription(data) {
        if (!data.plan_id) {
            throw new Error('Plan ID is required');
        }
        return withRetry(() => this.apiClient.post(SUBSCRIPTION_API_ENDPOINTS.CREATE, data));
    }

    async updateSubscription(id, data) {
        return withRetry(() => this.apiClient.patch(SUBSCRIPTION_API_ENDPOINTS.UPDATE(id), data));
    }

    async cancelSubscription(id, atPeriodEnd = true, reason = '') {
        return withRetry(() => this.apiClient.post(SUBSCRIPTION_API_ENDPOINTS.CANCEL(id), {
            at_period_end: atPeriodEnd,
            reason
        }));
    }

    async reactivateSubscription(id) {
        return withRetry(() => this.apiClient.post(SUBSCRIPTION_API_ENDPOINTS.REACTIVATE(id)));
    }

    async syncSubscription(id) {
        return withRetry(() => this.apiClient.post(SUBSCRIPTION_API_ENDPOINTS.SYNC(id)));
    }

    async getSubscriptionHistory(id) {
        return withRetry(() => this.apiClient.get(SUBSCRIPTION_API_ENDPOINTS.HISTORY(id)));
    }

    async upgradeSubscription(id, newPlanId) {
        return this.updateSubscription(id, { plan_id: newPlanId });
    }

    async downgradeSubscription(id, newPlanId) {
        return this.updateSubscription(id, { plan_id: newPlanId });
    }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;