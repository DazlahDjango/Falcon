import { BillingBaseService } from './BillingBaseService';

class PaymentMethodServiceClass extends BillingBaseService {
    constructor() {
        super('payment-methods');
    }
    
    async getPaymentMethods(params = {}) {
        return this.list(params);
    }
    
    async getPaymentMethod(id) {
        return this.getById(id);
    }
    
    async addPaymentMethod(data) {
        if (!data.authorization_code) {
            throw new Error('Authorization code is required');
        }
        if (!data.email) {
            throw new Error('Email is required');
        }
        return this.create(data);
    }
    
    async deletePaymentMethod(id, confirm = true) {
        if (!confirm) {
            throw new Error('Deletion must be confirmed');
        }
        return this.delete(id);
    }
    
    async setDefaultPaymentMethod(id) {
        if (!id) throw new Error('Payment method ID is required');
        return this.withRetry(() => 
            this.apiClient.post(`payment-methods/${id}/set_default/`)
        );
    }
    
    async getDefaultPaymentMethod() {
        const methods = await this.getPaymentMethods({ status: 'default' });
        return methods?.data?.[0] || null;
    }
    
    async getActivePaymentMethods() {
        return this.getPaymentMethods({ active_only: true });
    }
    
    async hasPaymentMethod() {
        const methods = await this.getPaymentMethods({ active_only: true });
        return (methods?.data?.length || 0) > 0;
    }
    
    getDisplayName(method) {
        if (!method) return '';
        
        if (method.payment_type === 'card') {
            return `${method.card_brand || 'Card'} •••• ${method.card_last4 || '****'}`;
        } else if (method.payment_type === 'bank') {
            return `${method.bank_name || 'Bank'} - ${method.account_name || ''}`;
        }
        return method.payment_type || 'Payment Method';
    }
    
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