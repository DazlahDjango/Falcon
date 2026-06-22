import { BillingBaseService } from './BillingBaseService';
import { TRANSACTION_ENDPOINTS } from '../../config/constants/billingApiConstants';

class TransactionServiceClass extends BillingBaseService {
    constructor() { super('transactions'); }

    async getTransactions(params = {}) { return this.list(params); }
    async getTransaction(id) { return this.getById(id); }
    async verifyTransaction(reference) {
        return this.withRetry(() => this.apiClient.post(TRANSACTION_ENDPOINTS.VERIFY, { reference }));
    }
    async refundTransaction(id, amount = null) {
        return this.withRetry(() => this.apiClient.post(TRANSACTION_ENDPOINTS.REFUND(id), { amount }));
    }
    async getTransactionSummary() {
        return this.withRetry(() => this.apiClient.get(TRANSACTION_ENDPOINTS.SUMMARY));
    }
    async getAdminStats(year = null) {
        const params = year ? { year } : {};
        return this.withRetry(() => this.apiClient.get(TRANSACTION_ENDPOINTS.ADMIN_STATS, { params }));
    }
}

export const TransactionService = new TransactionServiceClass();
export default TransactionService;