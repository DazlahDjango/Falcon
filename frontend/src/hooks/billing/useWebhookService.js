import { useCallback } from 'react';
import { WebhookService } from '../../services/billing';

export const useWebhookService = () => {
    const getWebhookLogs = useCallback(async (params = {}) => {
        return WebhookService.getWebhookLogs(params);
    }, []);

    const getWebhookStats = useCallback(async () => {
        return WebhookService.getWebhookStats();
    }, []);

    const retryWebhook = useCallback(async (id) => {
        return WebhookService.retryWebhook(id);
    }, []);

    const getRecentFailedWebhooks = useCallback(async (limit = 20) => {
        return WebhookService.getRecentFailedWebhooks(limit);
    }, []);

    const getWebhookByEventId = useCallback(async (eventId) => {
        return WebhookService.getWebhookByEventId(eventId);
    }, []);

    return {
        getWebhookLogs,
        getWebhookStats,
        retryWebhook,
        getRecentFailedWebhooks,
        getWebhookByEventId,
    };
};

export default useWebhookService;
