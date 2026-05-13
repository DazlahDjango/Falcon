import { BaseBillingService, withRetry } from './client';

class WebhookService extends BaseBillingService {
    constructor() {
        super('webhooks');
    }
    async getWebhookEvents(params = {}) {
        return withRetry(() => this.apiClient.get(this.getEndpoint(), { params }));
    }
    async getWebhookEventById(id) {
        return this.getById(id);
    }
    async getWebhookEventByStripeId(stripeEventId) {
        return withRetry(() => this.apiClient.get(this.getEndpoint(`by-stripe-id/${stripeEventId}/`)));
    }
    async getFailedEvents(params = {}) {
        return this.getWebhookEvents({ ...params, is_processed: false });
    }
    async reprocessEvent(id) {
        return withRetry(() => this.apiClient.post(this.getEndpoint(`${id}/reprocess/`)));
    }
    async getWebhookStats() {
        return withRetry(() => this.apiClient.get('/webhooks/stats/'));
    }
    async cleanupOldEvents(daysToKeep = 30) {
        return withRetry(() => this.apiClient.post('/webhooks/cleanup/', { days_to_keep: daysToKeep }));
    }
}
export const webhookService = new WebhookService();
export default webhookService;