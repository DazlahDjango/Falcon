import { BillingBaseService } from './BillingBaseService';
import { SUBSCRIPTION_ENDPOINTS } from '../../config/constants/billingApiConstants';

class SubscriptionServiceClass extends BillingBaseService {
    constructor() { super('subscriptions'); }

    async getSubscriptions(params = {}) { return this.list(params); }
    async getSubscription(id) { return this.getById(id); }
    async getCurrentSubscription() { return this.withRetry(() => this.apiClient.get(SUBSCRIPTION_ENDPOINTS.CURRENT)); }
    async createSubscription(data) { return this.create(data); }
    async updateSubscription(id, data) { return this.update(id, data); }
    async cancelSubscription(id, options = {}) {
        const { at_period_end = true, reason = '' } = options;
        return this.withRetry(() => this.apiClient.post(SUBSCRIPTION_ENDPOINTS.CANCEL(id), { at_period_end, reason }));
    }
    async cancelImmediate(id, reason = '') {
        return this.withRetry(() => this.apiClient.post(SUBSCRIPTION_ENDPOINTS.CANCEL_IMMEDIATE(id), { reason }));
    }
    async renewSubscription(id, options = {}) {
        return this.withRetry(() => this.apiClient.post(SUBSCRIPTION_ENDPOINTS.RENEW(id), options));
    }
    async upgradeSubscription(id, planId, immediate = true) {
        if (!planId) throw new Error('Plan ID is required');
        return this.withRetry(() => this.apiClient.post(SUBSCRIPTION_ENDPOINTS.UPGRADE(id, planId), { immediate }));
    }
    async downgradeSubscription(id, planId, immediate = false) {
        if (!planId) throw new Error('Plan ID is required');
        return this.withRetry(() => this.apiClient.post(SUBSCRIPTION_ENDPOINTS.DOWNGRADE(id, planId), { immediate }));
    }
    async extendTrial(id, extraDays = 7) {
        return this.withRetry(() => this.apiClient.post(SUBSCRIPTION_ENDPOINTS.EXTEND_TRIAL(id), { extra_days: extraDays }));
    }
    async getSubscriptionUsage(id) {
        return this.withRetry(() => this.apiClient.get(SUBSCRIPTION_ENDPOINTS.USAGE(id)));
    }
    async getSubscriptionInvoices(id) {
        return this.withRetry(() => this.apiClient.get(SUBSCRIPTION_ENDPOINTS.INVOICES(id)));
    }
    async getSubscriptionTransactions(id) {
        return this.withRetry(() => this.apiClient.get(SUBSCRIPTION_ENDPOINTS.TRANSACTIONS(id)));
    }
    async adminCancelTenant(tenantId, reason = 'Admin action') {
        return this.withRetry(() => this.apiClient.post(SUBSCRIPTION_ENDPOINTS.ADMIN_CANCEL, { tenant_id: tenantId, reason }));
    }
    async hasActiveSubscription() {
        try {
            const subscription = await this.getCurrentSubscription();
            return subscription?.data?.is_active === true;
        } catch { return false; }
    }
    async getSubscriptionStatus() {
        const subscription = await this.getCurrentSubscription();
        if (!subscription?.data) return { hasSubscription: false, isActive: false, isOnTrial: false, planType: null };
        return {
            hasSubscription: true, isActive: subscription.data.is_active_status?.is_active || false,
            isOnTrial: subscription.data.is_active_status?.is_on_trial || false,
            trialDaysRemaining: subscription.data.is_active_status?.trial_days_remaining || 0,
            daysUntilExpiry: subscription.data.is_active_status?.days_until_expiry || 0,
            planType: subscription.data.plan?.plan_type, planName: subscription.data.plan?.name,
            status: subscription.data.status, autoRenew: subscription.data.auto_renew,
            cancelAtPeriodEnd: subscription.data.cancel_at_period_end, currentPeriodEnd: subscription.data.current_period_end,
        };
    }
}

export const SubscriptionService = new SubscriptionServiceClass();
export default SubscriptionService;