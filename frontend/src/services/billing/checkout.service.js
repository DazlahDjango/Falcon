import { BaseBillingService, withRetry } from './client';

class CheckoutService extends BaseBillingService {
    constructor() {
        super('checkout');
    }
    async createCheckoutSession(data) {
        if (!data.plan_id) {
            throw new Error('Plan ID is required');
        }
        if (!data.billing_interval) {
            throw new Error('Billing interval is required');
        }
        return withRetry(() => this.apiClient.post(this.getEndpoint(), data));
    }
    async getCheckoutSession(sessionId) {
        if (!sessionId) {
            throw new Error('Session ID is required');
        }
        return withRetry(() => this.apiClient.get(`/checkout/session/`, {
            params: { session_id: sessionId }
        }));
    }
    redirectToCheckout(checkoutUrl) {
        if (!checkoutUrl) {
            throw new Error('Checkout URL is required');
        }
        window.location.href = checkoutUrl;
    }
}
export const checkoutService = new CheckoutService();
export default checkoutService;