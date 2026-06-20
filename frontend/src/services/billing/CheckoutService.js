import { BillingBaseService } from './BillingBaseService';
import { CHECKOUT_ENDPOINTS } from '../../config/constants/billingApiConstants';

class CheckoutServiceClass extends BillingBaseService {
    constructor() { super('checkout'); }

    async initializeSubscriptionCheckout(planId, billingInterval = 'monthly', trialDays = 14, successUrl = null, cancelUrl = null, metadata = {}) {
        return this.withRetry(() => this.apiClient.post(CHECKOUT_ENDPOINTS.INITIALIZE, {
            plan_id: planId, billing_interval: billingInterval, trial_days: trialDays,
            success_url: successUrl, cancel_url: cancelUrl, metadata,
        }));
    }
    async initializeOneTimeCheckout(amount, description, successUrl = null, cancelUrl = null, metadata = {}) {
        return this.withRetry(() => this.apiClient.post(CHECKOUT_ENDPOINTS.INITIALIZE, {
            amount, description, success_url: successUrl, cancel_url: cancelUrl, metadata,
        }));
    }
    async verifyCheckout(reference) {
        return this.withRetry(() => this.apiClient.get(CHECKOUT_ENDPOINTS.VERIFY, { params: { reference } }));
    }
    redirectToPaystack(authorizationUrl) {
        if (authorizationUrl) { window.location.href = authorizationUrl; return true; }
        return false;
    }
    openPaystackInNewTab(authorizationUrl) {
        if (authorizationUrl) { window.open(authorizationUrl, '_blank'); return true; }
        return false;
    }
}

export const CheckoutService = new CheckoutServiceClass();
export default CheckoutService;