import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiDownload, FiRefreshCw, FiChevronLeft, FiChevronRight, FiEye, FiUser, FiClock, FiAlertCircle, FiCheckCircle, FiActivity } from 'react-icons/fi';
import { BillingShell } from '../common/BillingShell';
import { BillingCard } from '../shared/BillingCard';
import { StatusBadge } from '../shared/StatusBadge';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useAudit } from '../../../hooks/billing/useAudit';
import { useBillingPermissions } from '../../../hooks/billing/useBillingPermissions';
import { AuditService } from '../../../services/billing';
import { AuditDetailModal } from './AuditDetailModal';
import './audit.css';

export const AuditLogsViewer = () => {
    const { permissions } = useBillingPermissions();
    const { logs, summary, pagination, loading, fetchLogs, fetchSummary, exportLogs, applyFilters, setPage, setPageSize, filters } = useAudit({ autoFetch: false });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        if (permissions.canViewAnalytics) {
            fetchLogs({ page: pagination.page, pageSize: pagination.pageSize, filters });
            fetchSummary();
        }
    }, [pagination.page, pagination.pageSize, filters, fetchLogs, fetchSummary, permissions.canViewAnalytics]);

    const handleFilterApply = () => { applyFilters(localFilters); setShowFilters(false); };
    const handleFilterClear = () => { setLocalFilters({ startDate: null, endDate: null, action: null, resourceType: null, userEmail: null, success: null }); applyFilters({}); };
    const handleExport = async () => {
        setExporting(true);
        try {
            const response = await AuditService.exportLogs(30);
            const blob = response?.data;
            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `billing_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Failed to export audit logs:', error);
        } finally {
            setExporting(false);
        }
    };
    const handleViewDetail = (log) => { setSelectedLog(log); setShowDetail(true); };

    const getActionColor = (action) => {
        const colors = { create: '#22c55e', update: '#3b82f6', delete: '#dc2626', view: '#6b7280', payment: '#8b5cf6', refund: '#f59e0b', cancel: '#ef4444', renew: '#10b981', upgrade: '#8b5cf6', downgrade: '#f59e0b', webhook: '#06b6d4' };
        return colors[action] || '#6b7280';
    };

    if (!permissions.canViewAnalytics) return <EmptyState type="default" title="Access Denied" message="You don't have permission to view audit logs." />;
    if (loading && logs.length === 0) return <LoadingSkeleton type="table" count={1} />;

    const stats = [
        { label: 'Total Actions', value: summary?.total_actions || 0, icon: FiActivity, color: '#3b82f6' },
        { label: 'Successful', value: (summary?.total_actions || 0) - (summary?.failed_actions || 0), icon: FiCheckCircle, color: '#22c55e' },
        { label: 'Failed', value: summary?.failed_actions || 0, icon: FiAlertCircle, color: '#dc2626' },
        { label: 'Success Rate', value: `${summary?.success_rate || 0}%`, icon: FiActivity, color: '#8b5cf6' }
    ];

    return (
        <BillingShell title="Audit Logs" subtitle="Track all billing activities and security events">
            <div className="audit-container">
                <div className="audit-stats-grid">
                    {stats.map((stat, idx) => (<div key={idx} className="audit-stat-card" style={{ borderTopColor: stat.color }}><div className="audit-stat-header"><span className="audit-stat-label">{stat.label}</span><stat.icon className="audit-stat-icon" style={{ color: stat.color }} /></div><div className="audit-stat-value">{stat.value}</div></div>))}
                </div>

                <BillingCard title="Audit Trail" icon={<FiActivity />} headerAction={
                    <div className="audit-header-actions">
                        <button className="audit-filter-btn" onClick={() => setShowFilters(!showFilters)}><FiFilter /> Filter</button>
                        <button className="audit-export-btn" onClick={handleExport} disabled={exporting}><FiDownload /> {exporting ? 'Exporting...' : 'Export'}</button>
                        <button className="audit-refresh-btn" onClick={() => fetchLogs({ page: pagination.page, pageSize: pagination.pageSize, filters })}><FiRefreshCw /> Refresh</button>
                    </div>
                }>
                    {showFilters && (<div className="audit-filters-panel"><div className="filter-row"><div className="filter-group"><label>Action</label><select value={localFilters.action || ''} onChange={(e) => setLocalFilters({ ...localFilters, action: e.target.value || null })}><option value="">All Actions</option><option value="create">Create</option><option value="update">Update</option><option value="delete">Delete</option><option value="payment">Payment</option><option value="refund">Refund</option><option value="cancel">Cancel</option></select></div><div className="filter-group"><label>Resource Type</label><select value={localFilters.resourceType || ''} onChange={(e) => setLocalFilters({ ...localFilters, resourceType: e.target.value || null })}><option value="">All Resources</option><option value="subscription">Subscription</option><option value="invoice">Invoice</option><option value="transaction">Transaction</option><option value="plan">Plan</option><option value="payment_method">Payment Method</option></select></div><div className="filter-group"><label>User Email</label><input type="email" placeholder="user@example.com" value={localFilters.userEmail || ''} onChange={(e) => setLocalFilters({ ...localFilters, userEmail: e.target.value || null })} /></div><div className="filter-group"><label>From Date</label><input type="date" value={localFilters.startDate || ''} onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value || null })} /></div><div className="filter-group"><label>To Date</label><input type="date" value={localFilters.endDate || ''} onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value || null })} /></div><div className="filter-actions"><button className="filter-apply" onClick={handleFilterApply}>Apply</button><button className="filter-clear" onClick={handleFilterClear}>Clear</button></div></div></div>)}

                    {logs.length === 0 ? <EmptyState type="default" title="No audit logs found" /> : (
                        <div className="audit-table-container">
                            <table className="audit-table">
                                <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Resource</th><th>Resource ID</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>{logs.map(log => (<tr key={log.id} className={!log.success ? 'row-failed' : ''}>
                                    <td className="audit-timestamp">{new Date(log.created_at).toLocaleString()}</td>
                                    <td className="audit-user"><div className="user-info"><FiUser /> {log.user_email}</div><div className="user-role">{log.user_role}</div></td>
                                    <td><span className="audit-action" style={{ background: `${getActionColor(log.action)}15`, color: getActionColor(log.action) }}>{log.action}</span></td>
                                    <td><span className="audit-resource">{log.resource_type}</span></td>
                                    <td className="audit-resource-id">{log.resource_id?.slice(-12)}</td>
                                    <td>{log.success ? <StatusBadge type="transaction" status="success" size="sm" /> : <StatusBadge type="transaction" status="failed" size="sm" />}</td>
                                    <td><button className="audit-view-btn" onClick={() => handleViewDetail(log)}><FiEye /></button></td>
                                </tr>))}</tbody>
                            </table>
                        </div>
                    )}

                    {pagination.total > pagination.pageSize && (<div className="audit-pagination"><button disabled={pagination.page === 1} onClick={() => setPage(pagination.page - 1)}><FiChevronLeft /></button><span>Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}</span><button disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)} onClick={() => setPage(pagination.page + 1)}><FiChevronRight /></button></div>)}
                </BillingCard>
            </div>
            {showDetail && selectedLog && <AuditDetailModal log={selectedLog} onClose={() => setShowDetail(false)} />}
        </BillingShell>
    );
};

export default AuditLogsViewer;