/**
 * Payment Method Service
 * Handles saved payment method operations
 */

import { BillingBaseService } from './BillingBaseService';
import { PAYMENT_METHOD_ENDPOINTS } from '../../config/constants/billingApiConstants';

class PaymentMethodServiceClass extends BillingBaseService {
    constructor() {
        super('payment-methods');
    }

    /**
     * Get all payment methods for the tenant
     * @param {Object} params - Query parameters (status, payment_type, active_only)
     */
    async getPaymentMethods(params = {}) {
        return this.list(params);
    }

    /**
     * Get payment method by ID
     * @param {string} id - Payment method ID
     */
    async getPaymentMethod(id) {
        return this.getById(id);
    }

    /**
     * Add a new payment method
     * @param {Object} data - { authorization_code, email }
     */
    async addPaymentMethod(data) {
        if (!data.authorization_code) {
            throw new Error('Authorization code is required');
        }
        if (!data.email) {
            throw new Error('Email is required');
        }
        return this.create(data);
    }

    /**
     * Delete a payment method
     * @param {string} id - Payment method ID
     * @param {boolean} confirm - Confirmation flag
     */
    async deletePaymentMethod(id, confirm = true) {
        if (!confirm) {
            throw new Error('Deletion must be confirmed');
        }
        return this.delete(id);
    }

    /**
     * Set a payment method as default
     * @param {string} id - Payment method ID
     */
    async setDefaultPaymentMethod(id) {
        if (!id) throw new Error('Payment method ID is required');
        return this.withRetry(() => 
            this.apiClient.post(PAYMENT_METHOD_ENDPOINTS.SET_DEFAULT(id))
        );
    }

    /**
     * Get default payment method
     */
    async getDefaultPaymentMethod() {
        const methods = await this.getPaymentMethods({ status: 'default' });
        return methods?.data?.[0] || null;
    }

    /**
     * Get active payment methods
     */
    async getActivePaymentMethods() {
        return this.getPaymentMethods({ active_only: true });
    }

    /**
     * Check if tenant has any payment method
     */
    async hasPaymentMethod() {
        const methods = await this.getPaymentMethods({ active_only: true });
        return (methods?.data?.length || 0) > 0;
    }

    /**
     * Get payment method display name
     * @param {Object} method - Payment method object
     */
    getDisplayName(method) {
        if (!method) return '';
        
        if (method.payment_type === 'card') {
            return `${method.card_brand || 'Card'} •••• ${method.card_last4 || '****'}`;
        } else if (method.payment_type === 'bank') {
            return `${method.bank_name || 'Bank'} - ${method.account_name || ''}`;
        }
        return method.payment_type || 'Payment Method';
    }

    /**
     * Check if card is expired
     * @param {Object} method - Payment method object
     */
    isCardExpired(method) {
        if (method.payment_type !== 'card') return false;
        if (!method.card_expiry_year || !method.card_expiry_month) return false;
        
        const expiryDate = new Date(
            parseInt(method.card_expiry_year),
            parseInt(method.card_expiry_month) - 1,
            1
        );
        return expiryDate < new Date();
    }

    /**
     * Get card brand icon name
     * @param {string} brand - Card brand
     */
    getCardBrandIcon(brand) {
        const icons = {
            visa: '💳',
            mastercard: '💳',
            'american express': '💳',
            discover: '💳',
        };
        return icons[brand?.toLowerCase()] || '💳';
    }
}

export const PaymentMethodService = new PaymentMethodServiceClass();
export default PaymentMethodService;