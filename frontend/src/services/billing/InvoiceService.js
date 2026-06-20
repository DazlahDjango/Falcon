import { BillingBaseService } from './BillingBaseService';
import { INVOICE_ENDPOINTS } from '../../config/constants/billingApiConstants';

class InvoiceServiceClass extends BillingBaseService {
    constructor() { super('invoices'); }

    async getInvoices(params = {}) { return this.list(params); }
    async getInvoice(id) { return this.getById(id); }
    async getOutstandingInvoices() {
        return this.withRetry(() => this.apiClient.get(INVOICE_ENDPOINTS.OUTSTANDING));
    }
    async downloadInvoice(id, format = 'pdf') {
        return this.withRetry(() => this.apiClient.get(INVOICE_ENDPOINTS.DOWNLOAD(id), { params: { format }, responseType: 'blob' }));
    }
    async sendInvoiceEmail(id, email = null) {
        return this.withRetry(() => this.apiClient.post(INVOICE_ENDPOINTS.SEND(id), { email }));
    }
    async getAdminOverdue() {
        return this.withRetry(() => this.apiClient.get(INVOICE_ENDPOINTS.ADMIN_OVERDUE));
    }
}

export const InvoiceService = new InvoiceServiceClass();
export default InvoiceService;