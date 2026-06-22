import React, { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import {
    FiChevronLeft, FiChevronRight, FiPlus, FiEdit, FiTrash2,
    FiLogIn, FiLogOut, FiCheckCircle, FiXCircle, FiDownload,
    FiEye, FiShield, FiAlertCircle, FiInfo, FiRefreshCw
} from 'react-icons/fi';
import AuditDetailModal from './AuditDetailModal';

const AuditTable = ({ logs, pagination, onPageChange, onRefresh }) => {
    const [selectedLog, setSelectedLog] = useState(null);

    const getSeverityClass = (severity) => {
        switch (severity) {
            case 'critical': return 'severity-critical';
            case 'error': return 'severity-error';
            case 'warning': return 'severity-warning';
            default: return 'severity-info';
        }
    };

    const getActionTypeIcon = (type) => {
        const icons = {
            create: <FiPlus size={14} />,
            update: <FiEdit size={14} />,
            delete: <FiTrash2 size={14} />,
            login: <FiLogIn size={14} />,
            logout: <FiLogOut size={14} />,
            approve: <FiCheckCircle size={14} />,
            reject: <FiXCircle size={14} />,
            export: <FiDownload size={14} />,
            view: <FiEye size={14} />,
            security: <FiShield size={14} />,
        };
        return icons[type] || <FiInfo size={14} />;
    };

    const getActionTypeColor = (type) => {
        const colors = {
            create: '#10b981',
            update: '#3b82f6',
            delete: '#ef4444',
            login: '#8b5cf6',
            logout: '#6b7280',
            approve: '#10b981',
            reject: '#ef4444',
            export: '#f59e0b',
            view: '#6b7280',
            security: '#dc2626',
        };
        return colors[type] || '#6b7280';
    };

    if (logs.length === 0) {
        return (
            <div className="audit-table-empty">
                <div className="empty-icon">📋</div>
                <h3>No Audit Logs Found</h3>
                <p>Try adjusting your filters or date range to see more results.</p>
                <button className="btn btn-secondary" onClick={onRefresh}>
                    <FiRefreshCw size={16} />
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="audit-table-container">
                <table className="audit-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Type</th>
                            <th>Severity</th>
                            <th>IP Address</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr
                                key={log.id}
                                className={`audit-row ${log.severity === 'critical' ? 'critical-row' : ''}`}
                                onClick={() => setSelectedLog(log)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td className="time-cell">
                                    <div className="time-main">
                                        {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                                    </div>
                                    <div className="time-relative">
                                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                    </div>
                                </td>
                                <td className="user-cell">
                                    <div className="user-avatar">
                                        {log.user_email?.charAt(0)?.toUpperCase() || 'S'}
                                    </div>
                                    <div className="user-info">
                                        <div className="user-name">{log.user_email || 'System'}</div>
                                    </div>
                                </td>
                                <td className="action-cell">
                                    <span
                                        className="action-icon"
                                        style={{ color: getActionTypeColor(log.action_type) }}
                                    >
                                        {getActionTypeIcon(log.action_type)}
                                    </span>
                                    <span className="action-name">{log.action}</span>
                                </td>
                                <td>
                                    <span className="action-type-badge">
                                        {log.action_type}
                                    </span>
                                </td>
                                <td>
                                    <span className={`severity-badge ${getSeverityClass(log.severity)}`}>
                                        <span className="severity-dot"></span>
                                        {log.severity}
                                    </span>
                                </td>
                                <td className="ip-cell">
                                    <code>{log.ip_address || '—'}</code>
                                </td>
                                <td className="view-cell">
                                    <button className="view-details-btn" onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}>
                                        View Details
                                        <FiChevronRight size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
                <div className="audit-pagination">
                    <button
                        className="pagination-btn"
                        disabled={pagination.current_page === 1}
                        onClick={() => onPageChange(pagination.current_page - 1)}
                    >
                        <FiChevronLeft size={16} />
                        Previous
                    </button>
                    <div className="pagination-pages">
                        {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                            let pageNum;
                            if (pagination.total_pages <= 5) {
                                pageNum = i + 1;
                            } else if (pagination.current_page <= 3) {
                                pageNum = i + 1;
                            } else if (pagination.current_page >= pagination.total_pages - 2) {
                                pageNum = pagination.total_pages - 4 + i;
                            } else {
                                pageNum = pagination.current_page - 2 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    className={`page-num ${pagination.current_page === pageNum ? 'active' : ''}`}
                                    onClick={() => onPageChange(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        className="pagination-btn"
                        disabled={pagination.current_page === pagination.total_pages}
                        onClick={() => onPageChange(pagination.current_page + 1)}
                    >
                        Next
                        <FiChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Detail Modal */}
            <AuditDetailModal
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                log={selectedLog}
            />
        </>
    );
};

export default AuditTable;