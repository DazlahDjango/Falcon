import { BillingBaseService } from './BillingBaseService';
import { PAYMENT_METHOD_ENDPOINTS } from '../../config/constants/billingApiConstants';

class PaymentMethodServiceClass extends BillingBaseService {
    constructor() { super('payment-methods'); }

    async getPaymentMethods(params = {}) { return this.list(params); }
    async getPaymentMethod(id) { return this.getById(id); }
    async addPaymentMethod(authorizationCode, email) {
        return this.create({ authorization_code: authorizationCode, email });
    }
    async deletePaymentMethod(id) {
        return this.delete(id);
    }
    async setDefaultPaymentMethod(id) {
        return this.withRetry(() => this.apiClient.post(PAYMENT_METHOD_ENDPOINTS.SET_DEFAULT(id)));
    }
}

export const PaymentMethodService = new PaymentMethodServiceClass();
export default PaymentMethodService;