import { BaseBillingService, withRetry } from './client';

class PaymentService extends BaseBillingService {
    constructor() {
        super('payments');
    }
    async getPayments(params = {}) {
        return withRetry(() => this.apiClient.get(this.getEndpoint(), { params }));
    }
    async getPaymentById(id) {
        return this.getById(id);
    }
    async retryPayment(id) {
        return withRetry(() => this.apiClient.post(this.getEndpoint(`${id}/retry/`)));
    }
    async requestRefund(id, amount = null, reason = '') {
        const data = { reason };
        if (amount) data.amount = amount;
        return withRetry(() => this.apiClient.post(this.getEndpoint(`${id}/refund/`), data));
    }
    async getPaymentSummary() {
        return withRetry(() => this.apiClient.get('/payments/summary/'));
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