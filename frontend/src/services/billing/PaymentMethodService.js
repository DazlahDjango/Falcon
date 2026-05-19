import { BillingBaseService } from './BillingBaseService';

class PaymentMethodServiceClass extends BillingBaseService {
    constructor() {
        super('payment-methods');
    }

    /**
     * Get all payment methods for the tenant
     * @param {Object} params - Query parameters
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
            this.apiClient.post(`payment-methods/${id}/set_default/`)
        );
    }

    /**
     * Get the default payment method
     * @returns {Promise<Object|null>} Payment method object or null
     */
    async getDefaultPaymentMethod() {
        const response = await this.getPaymentMethods({ status: 'default' });
        // Return just the data array first item, not the full response
        return response?.data?.[0] || null;
    }

    /**
     * Get active payment methods only
     * @returns {Promise<Array>} Array of active payment methods
     */
    async getActivePaymentMethods() {
        const response = await this.getPaymentMethods({ active_only: true });
        // Return just the data array
        return response?.data || [];
    }

    /**
     * Check if tenant has any payment method
     * @returns {Promise<boolean>}
     */
    async hasPaymentMethod() {
        const methods = await this.getActivePaymentMethods();
        return methods.length > 0;
    }

    /**
     * Get user-friendly display name for payment method
     * @param {Object} method - Payment method object
     * @returns {string}
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
     * Check if a card payment method is expired
     * @param {Object} method - Payment method object
     * @returns {boolean}
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
     * Get icon for card brand
     * @param {string} brand - Card brand
     * @returns {string}
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

    /**
     * Format card number for display
     * @param {Object} method - Payment method object
     * @returns {string}
     */
    getMaskedCardNumber(method) {
        if (!method || method.payment_type !== 'card') return '•••• •••• •••• ••••';
        return `•••• •••• •••• ${method.card_last4 || '****'}`;
    }
}

export const PaymentMethodService = new PaymentMethodServiceClass();
export default PaymentMethodService;