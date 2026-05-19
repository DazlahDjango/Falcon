/**
 * Subscription Service
 * Handles subscription management operations
 */

import { BillingBaseService } from './BillingBaseService';
import { SUBSCRIPTION_ENDPOINTS } from '../../config/constants/billingApiConstants';

class SubscriptionServiceClass extends BillingBaseService {
    constructor() {
        super('subscriptions');
    }

    /**
     * Get all subscriptions for the tenant
     * @param {Object} params - Query parameters (status, plan_type, active_only)
     */
    async getSubscriptions(params = {}) {
        return this.list(params);
    }

    /**
     * Get subscription by ID
     * @param {string} id - Subscription ID
     */
    async getSubscription(id) {
        return this.getById(id);
    }

    /**
     * Get current active subscription
     */
    async getCurrentSubscription() {
        return this.withRetry(() => 
            this.apiClient.get(SUBSCRIPTION_ENDPOINTS.CURRENT)
        );
    }

    /**
     * Create a new subscription
     * @param {Object} subscriptionData - { plan_id, billing_interval, auto_renew, trial_days, payment_method_id }
     */
    async createSubscription(subscriptionData) {
        return this.create(subscriptionData);
    }

    /**
     * Update subscription settings
     * @param {string} id - Subscription ID
     * @param {Object} updateData - { auto_renew, billing_interval }
     */
    async updateSubscription(id, updateData) {
        return this.update(id, updateData);
    }

    /**
     * Cancel a subscription
     * @param {string} id - Subscription ID
     * @param {Object} options - { at_period_end, reason }
     */
    async cancelSubscription(id, options = {}) {
        const { at_period_end = true, reason = '' } = options;
        return this.withRetry(() => 
            this.apiClient.post(SUBSCRIPTION_ENDPOINTS.CANCEL(id), { at_period_end, reason })
        );
    }

    /**
     * Renew a subscription manually
     * @param {string} id - Subscription ID
     * @param {Object} options - { payment_method_id }
     */
    async renewSubscription(id, options = {}) {
        return this.withRetry(() => 
            this.apiClient.post(SUBSCRIPTION_ENDPOINTS.RENEW(id), options)
        );
    }

    /**
     * Upgrade subscription to higher plan
     * @param {string} id - Subscription ID
     * @param {Object} options - { plan_id, immediate }
     */
    async upgradeSubscription(id, options) {
        if (!options.plan_id) {
            throw new Error('Plan ID is required for upgrade');
        }
        return this.withRetry(() => 
            this.apiClient.post(SUBSCRIPTION_ENDPOINTS.UPGRADE(id), options)
        );
    }

    /**
     * Downgrade subscription to lower plan
     * @param {string} id - Subscription ID
     * @param {Object} options - { plan_id, immediate }
     */
    async downgradeSubscription(id, options) {
        if (!options.plan_id) {
            throw new Error('Plan ID is required for downgrade');
        }
        return this.withRetry(() => 
            this.apiClient.post(SUBSCRIPTION_ENDPOINTS.DOWNGRADE(id), options)
        );
    }

    /**
     * Get invoices for a subscription
     * @param {string} id - Subscription ID
     */
    async getSubscriptionInvoices(id) {
        return this.withRetry(() => 
            this.apiClient.get(SUBSCRIPTION_ENDPOINTS.INVOICES(id))
        );
    }

    /**
     * Get transactions for a subscription
     * @param {string} id - Subscription ID
     */
    async getSubscriptionTransactions(id) {
        return this.withRetry(() => 
            this.apiClient.get(SUBSCRIPTION_ENDPOINTS.TRANSACTIONS(id))
        );
    }

    /**
     * Check if tenant has an active subscription
     */
    async hasActiveSubscription() {
        try {
            const subscription = await this.getCurrentSubscription();
            return subscription?.data?.is_active === true;
        } catch {
            return false;
        }
    }

    /**
     * Get subscription status with details
     */
    async getSubscriptionStatus() {
        const subscription = await this.getCurrentSubscription();
        if (!subscription?.data) {
            return {
                hasSubscription: false,
                isActive: false,
                isOnTrial: false,
                planType: null,
            };
        }
        
        return {
            hasSubscription: true,
            isActive: subscription.data.is_active_status?.is_active || false,
            isOnTrial: subscription.data.is_active_status?.is_on_trial || false,
            trialDaysRemaining: subscription.data.is_active_status?.trial_days_remaining || 0,
            daysUntilExpiry: subscription.data.is_active_status?.days_until_expiry || 0,
            planType: subscription.data.plan?.plan_type,
            planName: subscription.data.plan?.name,
            status: subscription.data.status,
            autoRenew: subscription.data.auto_renew,
            cancelAtPeriodEnd: subscription.data.cancel_at_period_end,
            currentPeriodEnd: subscription.data.current_period_end,
        };
    }
}

export const SubscriptionService = new SubscriptionServiceClass();
export default SubscriptionService;