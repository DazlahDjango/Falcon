import { BaseBillingService, withRetry } from './client';

class FeatureService extends BaseBillingService {
    constructor() {
        super('features');
    }
    async getAvailableFeatures() {
        return withRetry(() => this.apiClient.get('/features/'));
    }
    async checkFeature(featureName) {
        return withRetry(() => this.apiClient.get(`/features/${featureName}/`));
    }
    async getFeatureLimits(featureName) {
        return withRetry(() => this.apiClient.get(`/features/${featureName}/limits/`));
    }
    async getFeaturePlanRequirement(featureName) {
        return withRetry(() => this.apiClient.get(`/features/${featureName}/plan/`));
    }
    async getFeatureFlags() {
        return withRetry(() => this.apiClient.get('/features/flags/'));
    }
}
export const featureService = new FeatureService();
export default featureService;