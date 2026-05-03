// frontend/src/components/tenant/audit/AuditLogTable.jsx
import React from 'react';
import './audit.css';

export const AuditLogTable = ({ logs, onViewDetails, loading = false }) => {
    if (loading) {
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
                                <td>>{formatTimestamp(log.timestamp || log.created_at)}</td>
                                <td>
                                    <span className={`audit-action-badge ${getActionClass(log.action)}`}>
                                        {log.action?.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    {log.user_email || log.user?.email || '-'}
                                    <div className="text-xs text-gray-400">{log.user_id || '-'}</div>
                                </td>
                                <td>>{log.resource || '-'}</td>
                                <td> className="max-w-xs truncate">{log.message || log.details?.message || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};