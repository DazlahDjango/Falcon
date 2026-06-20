import { BillingBaseService } from './BillingBaseService';
import { ADMIN_BILLING_ENDPOINTS } from '../../config/constants/billingApiConstants';

class AdminBillingServiceClass extends BillingBaseService {
    constructor() { super('admin'); }

    async getTenantSubscriptions(tenantId) {
        return this.withRetry(() => this.apiClient.get(ADMIN_BILLING_ENDPOINTS.TENANT_SUBSCRIPTIONS(tenantId)));
    }
    async getTenantInvoices(tenantId) {
        return this.withRetry(() => this.apiClient.get(ADMIN_BILLING_ENDPOINTS.TENANT_INVOICES(tenantId)));
    }
    async getTenantTransactions(tenantId) {
        return this.withRetry(() => this.apiClient.get(ADMIN_BILLING_ENDPOINTS.TENANT_TRANSACTIONS(tenantId)));
    }
    async bulkUpdateSubscriptions(updates) {
        return this.withRetry(() => this.apiClient.post(ADMIN_BILLING_ENDPOINTS.BULK_UPDATE_SUBSCRIPTIONS, { updates }));
    }
    async getRevenueReport(startDate, endDate) {
        return this.withRetry(() => this.apiClient.get(ADMIN_BILLING_ENDPOINTS.REVENUE_REPORT, { params: { start_date: startDate, end_date: endDate } }));
    }
    async getSubscriptionReport(startDate, endDate) {
        return this.withRetry(() => this.apiClient.get(ADMIN_BILLING_ENDPOINTS.SUBSCRIPTION_REPORT, { params: { start_date: startDate, end_date: endDate } }));
    }
    async getTaxReport(year) {
        return this.withRetry(() => this.apiClient.get(ADMIN_BILLING_ENDPOINTS.TAX_REPORT, { params: { year } }));
    }
}

export const AdminBillingService = new AdminBillingServiceClass();
export default AdminBillingService;