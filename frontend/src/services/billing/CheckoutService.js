/**
 * Checkout Service
 * Handles payment checkout operations
 */

import { BillingBaseService } from './BillingBaseService';
import { CHECKOUT_ENDPOINTS } from '../../config/constants/billingApiConstants';

class CheckoutServiceClass extends BillingBaseService {
    constructor() {
        super('checkout');
    }

    /**
     * Initialize subscription checkout
     * @param {Object} params - Checkout parameters
     * @param {string} params.plan_id - Plan ID
     * @param {string} params.billing_interval - 'monthly' or 'yearly'
     * @param {string} params.success_url - URL to redirect after success
     * @param {string} params.cancel_url - URL to redirect after cancel
     * @param {Object} params.metadata - Additional metadata
     */
    async initializeSubscriptionCheckout(params) {
        const { plan_id, billing_interval = 'monthly', success_url, cancel_url, metadata = {} } = params;

        if (!plan_id) {
            throw new Error('Plan ID is required for subscription checkout');
        }

        return this.withRetry(() =>
            this.apiClient.post(CHECKOUT_ENDPOINTS.INITIALIZE, {
                plan_id,
                billing_interval,
                success_url,
                cancel_url,
                metadata,
            })
        );
    }

    /**
     * Initialize one-time payment checkout
     * @param {Object} params - Checkout parameters
     * @param {number} params.amount - Amount in cents
     * @param {string} params.description - Payment description
     * @param {string} params.success_url - URL to redirect after success
     * @param {string} params.cancel_url - URL to redirect after cancel
     * @param {Object} params.metadata - Additional metadata
     */
    async initializeOneTimeCheckout(params) {
        const { amount, description, success_url, cancel_url, metadata = {} } = params;

        if (!amount || amount <= 0) {
            throw new Error('Valid amount is required for one-time checkout');
        }

        if (!description) {
            throw new Error('Description is required for one-time checkout');
        }

        return this.withRetry(() =>
            this.apiClient.post(CHECKOUT_ENDPOINTS.INITIALIZE, {
                amount,
                description,
                success_url,
                cancel_url,
                metadata,
            })
        );
    }

    /**
     * Verify checkout payment status
     * @param {string} reference - Transaction reference
     */
    async verifyCheckout(reference) {
        if (!reference) {
            throw new Error('Transaction reference is required');
        }

        return this.withRetry(() =>
            this.apiClient.post(CHECKOUT_ENDPOINTS.VERIFY, { reference })
        );
    }

    /**
     * Get callback URL for redirect
     * @param {string} reference - Transaction reference
     * @param {boolean} isSuccess - Whether payment was successful
     */
    getCallbackUrl(reference, isSuccess) {
        const baseUrl = window.location.origin;
        const path = isSuccess ? '/checkout/success' : '/checkout/cancel';
        return `${baseUrl}${path}?reference=${reference}`;
    }

    /**
     * Redirect to PayStack payment page
     * @param {string} authorizationUrl - PayStack authorization URL
     */
    redirectToPayment(authorizationUrl) {
        if (!authorizationUrl) {
            throw new Error('Authorization URL is required');
        }
        window.location.href = authorizationUrl;
    }

    /**
     * Open PayStack payment in popup
     * @param {string} authorizationUrl - PayStack authorization URL
     */
    openPaymentPopup(authorizationUrl) {
        if (!authorizationUrl) {
            throw new Error('Authorization URL is required');
        }

        const width = 600;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        return window.open(
            authorizationUrl,
            'paystack_payment',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    }

    /**
     * Save checkout session to storage
     * @param {Object} session - Checkout session data
     */
    saveCheckoutSession(session) {
        try {
            sessionStorage.setItem('checkout_session', JSON.stringify({
                ...session,
                timestamp: Date.now(),
            }));
            return true;
        } catch (error) {
            console.error('Failed to save checkout session:', error);
            return false;
        }
    }

    /**
     * Get saved checkout session
     */
    getCheckoutSession() {
        try {
            const session = sessionStorage.getItem('checkout_session');
            if (!session) return null;

            const parsed = JSON.parse(session);
            // Check if session is expired (30 minutes)
            if (Date.now() - parsed.timestamp > 30 * 60 * 1000) {
                sessionStorage.removeItem('checkout_session');
                return null;
            }
            return parsed;
        } catch (error) {
            console.error('Failed to get checkout session:', error);
            return null;
        }
    }

    /**
     * Clear checkout session
     */
    clearCheckoutSession() {
        sessionStorage.removeItem('checkout_session');
    }
}

export const CheckoutService = new CheckoutServiceClass();
export default CheckoutService;