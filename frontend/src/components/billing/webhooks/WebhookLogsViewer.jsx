import React, { useState, useCallback, useEffect } from 'react';
import { FiActivity, FiRefreshCw, FiFilter, FiSearch, FiEye, FiRotateCcw, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { BillingShell } from '../common/BillingShell';
import { BillingCard } from '../shared/BillingCard';
import { StatusBadge } from '../shared/StatusBadge';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useWebhookService } from '../../../hooks/billing/useWebhookService';
import { useBillingPermissions } from '../../../hooks/billing/useBillingPermissions';
import { WebhookDetailModal } from './WebhookDetailModal';
import './webhooks.css';

export const WebhookLogsViewer = () => {
    const { permissions } = useBillingPermissions();
    const { logs, pagination, loading, stats, fetchLogs, retry, clearWebhookError } = useWebhookService();
    const [selectedLog, setSelectedLog] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [filters, setFilters] = useState({ eventType: '', status: '', dateFrom: '', dateTo: '' });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (permissions.canViewWebhookLogs) {
            fetchLogs({ page: pagination.page, pageSize: pagination.pageSize, ...filters });
        }
    }, [pagination.page, pagination.pageSize, filters, fetchLogs, permissions.canViewWebhookLogs]);

    const handleRetry = async (id) => {
        await retry(id);
        fetchLogs({ page: pagination.page, pageSize: pagination.pageSize, ...filters });
    };

    const handleViewDetail = (log) => {
        setSelectedLog(log);
        setShowDetail(true);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({ eventType: '', status: '', dateFrom: '', dateTo: '' });
    };

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

    const getEventTypeColor = (eventType) => {
        if (eventType.includes('success')) return 'success';
        if (eventType.includes('failed')) return 'error';
        if (eventType.includes('create')) return 'info';
        if (eventType.includes('disable')) return 'warning';
        return 'secondary';
    };

    if (!permissions.canViewWebhookLogs) {
        return <EmptyState type="default" title="Access Denied" message="You don't have permission to view webhook logs." />;
    }

    return (
        <BillingShell title="Webhook Logs" subtitle="Monitor and manage incoming webhook events from PayStack">
            <div className="webhooks-container">
                <div className="webhooks-stats-grid">
                    <div className="webhook-stat-card">
                        <div className="webhook-stat-icon total"><FiActivity /></div>
                        <div className="webhook-stat-info"><span className="webhook-stat-value">{stats?.total || 0}</span><span className="webhook-stat-label">Total Events</span></div>
                    </div>
                    <div className="webhook-stat-card">
                        <div className="webhook-stat-icon success"><FiCheckCircle /></div>
                        <div className="webhook-stat-info"><span className="webhook-stat-value">{stats?.processed || 0}</span><span className="webhook-stat-label">Processed</span></div>
                    </div>
                    <div className="webhook-stat-card">
                        <div className="webhook-stat-icon failed"><FiXCircle /></div>
                        <div className="webhook-stat-info"><span className="webhook-stat-value">{stats?.failed || 0}</span><span className="webhook-stat-label">Failed</span></div>
                    </div>
                    <div className="webhook-stat-card">
                        <div className="webhook-stat-icon pending"><FiClock /></div>
                        <div className="webhook-stat-info"><span className="webhook-stat-value">{stats?.pending || 0}</span><span className="webhook-stat-label">Pending</span></div>
                    </div>
                    <div className="webhook-stat-card">
                        <div className="webhook-stat-icon rate"><FiAlertCircle /></div>
                        <div className="webhook-stat-info"><span className="webhook-stat-value">{stats?.success_rate?.toFixed(1) || 0}%</span><span className="webhook-stat-label">Success Rate</span></div>
                    </div>
                </div>

                <BillingCard title="Webhook Events" icon={<FiRefreshCw />} headerAction={
                    <div className="webhooks-header-actions">
                        <button className="webhook-filter-btn" onClick={() => setShowFilters(!showFilters)}><FiFilter /> Filter</button>
                        <button className="webhook-refresh-btn" onClick={() => fetchLogs({ page: pagination.page, pageSize: pagination.pageSize, ...filters })}><FiRefreshCw /> Refresh</button>
                    </div>
                }>
                    {showFilters && (
                        <div className="webhook-filters-panel">
                            <div className="filter-row">
                                <div className="filter-group"><label>Event Type</label><select value={filters.eventType} onChange={(e) => handleFilterChange('eventType', e.target.value)}><option value="">All Events</option><option value="charge.success">Charge Success</option><option value="subscription.create">Subscription Create</option><option value="subscription.disable">Subscription Disable</option><option value="subscription.enable">Subscription Enable</option><option value="invoice.create">Invoice Create</option><option value="invoice.update">Invoice Update</option><option value="invoice.payment_failed">Payment Failed</option></select></div>
                                <div className="filter-group"><label>Status</label><select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}><option value="">All Status</option><option value="processed">Processed</option><option value="failed">Failed</option><option value="pending">Pending</option><option value="duplicate">Duplicate</option></select></div>
                                <div className="filter-group"><label>From Date</label><input type="date" value={filters.dateFrom} onChange={(e) => handleFilterChange('dateFrom', e.target.value)} /></div>
                                <div className="filter-group"><label>To Date</label><input type="date" value={filters.dateTo} onChange={(e) => handleFilterChange('dateTo', e.target.value)} /></div>
                                <div className="filter-actions"><button className="filter-clear" onClick={clearFilters}>Clear Filters</button></div>
                            </div>
                        </div>
                    )}

                    {loading ? <LoadingSkeleton type="table" count={1} /> : logs.length === 0 ? <EmptyState type="default" title="No webhook events found" message="No webhook events match your filters." /> : (
                        <div className="webhooks-table-container">
                            <table className="webhooks-table">
                                <thead>
                                    <tr><th>Timestamp</th><th>Event Type</th><th>Reference</th><th>Status</th><th>Retries</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {logs.map(log => (
                                        <tr key={log.id} className={log.processing_status === 'failed' ? 'row-failed' : log.processing_status === 'pending' ? 'row-pending' : ''}>
                                            <td className="webhook-timestamp">{new Date(log.created_at).toLocaleString()}</td>
                                            <td><StatusBadge type="transaction" status={getEventTypeColor(log.event_type)} size="sm" /> <span className="webhook-event-name">{getEventTypeLabel(log.event_type)}</span></td>
                                            <td className="webhook-reference">{log.paystack_event_id?.slice(-12)}</td>
                                            <td><StatusBadge type="transaction" status={log.processing_status === 'processed' ? 'success' : log.processing_status === 'failed' ? 'failed' : 'pending'} size="sm" /></td>
                                            <td>{log.retry_count}/{log.max_retries}</td>
                                            <td className="webhook-actions">
                                                <button className="webhook-action-btn" onClick={() => handleViewDetail(log)} title="View Details"><FiEye /></button>
                                                {log.processing_status === 'failed' && log.retry_count < log.max_retries && <button className="webhook-action-btn retry" onClick={() => handleRetry(log.id)} title="Retry"><FiRotateCcw /></button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {pagination.total > pagination.pageSize && (
                        <div className="webhooks-pagination">
                            <button disabled={pagination.page === 1} onClick={() => fetchLogs({ page: pagination.page - 1, pageSize: pagination.pageSize, ...filters })}><FiChevronLeft /></button>
                            <span>Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)} ({pagination.total} total)</span>
                            <button disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)} onClick={() => fetchLogs({ page: pagination.page + 1, pageSize: pagination.pageSize, ...filters })}><FiChevronRight /></button>
                        </div>
                    )}
                </BillingCard>
            </div>

            {showDetail && selectedLog && <WebhookDetailModal webhook={selectedLog} onClose={() => setShowDetail(false)} onRetry={() => { handleRetry(selectedLog.id); setShowDetail(false); }} />}
        </BillingShell>
    );
};

export default WebhookLogsViewer;