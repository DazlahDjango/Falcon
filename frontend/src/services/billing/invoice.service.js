import { BaseBillingService, withRetry } from './client';

class InvoiceService extends BaseBillingService {
    constructor() {
        super('invoices');
    }
    async getInvoices(params = {}) {
        return withRetry(() => this.apiClient.get(this.getEndpoint(), { params }));
    }
    async getInvoiceById(id) {
        return this.getById(id);
    }
    async downloadInvoice(id) {
        return withRetry(() => this.apiClient.get(this.getEndpoint(`${id}/download/`), {
            responseType: 'blob'
        }));
    }
    async getInvoiceDownloadUrl(id) {
        const response = await this.getInvoiceById(id);
        return response.data?.invoice_pdf_url;
    }
    async sendPaymentReminder(id) {
        return withRetry(() => this.apiClient.post(this.getEndpoint(`${id}/remind/`)));
    }
    async getOutstandingInvoices() {
        return withRetry(() => this.apiClient.get('/invoices/outstanding/'));
    }
    async getInvoiceSummary() {
        return withRetry(() => this.apiClient.get('/invoices/summary/'));
    }
    async getInvoiceLineItems(id) {
        return withRetry(() => this.apiClient.get(this.getEndpoint(`${id}/line-items/`)));
    }
    async getInvoicePayments(id) {
        return withRetry(() => this.apiClient.get(this.getEndpoint(`${id}/payments/`)));
    }
    async getInvoicesByDateRange(startDate, endDate) {
        return this.getInvoices({
            date_from: startDate.toISOString().split('T')[0],
            date_to: endDate.toISOString().split('T')[0]
        });
    }
    async getPaidInvoices(startDate, endDate) {
        return this.getInvoices({
            status: 'paid',
            date_from: startDate?.toISOString().split('T')[0],
            date_to: endDate?.toISOString().split('T')[0]
        });
    }
}
export const invoiceService = new InvoiceService();
export default invoiceService;