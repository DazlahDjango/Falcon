/**
 * Webhook Service
 * Handles webhook monitoring and management (Admin only)
 */

import { BillingBaseService } from './BillingBaseService';
import { WEBHOOK_ENDPOINTS } from '../../config/constants/billingApiConstants';

class WebhookServiceClass extends BillingBaseService {
    constructor() {
        super('webhook');
    }

    /**
     * Get webhook logs (Admin only)
     * @param {Object} params - Query parameters (event_type, processing_status, limit)
     */
    async getWebhookLogs(params = {}) {
        return this.withRetry(() => 
            this.apiClient.get(WEBHOOK_ENDPOINTS.LOGS, { params })
        );
    }

    /**
     * Retry a failed webhook (Admin only)
     * @param {string} id - Webhook log ID
     */
    async retryWebhook(id) {
        if (!id) throw new Error('Webhook ID is required');
        return this.withRetry(() => 
            this.apiClient.post(WEBHOOK_ENDPOINTS.RETRY(id))
        );
    }

    /**
     * Get webhook statistics (Admin only)
     */
    async getWebhookStats() {
        const logs = await this.getWebhookLogs({ limit: 1000 });
        const data = logs?.data || [];
        
        const stats = {
            total: data.length,
            processed: data.filter(w => w.processing_status === 'processed').length,
            failed: data.filter(w => w.processing_status === 'failed').length,
            duplicate: data.filter(w => w.processing_status === 'duplicate').length,
            pending: data.filter(w => w.processing_status === 'pending').length,
            byEventType: {},
        };
        
        data.forEach(webhook => {
            const event = webhook.event_type;
            if (!stats.byEventType[event]) {
                stats.byEventType[event] = { total: 0, processed: 0, failed: 0 };
            }
            stats.byEventType[event].total++;
            if (webhook.processing_status === 'processed') stats.byEventType[event].processed++;
            if (webhook.processing_status === 'failed') stats.byEventType[event].failed++;
        });
        
        stats.successRate = stats.total > 0 
            ? (stats.processed / stats.total) * 100 
            : 0;
        
        return stats;
    }

    /**
     * Get recent failed webhooks (Admin only)
     * @param {number} limit - Number to retrieve
     */
    async getRecentFailedWebhooks(limit = 20) {
        return this.getWebhookLogs({ processing_status: 'failed', limit });
    }

    /**
     * Get webhook by event ID (Admin only)
     * @param {string} eventId - PayStack event ID
     */
    async getWebhookByEventId(eventId) {
        const logs = await this.getWebhookLogs({ paystack_event_id: eventId });
        return logs?.data?.[0] || null;
    }
}

export const WebhookService = new WebhookServiceClass();
export default WebhookService;