import { BaseBillingService, withRetry, getStripe } from './client';

class PaymentMethodService extends BaseBillingService {
    constructor() {
        super('payment-methods');
    }
    async getPaymentMethods() {
        return withRetry(() => this.apiClient.get(this.getEndpoint()));
    }
    async getPaymentMethodById(id) {
        return this.getById(id);
    }
    async getDefaultPaymentMethod() {
        return withRetry(() => this.apiClient.get('/payment-methods/default/'));
    }
    async getExpiringSoon() {
        return withRetry(() => this.apiClient.get('/payment-methods/expiring-soon/'));
    }
    async createSetupIntent() {
        return withRetry(() => this.apiClient.post('/payment-methods/setup-intent/'));
    }
    async addPaymentMethod(paymentMethodId, setAsDefault = true) {
        if (!paymentMethodId) {
            throw new Error('Payment method ID is required');
        }
        return this.create({ payment_method_id: paymentMethodId, set_as_default: setAsDefault });
    }
    async deletePaymentMethod(id) {
        return this.delete(id);
    }
    async setDefaultPaymentMethod(id) {
        return withRetry(() => this.apiClient.post(this.getEndpoint(`${id}/set_default/`)));
    }
    async detachPaymentMethod(id) {
        return withRetry(() => this.apiClient.post(this.getEndpoint(`${id}/detach/`)));
    }
    async initStripeElements(options = {}) {
        const stripe = await getStripe();
        if (!stripe) {
            throw new Error('Stripe failed to initialize');
        }
        const elements = stripe.elements({
            appearance: {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#3B82F6',
                    colorBackground: '#FFFFFF',
                    colorText: '#1F2937',
                    colorDanger: '#EF4444',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px',
                },
                rules: {
                    '.Input': {
                        border: '1px solid #E5E7EB',
                        padding: '12px',
                    },
                    '.Input:focus': {
                        border: '2px solid #3B82F6',
                        boxShadow: '0 0 0 1px #3B82F6',
                    },
                },
            },
            ...options,
        });
        const cardElement = elements.create('card', {
            hidePostalCode: false,
            style: {
                base: {
                    fontSize: '16px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    '::placeholder': {
                        color: '#9CA3AF',
                    },
                },
            },
        });
        return { stripe, elements, cardElement };
    }
    async confirmSetup(stripe, cardElement, clientSecret) {
        const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
            payment_method: {
                card: cardElement,
            },
        });
        if (error) {
            throw new Error(error.message);
        }
        return setupIntent;
    }
    async processPayment(paymentMethodId, paymentData) {
        const stripe = await getStripe();
        if (!stripe) {
            throw new Error('Stripe failed to initialize');
        }
        const { error } = await stripe.confirmPayment({
            payment_method: paymentMethodId,
            ...paymentData,
        });
        if (error) {
            throw new Error(error.message);
        }
        return { success: true };
    }
}
export const paymentMethodService = new PaymentMethodService();
export default paymentMethodService;