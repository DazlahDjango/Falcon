import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FiArrowLeft, FiCalendar, FiUser, FiGlobe, FiInfo } from 'react-icons/fi';
import { useAudit } from '../../../hooks/accounts/useAudit';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';

const AuditDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { selectedLog, loadAuditLogById, isLoading } = useAudit();

    React.useEffect(() => {
        if (id) {
            loadAuditLogById(id);
        }
    }, [id, loadAuditLogById]);

    const getSeverityClass = (severity) => {
        switch (severity) {
            case 'critical': return 'severity-critical';
            case 'error': return 'severity-error';
            case 'warning': return 'severity-warning';
            default: return 'severity-info';
        }
    };

    const formatChanges = (changes) => {
        if (!changes || Object.keys(changes).length === 0) return null;
        return (
            <div className="changes-section">
                <h4>Changes</h4>
                {Object.entries(changes).map(([field, change]) => (
                    <div key={field} className="change-item">
                        <div className="change-field">{field}</div>
                        <div className="change-values">
                            <div className="old-value">From: {change.old !== undefined ? String(change.old) : '—'}</div>
                            <div className="new-value">To: {change.new !== undefined ? String(change.new) : '—'}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (isLoading && !selectedLog) {
        return (
            <div className="audit-detail-page">
                <SkeletonLoader type="card" />
            </div>
        );
    }

    if (!selectedLog) {
        return (
            <div className="audit-detail-page">
                <div className="not-found">
                    <h2>Audit Log Not Found</h2>
                    <button className="btn btn-primary" onClick={() => navigate('/audit-logs')}>
                        Back to Audit Logs
                    </button>
                </div>
            </div>
        );
    }

    const log = selectedLog;

    return (
        <div className="audit-detail-page">
            <div className="detail-header">
                <button className="back-btn" onClick={() => navigate('/audit-logs')}>
                    <FiArrowLeft size={20} />
                    Back to Audit Logs
                </button>
            </div>

            <div className="audit-detail-card">
                <div className="audit-header">
                    <div className={`severity-badge-large ${getSeverityClass(log.severity)}`}>
                        {log.severity.toUpperCase()}
                    </div>
                    <div className="audit-action">
                        <strong>{log.action}</strong>
                        <span className="action-type">{log.action_type}</span>
                    </div>
                </div>

                <div className="audit-meta-grid">
                    <div className="meta-item">
                        <FiUser size={14} />
                        <div>
                            <label>User</label>
                            <span>{log.user_email || 'System'}</span>
                        </div>
                    </div>
                    <div className="meta-item">
                        <FiCalendar size={14} />
                        <div>
                            <label>Time</label>
                            <span>{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}</span>
                        </div>
                    </div>
                    <div className="meta-item">
                        <FiGlobe size={14} />
                        <div>
                            <label>IP Address</label>
                            <code>{log.ip_address || 'Unknown'}</code>
                        </div>
                    </div>
                </div>

                {(log.content_type || log.object_repr) && (
                    <div className="audit-object-section">
                        <FiInfo size={14} />
                        <div>
                            <label>Object</label>
                            <span>
                                {log.content_type && <code>{log.content_type}</code>}
                                {log.object_repr && <span> ({log.object_repr})</span>}
                            </span>
                        </div>
                    </div>
                )}

                {formatChanges(log.changes)}

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="metadata-section">
                        <h4>Metadata</h4>
                        <pre className="metadata-json">
                            {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="audit-footer">
                    <span>Record ID: {log.id}</span>
                    <span>Recorded: {format(new Date(log.created_at || log.timestamp), 'MMM dd, yyyy HH:mm:ss')}</span>
                </div>
            </div>
        </div>
    );
};

export default AuditDetail;