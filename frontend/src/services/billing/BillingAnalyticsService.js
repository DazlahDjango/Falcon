import { BillingBaseService } from './BillingBaseService';
import { ANALYTICS_ENDPOINTS } from '../../config/constants/billingApiConstants';

class BillingAnalyticsServiceClass extends BillingBaseService {
    constructor() { super('analytics'); }

    async getBillingSummary() {
        return this.withRetry(() => this.apiClient.get(ANALYTICS_ENDPOINTS.SUMMARY));
    }
    async getRevenueReport(period = 'month', year = null) {
        const params = { period };
        if (year) params.year = year;
        return this.withRetry(() => this.apiClient.get(ANALYTICS_ENDPOINTS.REVENUE, { params }));
    }
    async getSubscriptionAnalytics() {
        return this.withRetry(() => this.apiClient.get(ANALYTICS_ENDPOINTS.SUBSCRIPTIONS));
    }
    async getAdminRevenue(year = null) {
        const params = year ? { year } : {};
        return this.withRetry(() => this.apiClient.get(ANALYTICS_ENDPOINTS.ADMIN_REVENUE, { params }));
    }
    async getAdminSubscriptions() {
        return this.withRetry(() => this.apiClient.get(ANALYTICS_ENDPOINTS.ADMIN_SUBSCRIPTIONS));
    }
}

export const BillingAnalyticsService = new BillingAnalyticsServiceClass();
export default BillingAnalyticsService;