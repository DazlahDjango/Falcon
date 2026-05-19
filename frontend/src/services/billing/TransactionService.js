/**
 * Transaction Service
 * Handles payment transaction operations
 */

import { BillingBaseService } from './BillingBaseService';
import { TRANSACTION_ENDPOINTS } from '../../config/constants/billingApiConstants';

class TransactionServiceClass extends BillingBaseService {
    constructor() {
        super('transactions');
    }

    /**
     * Get all transactions for the tenant
     * @param {Object} params - Query parameters (status, transaction_type, start_date, end_date)
     */
    async getTransactions(params = {}) {
        return this.list(params);
    }

    /**
     * Get transaction by ID
     * @param {string} id - Transaction ID
     */
    async getTransaction(id) {
        return this.getById(id);
    }

    /**
     * Get transaction by reference
     * @param {string} reference - Transaction reference
     */
    async getTransactionByReference(reference) {
        const transactions = await this.getTransactions({ reference });
        return transactions?.data?.[0] || null;
    }

    /**
     * Verify a transaction status
     * @param {string} reference - Transaction reference
     */
    async verifyTransaction(reference) {
        if (!reference) {
            throw new Error('Transaction reference is required');
        }
        return this.withRetry(() => 
            this.apiClient.post(TRANSACTION_ENDPOINTS.VERIFY, { reference })
        );
    }

    /**
     * Refund a transaction (Admin only)
     * @param {string} id - Transaction ID
     * @param {Object} options - { amount, reason }
     */
    async refundTransaction(id, options = {}) {
        const { amount, reason = 'Customer requested refund' } = options;
        return this.withRetry(() => 
            this.apiClient.post(TRANSACTION_ENDPOINTS.REFUND(id), { amount, reason })
        );
    }

    /**
     * Get transaction summary for tenant
     * @param {Object} options - { start_date, end_date }
     */
    async getTransactionSummary(options = {}) {
        const transactions = await this.getTransactions(options);
        const data = transactions.data || [];
        
        const summary = {
            total: data.length,
            successful: data.filter(t => t.status === 'success').length,
            failed: data.filter(t => t.status === 'failed').length,
            pending: data.filter(t => t.status === 'pending').length,
            refunded: data.filter(t => t.status === 'refunded').length,
            totalAmount: 0,
            totalTax: 0,
        };
        
        data.forEach(t => {
            if (t.status === 'success') {
                summary.totalAmount += t.total_amount || 0;
                summary.totalTax += t.tax_amount || 0;
            }
        });
        
        return summary;
    }

    /**
     * Check if transaction can be refunded
     * @param {Object} transaction - Transaction object
     */
    canRefund(transaction) {
        if (!transaction) return false;
        
        const isSuccess = transaction.status === 'success';
        const isWithinRefundWindow = transaction.payment_date && 
            new Date(transaction.payment_date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        
        return isSuccess && isWithinRefundWindow;
    }
}

export const TransactionService = new TransactionServiceClass();
export default TransactionService;