import { BillingBaseService } from './BillingBaseService';
import { WEBHOOK_ENDPOINTS } from '../../config/constants/billingApiConstants';

class WebhookServiceClass extends BillingBaseService {
    constructor() {
        super('webhook');
    }

    async getWebhookLogs(params = {}) {
        return this.withRetry(() => this.apiClient.get(WEBHOOK_ENDPOINTS.LOGS, { params }));
    }
    async retryWebhook(id) {
        return this.withRetry(() => this.apiClient.post(WEBHOOK_ENDPOINTS.RETRY(id)));
    }
}

export const WebhookService = new WebhookServiceClass();
export default WebhookService;