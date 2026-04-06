import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiArrowLeft, FiCalendar, FiUser, FiGlobe, FiInfo } from 'react-icons/fi';
import { format } from 'date-fns';
import Modal from '../../common/UI/Modal';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';

const AuditDetail = ({ isOpen, onClose, log }) => {
    const navigate = useNavigate();
    if (!log) return null;
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
                            <div className="old-value">Frome: {change.old || '—'}</div>
                            <div className="new-value">To: {change.new || '—'}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Audit Log Details" size="lg">
            <div className="audit-detail">
                <div className="audit-header">
                    <div className={`severity-badge ${getSeverityClass(log.severity)}`}>
                        {log.severity.toUpperCase()}
                    </div>
                    <div className="audit-action">
                        <strong>{log.action}</strong>
                        <span className="action-type">{log.action_type}</span>
                    </div>
                </div>
                
                <div className="audit-meta">
                    <div className="meta-item">
                        <FiUser size={14} />
                        <span>User: {log.user_email || 'System'}</span>
                    </div>
                    <div className="meta-item">
                        <FiCalendar size={14} />
                        <span>Time: {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}</span>
                    </div>
                    <div className="meta-item">
                        <FiGlobe size={14} />
                        <span>IP: {log.ip_address || 'Unknown'}</span>
                    </div>
                </div>
                
                {log.object_repr && (
                    <div className="audit-object">
                        <FiInfo size={14} />
                        <span>Object: {log.content_type} ({log.object_repr})</span>
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
            </div>
        </Modal>
    );
};
export default AuditDetail;