import React, { useState, useEffect } from 'react';
import { WebhookLogsList } from '../webhooks/WebhookLogsList';
import { WebhookStats } from '../webhooks/WebhookStats';
import { useWebhookService } from '../../../hooks/billing';

export const WebhookLogsViewer = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { getWebhookLogs, getWebhookStats, retryWebhook } = useWebhookService();

    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [logsData, statsData] = await Promise.all([
                getWebhookLogs({ processing_status: filter !== 'all' ? filter : undefined }),
                getWebhookStats(),
            ]);
            setLogs(logsData?.data || []);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch webhook data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async (webhookId) => {
        await retryWebhook(webhookId);
        await fetchData();
    };

    const filters = [
        { value: 'all', label: 'All' },
        { value: 'processed', label: 'Processed' },
        { value: 'failed', label: 'Failed' },
        { value: 'pending', label: 'Pending' },
        { value: 'duplicate', label: 'Duplicate' },
    ];

    return (
        <div className="webhook-logs-viewer">
            <div className="viewer-header">
                <h3>Webhook Events</h3>
                <div className="filter-tabs">
                    {filters.map(f => (
                        <button
                            key={f.value}
                            className={`filter-tab ${filter === f.value ? 'active' : ''}`}
                            onClick={() => setFilter(f.value)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <WebhookStats stats={stats} loading={loading} />

            <WebhookLogsList 
                logs={logs}
                loading={loading}
                onRetry={handleRetry}
            />
        </div>
    );
};

export default WebhookLogsViewer;