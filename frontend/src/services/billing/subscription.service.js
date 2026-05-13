import { BaseBillingService, withRetry } from './client';

class SubscriptionService extends BaseBillingService {
    constructor() {
        super('subscriptions');
    }
    async getSubscriptions(params = {}) {
        return withRetry(() => this.apiClient.get(this.getEndpoint(), { params }));
    }
    async getCurrentSubscription() {
        return withRetry(() => this.apiClient.get('/subscriptions/current/'));
    }
    async getSubscriptionStatus() {
        return withRetry(() => this.apiClient.get('/subscriptions/status/'));
    }
    async getSubscriptionById(id) {
        return this.getById(id);
    }
    async createSubscription(data) {
        if (!data.plan_id) {
            throw new Error('Plan ID is required');
        }
        return this.create(data);
    }
    async updateSubscription(id, data) {
        return this.update(id, data);
    }
    async cancelSubscription(id, atPeriodEnd = true, reason = '') {
        return withRetry(() => this.apiClient.post(this.getEndpoint(`${id}/cancel/`), {
            at_period_end: atPeriodEnd,
            reason
        }));
    }
    async reactivateSubscription(id) {
        return withRetry(() => this.apiClient.post(this.getEndpoint(`${id}/reactivate/`)));
    }
    async syncSubscription(id) {
        return withRetry(() => this.apiClient.post(this.getEndpoint(`${id}/sync/`)));
    }
    async getSubscriptionHistory(id) {
        return withRetry(() => this.apiClient.get(this.getEndpoint(`${id}/history/`)));
    }
    async getSubscriptionInvoices(id, params = {}) {
        return withRetry(() => this.apiClient.get(this.getEndpoint(`${id}/invoices/`), { params }));
    }
    async getSubscriptionPayments(id, params = {}) {
        return withRetry(() => this.apiClient.get(this.getEndpoint(`${id}/payments/`), { params }));
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