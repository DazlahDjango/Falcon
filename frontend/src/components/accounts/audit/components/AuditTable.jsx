import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiPlus, FiEdit, FiTrash2, FiLock, FiLogOut, FiCheckCircle, FiXCircle, FiDownload, FiEye, FiDelete } from 'react-icons/fi';
import AuditDetail from '../AuditDetail';

const AuditTable = ({ logs, pagination, onPageChange }) => {
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
            create: <FiPlus size={16} />,
            update: <FiEdit size={16} />,
            delete: <FiTrash2 size={16} />,
            login: <FiLock size={16} />,
            logout: <FiLogOut size={16} />,
            approve: <FiCheckCircle size={16} />,
            reject: <FiXCircle size={16} />,
            export: <FiDownload size={16} />,
            view: <FiEye size={16} />
        };
        return icons[type] || <FiEye size={16} />;
    };
    if (logs.length === 0) {
        return (
            <div className="audit-table-empty">
                <p>No audit logs found</p>
            </div>
        );
    }
    return (
        <>
            <div className="audit-table-container">
                <table className="audit-table">
                    <thead>
                        <tr>
                            <th>Time</th>
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
                            <tr key={log.id} onClick={() => setSelectedLog(log)}>
                                <td className="time-cell">
                                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                </td>
                                <td>{log.user_email || 'System'}</td>
                                <td className="action-cell">
                                    <span className="action-icon">{getActionTypeIcon(log.action_type)}</span>
                                    {log.action}
                                </td>
                                <td>
                                    <span className="action-type-badge">{log.action_type}</span>
                                </td>
                                <td>
                                    <span className={`severity-badge ${getSeverityClass(log.severity)}`}>
                                        {log.severity}
                                    </span>
                                </td>
                                <td>{log.ip_address || '—'}</td>
                                <td className="view-cell">View →</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
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
                    <span className="pagination-info">
                        Page {pagination.current_page} of {pagination.total_pages}
                    </span>
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
            
            <AuditDetail
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                log={selectedLog}
            />
        </>
    );
};

export default AuditTable;