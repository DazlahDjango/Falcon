import React from 'react';
import { format } from 'date-fns';
import {
    FiUser, FiCalendar, FiGlobe, FiInfo, FiActivity,
    FiCopy, FiCheckCircle, FiX, FiShield, FiAlertTriangle
} from 'react-icons/fi';
import Modal from '../../../common/UI/Modal';

const AuditDetailModal = ({ isOpen, onClose, log }) => {
    if (!log) return null;

    const getSeverityConfig = (severity) => {
        const configs = {
            critical: { icon: <FiAlertTriangle size={20} />, class: 'critical', label: 'CRITICAL' },
            error: { icon: <FiX size={20} />, class: 'error', label: 'ERROR' },
            warning: { icon: <FiAlertTriangle size={20} />, class: 'warning', label: 'WARNING' },
            info: { icon: <FiInfo size={20} />, class: 'info', label: 'INFO' },
        };
        return configs[severity] || configs.info;
    };

    const severityConfig = getSeverityConfig(log.severity);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const formatChanges = (changes) => {
        if (!changes || Object.keys(changes).length === 0) return null;
        return (
            <div className="detail-section">
                <h4>Changes</h4>
                <div className="changes-list">
                    {Object.entries(changes).map(([field, change]) => (
                        <div key={field} className="change-item">
                            <div className="change-field">{field}</div>
                            <div className="change-values">
                                <div className="old-value">
                                    <span className="change-label">From:</span>
                                    {change.old !== undefined ? String(change.old) : '—'}
                                </div>
                                <div className="new-value">
                                    <span className="change-label">To:</span>
                                    {change.new !== undefined ? String(change.new) : '—'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Audit Log Details" size="lg">
            <div className="audit-detail-modal">
                <div className="detail-header">
                    <div className={`severity-badge-large ${severityConfig.class}`}>
                        {severityConfig.icon}
                        {severityConfig.label}
                    </div>
                    <div className="action-header">
                        <span className="action-icon-large">{log.action}</span>
                        <span className="action-type">{log.action_type}</span>
                    </div>
                </div>

                <div className="detail-section">
                    <h4>Metadata</h4>
                    <div className="meta-grid">
                        <div className="meta-item">
                            <FiUser size={14} />
                            <span className="meta-label">User:</span>
                            <span className="meta-value">{log.user_email || 'System'}</span>
                        </div>
                        <div className="meta-item">
                            <FiCalendar size={14} />
                            <span className="meta-label">Time:</span>
                            <span className="meta-value">
                                {format(new Date(log.timestamp), 'EEEE, MMMM dd, yyyy HH:mm:ss')}
                            </span>
                        </div>
                        <div className="meta-item">
                            <FiGlobe size={14} />
                            <span className="meta-label">IP Address:</span>
                            <code className="meta-value ip">{log.ip_address || 'Unknown'}</code>
                            {log.ip_address && (
                                <button
                                    className="copy-btn"
                                    onClick={() => copyToClipboard(log.ip_address)}
                                    title="Copy IP"
                                >
                                    <FiCopy size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {(log.content_type || log.object_repr) && (
                    <div className="detail-section">
                        <h4>Object Information</h4>
                        <div className="object-info">
                            <div className="object-field">
                                <span className="field-label">Content Type:</span>
                                <code>{log.content_type || '—'}</code>
                            </div>
                            <div className="object-field">
                                <span className="field-label">Object ID:</span>
                                <code>{log.object_id || '—'}</code>
                            </div>
                            <div className="object-field">
                                <span className="field-label">Representation:</span>
                                <span>{log.object_repr || '—'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {formatChanges(log.changes)}

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="detail-section">
                        <h4>Additional Metadata</h4>
                        <pre className="metadata-json">
                            {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="detail-footer">
                    <FiCalendar size={12} />
                    <span>Recorded: {format(new Date(log.created_at || log.timestamp), 'MMM dd, yyyy HH:mm:ss')}</span>
                    <span className="separator">•</span>
                    <FiShield size={12} />
                    <span>Audit ID: {log.id}</span>
                </div>
            </div>
        </Modal>
    );
};

export default AuditDetailModal;