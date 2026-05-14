import { BaseBillingService, withRetry } from './client';
import { PAYMENT_API_ENDPOINTS } from '../../config/constants/billingApiConstants';

class PaymentService extends BaseBillingService {
    constructor() {
        super('payments');
    }

    async getPayments(params = {}) {
        return withRetry(() => this.apiClient.get(PAYMENT_API_ENDPOINTS.LIST, { params }));
    }

    async getPaymentById(id) {
        return withRetry(() => this.apiClient.get(PAYMENT_API_ENDPOINTS.DETAIL(id)));
    }

    async retryPayment(id) {
        return withRetry(() => this.apiClient.post(PAYMENT_API_ENDPOINTS.RETRY(id)));
    }

    async requestRefund(id, amount = null, reason = '') {
        const data = { reason };
        if (amount) data.amount = amount;
        return withRetry(() => this.apiClient.post(PAYMENT_API_ENDPOINTS.REFUND(id), data));
    }

    async getPaymentsByDateRange(startDate, endDate) {
        return this.getPayments({
            date_from: startDate.toISOString().split('T')[0],
            date_to: endDate.toISOString().split('T')[0]
        });
    }

    async getSuccessfulPayments(params = {}) {
        return this.getPayments({ ...params, status: 'succeeded' });
    }

    async getFailedPayments(params = {}) {
        return this.getPayments({ ...params, status: 'failed' });
    }
}

export const paymentService = new PaymentService();
export default paymentService;