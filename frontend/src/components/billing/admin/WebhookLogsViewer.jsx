import React, { useState, useEffect } from 'react';
import { FiActivity, FiRotateCcw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { BillingShell } from '../common/BillingShell';
import { BillingCard } from '../shared/BillingCard';
import { StatusBadge } from '../shared/StatusBadge';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useWebhookService } from '../../../hooks/billing';
import './admin.css';

export const WebhookLogsViewer = () => {
    const { logs, pagination, stats, loading, fetchLogs, retry, clearWebhookError } = useWebhookService();
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const page = pagination?.page || 1;
        const pageSize = pagination?.pageSize || 20;
        fetchLogs({ page, pageSize, processing_status: filter !== 'all' ? filter : undefined });
    }, [filter, pagination?.page, pagination?.pageSize, fetchLogs]);

    const handleRetry = async (webhookId) => {
        await retry(webhookId);
        const page = pagination?.page || 1;
        const pageSize = pagination?.pageSize || 20;
        fetchLogs({ page, pageSize, processing_status: filter !== 'all' ? filter : undefined });
    };

    const filters = [
        { value: 'all', label: 'All', color: '#6b7280' },
        { value: 'processed', label: 'Processed', color: '#22c55e' },
        { value: 'failed', label: 'Failed', color: '#dc2626' },
        { value: 'pending', label: 'Pending', color: '#f59e0b' },
        { value: 'duplicate', label: 'Duplicate', color: '#8b5cf6' },
    ];

    const getEventTypeLabel = (eventType) => {
        const labels = {
            'charge.success': 'Charge Success',
            'subscription.create': 'Subscription Created',
            'subscription.disable': 'Subscription Disabled',
            'subscription.enable': 'Subscription Enabled',
            'invoice.create': 'Invoice Created',
            'invoice.update': 'Invoice Updated',
            'invoice.payment_failed': 'Payment Failed'
        };
        return labels[eventType] || eventType;
    };

    if (loading && !logs?.length) return <LoadingSkeleton type="table" count={1} />;

    const safeLogs = logs || [];
    const safeStats = stats || { total: 0, processed: 0, failed: 0, pending: 0, success_rate: 0 };

    return (
        <BillingShell title="Webhook Logs" subtitle="Monitor and manage incoming webhook events">
            <div className="webhooks-container">
                <div className="webhooks-stats-grid">
                    <div className="webhook-stat-card"><div className="webhook-stat-icon total">📡</div><div className="webhook-stat-info"><span className="webhook-stat-value">{safeStats.total || 0}</span><span className="webhook-stat-label">Total Events</span></div></div>
                    <div className="webhook-stat-card"><div className="webhook-stat-icon success">✅</div><div className="webhook-stat-info"><span className="webhook-stat-value">{safeStats.processed || 0}</span><span className="webhook-stat-label">Processed</span></div></div>
                    <div className="webhook-stat-card"><div className="webhook-stat-icon failed">❌</div><div className="webhook-stat-info"><span className="webhook-stat-value">{safeStats.failed || 0}</span><span className="webhook-stat-label">Failed</span></div></div>
                    <div className="webhook-stat-card"><div className="webhook-stat-icon pending">⏳</div><div className="webhook-stat-info"><span className="webhook-stat-value">{safeStats.pending || 0}</span><span className="webhook-stat-label">Pending</span></div></div>
                    <div className="webhook-stat-card"><div className="webhook-stat-icon rate">📊</div><div className="webhook-stat-info"><span className="webhook-stat-value">{safeStats.success_rate?.toFixed(1) || 0}%</span><span className="webhook-stat-label">Success Rate</span></div></div>
                </div>

                <BillingCard title="Webhook Events" icon={<FiActivity />}>
                    <div className="webhook-filters">
                        {filters.map(f => (
                            <button key={f.value} className={`webhook-filter-btn ${filter === f.value ? 'active' : ''}`} onClick={() => setFilter(f.value)} style={{ borderColor: filter === f.value ? f.color : '#e5e7eb', background: filter === f.value ? `${f.color}10` : 'transparent' }}>
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {safeLogs.length === 0 ? <EmptyState type="default" title="No webhook events" message="No webhook events match your filters." /> : (
                        <div className="webhooks-table-container">
                            <table className="webhooks-table">
                                <thead><tr><th>Timestamp</th><th>Event Type</th><th>Reference</th><th>Status</th><th>Retries</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {safeLogs.map(log => (
                                        <tr key={log.id} className={log.processing_status === 'failed' ? 'row-failed' : log.processing_status === 'pending' ? 'row-pending' : ''}>
                                            <td className="webhook-timestamp">{new Date(log.created_at).toLocaleString()}</td>
                                            <td><StatusBadge type="transaction" status={log.event_type === 'charge.success' ? 'success' : log.event_type === 'invoice.payment_failed' ? 'failed' : 'info'} size="sm" /> {getEventTypeLabel(log.event_type)}</td>
                                            <td className="webhook-reference">{log.paystack_event_id?.slice(-12)}</td>
                                            <td><StatusBadge type="transaction" status={log.processing_status === 'processed' ? 'success' : log.processing_status === 'failed' ? 'failed' : 'pending'} size="sm" /></td>
                                            <td>{log.retry_count}/{log.max_retries || 3}</td>
                                            <td className="webhook-actions">
                                                <button className="webhook-action-btn" onClick={() => handleRetry(log.id)} disabled={log.processing_status !== 'failed'} title="Retry"><FiRotateCcw /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {pagination?.total > pagination?.pageSize && (
                        <div className="webhooks-pagination">
                            <button disabled={pagination.page === 1} onClick={() => { fetchLogs({ page: pagination.page - 1, pageSize: pagination.pageSize, processing_status: filter !== 'all' ? filter : undefined }); }}><FiChevronLeft /></button>
                            <span>Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)} ({pagination.total} total)</span>
                            <button disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)} onClick={() => { fetchLogs({ page: pagination.page + 1, pageSize: pagination.pageSize, processing_status: filter !== 'all' ? filter : undefined }); }}><FiChevronRight /></button>
                        </div>
                    )}
                </BillingCard>
            </div>
        </BillingShell>
    );
};

export default WebhookLogsViewer;