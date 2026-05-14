import { BaseBillingService, withRetry } from './client';
import { INVOICE_API_ENDPOINTS } from '../../config/constants/billingApiConstants';

class InvoiceService extends BaseBillingService {
    constructor() {
        super('invoices');
    }

    async getInvoices(params = {}) {
        return withRetry(() => this.apiClient.get(INVOICE_API_ENDPOINTS.LIST, { params }));
    }

    async getInvoiceById(id) {
        return withRetry(() => this.apiClient.get(INVOICE_API_ENDPOINTS.DETAIL(id)));
    }

    async downloadInvoice(id) {
        return withRetry(() => this.apiClient.get(INVOICE_API_ENDPOINTS.DOWNLOAD(id), {
            responseType: 'blob'
        }));
    }

    async getInvoiceDownloadUrl(id) {
        const response = await this.getInvoiceById(id);
        return response.data?.invoice_pdf_url;
    }

    async sendPaymentReminder(id) {
        return withRetry(() => this.apiClient.post(INVOICE_API_ENDPOINTS.REMIND(id)));
    }

    async getOutstandingInvoices() {
        return withRetry(() => this.apiClient.get(INVOICE_API_ENDPOINTS.OUTSTANDING));
    }

    async getInvoiceLineItems(id) {
        return withRetry(() => this.apiClient.get(INVOICE_API_ENDPOINTS.LINE_ITEMS(id)));
    }

    async getInvoicePayments(id) {
        return withRetry(() => this.apiClient.get(INVOICE_API_ENDPOINTS.PAYMENTS(id)));
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