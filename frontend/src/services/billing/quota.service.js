import { BaseBillingService, withRetry } from './client';

class QuotaService extends BaseBillingService {
    constructor() {
        super('quota');
    }
    async getQuotaStatus() {
        return withRetry(() => this.apiClient.get(this.getEndpoint()));
    }
    async getQuotaLimits() {
        return withRetry(() => this.apiClient.get('/quota/limits/'));
    }
    async refreshQuotaUsage() {
        return withRetry(() => this.apiClient.post('/quota/refresh/'));
    }
    async getUsageHistory(params = {}) {
        return withRetry(() => this.apiClient.get('/quota/usage-history/', { params }));
    }
    async checkQuotaAvailability(resource, requestedAmount = 1) {
        return withRetry(() => this.apiClient.get('/quota/check/', {
            params: { resource, amount: requestedAmount }
        }));
    }
    getThresholds() {
        return {
            warning: 80,    // 80% - Show warning
            critical: 90,   // 90% - Show critical alert
            danger: 95,     // 95% - Show danger alert
        };
    }
    getAlertLevel(percentage) {
        const thresholds = this.getThresholds();
        if (percentage >= thresholds.danger) return 'danger';
        if (percentage >= thresholds.critical) return 'critical';
        if (percentage >= thresholds.warning) return 'warning';
        return 'success';
    }
}
export const quotaService = new QuotaService();
export default quotaService;