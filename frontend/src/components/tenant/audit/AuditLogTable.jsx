// frontend/src/components/tenant/audit/AuditLogTable.jsx
import React from 'react';
import './audit.css';

export const AuditLogTable = ({ 
    logs, 
    onViewDetails, 
    loading = false,
    pagination = {},
    onPageChange,
    onPageSizeChange
}) => {
    if (loading && (!logs || logs.length === 0)) {
        return (
            <div className="audit-table-container">
                <div className="text-center p-8 text-gray-500">Loading audit logs...</div>
            </div>
        );
    }

    if (!logs || logs.length === 0) {
        return (
            <div className="audit-table-container">
                <div className="text-center p-8 text-gray-500">No audit logs found</div>
            </div>
        );
    }

    const getActionClass = (action) => {
        const actionLower = action?.toLowerCase();
        if (actionLower === 'create') return 'audit-action-create';
        if (actionLower === 'update' || actionLower === 'edit') return 'audit-action-update';
        if (actionLower === 'delete') return 'audit-action-delete';
        if (actionLower === 'suspend') return 'audit-action-suspend';
        if (actionLower === 'activate') return 'audit-action-activate';
        if (actionLower === 'login') return 'audit-action-login';
        if (actionLower === 'logout') return 'audit-action-logout';
        return 'audit-action-create';
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <div className="audit-table-container">
            <div className="overflow-x-auto">
                <table className="audit-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Action</th>
                            <th>User</th>
                            <th>Resource</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id} onClick={() => onViewDetails?.(log.id)}>
                                <td>{formatTimestamp(log.timestamp || log.created_at)}</td>
                                <td>
                                    <span className={`audit-action-badge ${getActionClass(log.action)}`}>
                                        {log.action?.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    {log.user_email || log.user?.email || '-'}
                                    <div className="text-xs text-gray-400">{log.user_id || '-'}</div>
                                </td>
                                <td>{log.resource || '-'}</td>
                                <td className="max-w-xs truncate">{log.message || log.details?.message || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {logs && logs.length > 0 && onPageChange && (
                <div className="org-pagination" style={{ marginTop: '16px' }}>
                    <div className="org-pagination-info">
                        Showing {logs.length} of {pagination.total || logs.length} logs
                    </div>
                    <div className="org-pagination-controls">
                        <select
                            value={pagination.pageSize || 20}
                            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                            className="org-pagination-select"
                            disabled={loading}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <button
                            className={`org-pagination-btn ${ (pagination.page || 1) <= 1 ? 'org-pagination-btn-disabled' : ''}`}
                            onClick={() => onPageChange((pagination.page || 1) - 1)}
                            disabled={(pagination.page || 1) <= 1 || loading}
                        >
                            Previous
                        </button>
                        {[...Array(Math.min(pagination.totalPages || 1, 5))].map((_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    className={`org-pagination-btn ${pageNum === (pagination.page || 1) ? 'org-pagination-btn-active' : ''}`}
                                    onClick={() => onPageChange(pageNum)}
                                    disabled={loading}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        {(pagination.totalPages || 1) > 5 && (
                            <span className="org-pagination-info">...</span>
                        )}
                        <button
                            className={`org-pagination-btn ${(pagination.page || 1) >= (pagination.totalPages || 1) ? 'org-pagination-btn-disabled' : ''}`}
                            onClick={() => onPageChange((pagination.page || 1) + 1)}
                            disabled={(pagination.page || 1) >= (pagination.totalPages || 1) || loading}
                        >
                            Next
                        </button>
                        <span className="org-pagination-info">
                            Page {pagination.page || 1} of {pagination.totalPages || 1}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};