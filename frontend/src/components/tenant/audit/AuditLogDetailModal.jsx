// frontend/src/components/tenant/audit/AuditLogDetailModal.jsx
import React from 'react';
import './audit.css';

export const AuditLogDetailModal = ({ isOpen, onClose, log }) => {
    if (!isOpen || !log) return null;

    const getActionClass = (action) => {
        const actionLower = action?.toLowerCase();
        if (actionLower === 'create') return 'audit-action-create';
        if (actionLower === 'update') return 'audit-action-update';
        if (actionLower === 'delete') return 'audit-action-delete';
        if (actionLower === 'suspend') return 'audit-action-suspend';
        if (actionLower === 'activate') return 'audit-action-activate';
        return 'audit-action-create';
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="audit-modal-overlay" onClick={onClose}>
            <div className="audit-modal" onClick={(e) => e.stopPropagation()}>
                <div className="audit-modal-header">
                    <h3 className="audit-modal-title">Audit Log Details</h3>
                    <button onClick={onClose} className="audit-modal-close">✕</button>
                </div>

                <div className="audit-modal-body">
                    <div className="audit-detail-section">
                        <div className="audit-detail-label">Action</div>
                        <div className="audit-detail-value">
                            <span className={`audit-action-badge ${getActionClass(log.action)}`}>
                                {log.action?.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="audit-detail-section">
                        <div className="audit-detail-label">Timestamp</div>
                        <div className="audit-detail-value">{formatTimestamp(log.timestamp || log.created_at)}</div>
                    </div>

                    <div className="audit-detail-section">
                        <div className="audit-detail-label">User</div>
                        <div className="audit-detail-value">
                            {log.user_email || log.user?.email || log.user_id || '-'}
                            {log.user_id && log.user_email && (
                                <div className="text-xs text-gray-400 mt-1">ID: {log.user_id}</div>
                            )}
                        </div>
                    </div>

                    <div className="audit-detail-section">
                        <div className="audit-detail-label">Resource</div>
                        <div className="audit-detail-value">
                            {log.resource || '-'}
                            {log.resource_id && (
                                <div className="text-xs text-gray-400 mt-1">ID: {log.resource_id}</div>
                            )}
                        </div>
                    </div>

                    <div className="audit-detail-section">
                        <div className="audit-detail-label">Message</div>
                        <div className="audit-detail-value">{log.message || '-'}</div>
                    </div>

                    {log.details && (
                        <div className="audit-detail-section">
                            <div className="audit-detail-label">Additional Details</div>
                            <pre className="audit-detail-json">
                                {typeof log.details === 'string'
                                    ? log.details
                                    : JSON.stringify(log.details, null, 2)}
                            </pre>
                        </div>
                    )}

                    {log.ip_address && (
                        <div className="audit-detail-section">
                            <div className="audit-detail-label">IP Address</div>
                            <div className="audit-detail-value">{log.ip_address}</div>
                        </div>
                    )}

                    {log.user_agent && (
                        <div className="audit-detail-section">
                            <div className="audit-detail-label">User Agent</div>
                            <div className="audit-detail-value text-xs font-mono break-all">{log.user_agent}</div>
                        </div>
                    )}
                </div>

                <div className="audit-modal-footer">
                    <button onClick={onClose} className="audit-filter-btn audit-filter-btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};