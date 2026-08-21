import { BillingBaseService } from './BillingBaseService';
import { ADMIN_BILLING_ENDPOINTS } from '../../config/constants/billingApiConstants';

class AdminBillingServiceClass extends BillingBaseService {
    constructor() { super('admin'); }

    // --- Tenant-scoped queries (admin passes tenant_id as query param) ---
    async getTenantSubscriptions(tenantId) {
        return this.withRetry(() => this.apiClient.get(ADMIN_BILLING_ENDPOINTS.TENANT_SUBSCRIPTIONS, { params: { tenant_id: tenantId } }));
    }
    async getTenantInvoices(tenantId) {
        return this.withRetry(() => this.apiClient.get(ADMIN_BILLING_ENDPOINTS.TENANT_INVOICES, { params: { tenant_id: tenantId } }));
    }
    async getTenantTransactions(tenantId) {
        return this.withRetry(() => this.apiClient.get(ADMIN_BILLING_ENDPOINTS.TENANT_TRANSACTIONS, { params: { tenant_id: tenantId } }));
    }

    // --- Admin subscription actions ---
    async adminCancelTenant(tenantId, reason = 'Admin action') {
        return this.withRetry(() => this.apiClient.post(ADMIN_BILLING_ENDPOINTS.ADMIN_CANCEL, { tenant_id: tenantId, reason }));
    }

    // --- Reports (mapped to real implemented analytics endpoints) ---
    async getRevenueReport(year = null) {
        const params = year ? { year } : {};
        return this.withRetry(() => this.apiClient.get(ADMIN_BILLING_ENDPOINTS.REVENUE_REPORT, { params }));
    }
    async getSubscriptionReport() {
        return this.withRetry(() => this.apiClient.get(ADMIN_BILLING_ENDPOINTS.SUBSCRIPTION_REPORT));
    }
    async getTransactionStats(year = null) {
        const params = year ? { year } : {};
        return this.withRetry(() => this.apiClient.get(ADMIN_BILLING_ENDPOINTS.TRANSACTION_STATS, { params }));
    }

    // --- Admin invoice ---
    async getOverdueInvoices() {
        return this.withRetry(() => this.apiClient.get(ADMIN_BILLING_ENDPOINTS.OVERDUE_INVOICES));
    }
}

export const AdminBillingService = new AdminBillingServiceClass();
export default AdminBillingService;
