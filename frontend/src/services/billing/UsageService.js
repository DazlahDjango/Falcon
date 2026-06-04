import { BillingBaseService } from './BillingBaseService';
import { USAGE_ENDPOINTS } from '../../config/constants/billingApiConstants';

class UsageServiceClass extends BillingBaseService {
    constructor() { super('usage'); }

    async trackUsage(usageType, delta = 1) {
        return this.withRetry(() => this.apiClient.post(USAGE_ENDPOINTS.TRACK, { usage_type: usageType, delta }));
    }
    async getUsageSummary() {
        return this.withRetry(() => this.apiClient.get(USAGE_ENDPOINTS.SUMMARY));
    }
    async getCurrentLimits() {
        return this.withRetry(() => this.apiClient.get(USAGE_ENDPOINTS.LIMITS));
    }
    async checkLimit(usageType, currentValue) {
        const limits = await this.getCurrentLimits();
        const limit = limits?.data?.limits?.[usageType];
        if (!limit) return { allowed: true, remaining: -1, percentage: 0 };
        const percentage = (currentValue / limit) * 100;
        return { allowed: percentage < 110, limit, current: currentValue, percentage, remaining: limit - currentValue, isSoftExceeded: percentage >= 100 && percentage < 110, isHardExceeded: percentage >= 110 };
    }
}

export const UsageService = new UsageServiceClass();
export default UsageService;