/**
 * Invoice Service
 * Handles invoice operations
 */

import { BillingBaseService } from './BillingBaseService';
import { INVOICE_ENDPOINTS } from '../../config/constants/billingApiConstants';

class InvoiceServiceClass extends BillingBaseService {
    constructor() {
        super('invoices');
    }

    /**
     * Get all invoices for the tenant
     * @param {Object} params - Query parameters (status, unpaid_only, start_date, end_date)
     */
    async getInvoices(params = {}) {
        return this.list(params);
    }

    /**
     * Get invoice by ID
     * @param {string} id - Invoice ID
     */
    async getInvoice(id) {
        return this.getById(id);
    }

    /**
     * Get invoice by number
     * @param {string} invoiceNumber - Invoice number
     */
    async getInvoiceByNumber(invoiceNumber) {
        const invoices = await this.getInvoices({ invoice_number: invoiceNumber });
        return invoices?.data?.[0] || null;
    }

    /**
     * Download invoice PDF
     * @param {string} id - Invoice ID
     * @param {string} format - Format (pdf, csv, json)
     */
    async downloadInvoice(id, format = 'pdf') {
        if (!id) throw new Error('Invoice ID is required');
        
        return this.withRetry(() => 
            this.apiClient.get(INVOICE_ENDPOINTS.DOWNLOAD(id), {
                params: { format },
                responseType: format === 'pdf' ? 'blob' : 'json',
            })
        );
    }

    /**
     * Send invoice email
     * @param {string} id - Invoice ID
     */
    async sendInvoiceEmail(id) {
        if (!id) throw new Error('Invoice ID is required');
        return this.withRetry(() => 
            this.apiClient.post(INVOICE_ENDPOINTS.SEND(id))
        );
    }

    /**
     * Pay invoice
     * @param {string} id - Invoice ID
     * @param {Object} options - { payment_method_id }
     */
    async payInvoice(id, options = {}) {
        if (!id) throw new Error('Invoice ID is required');
        return this.withRetry(() => 
            this.apiClient.post(INVOICE_ENDPOINTS.PAY(id), options)
        );
    }

    /**
     * Get invoice summary for tenant
     */
    async getInvoiceSummary() {
        return this.withRetry(() => 
            this.apiClient.get(INVOICE_ENDPOINTS.SUMMARY)
        );
    }

    /**
     * Get unpaid invoices
     */
    async getUnpaidInvoices() {
        return this.getInvoices({ unpaid_only: true });
    }

    /**
     * Get overdue invoices
     */
    async getOverdueInvoices() {
        const invoices = await this.getInvoices({ status: 'overdue' });
        return invoices;
    }

    /**
     * Get total outstanding amount
     */
    async getTotalOutstanding() {
        const summary = await this.getInvoiceSummary();
        return summary?.data?.total_outstanding || 0;
    }

    /**
     * Check if invoice is overdue
     * @param {Object} invoice - Invoice object
     */
    isInvoiceOverdue(invoice) {
        if (!invoice || invoice.status !== 'pending') return false;
        return new Date(invoice.due_date) < new Date();
    }

    /**
     * Format invoice number for display
     * @param {string} invoiceNumber - Invoice number (e.g., FALCON-202501-000001)
     */
    formatInvoiceNumber(invoiceNumber) {
        if (!invoiceNumber) return '';
        const parts = invoiceNumber.split('-');
        if (parts.length === 3) {
            return `${parts[0]}-${parts[1]}`;
        }
        return invoiceNumber;
    }
}

export const InvoiceService = new InvoiceServiceClass();
export default InvoiceService;