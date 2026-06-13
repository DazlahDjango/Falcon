import React from 'react';
import { FiX, FiUser, FiClock, FiArchive } from 'react-icons/fi';

const HistoryDetail = ({ history, onClose }) => {
    const formatSnapshot = (snapshot) => {
        if (!snapshot) return null;
        return (
            <div className="snapshot-viewer">
                {Object.entries(snapshot).map(([key, value]) => (
                    <div key={key} className="snapshot-item">
                        <span className="snapshot-key">{key}:</span>
                        <span className="snapshot-value">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                    </div>
                ))}
            </div>
        );
    };
    
    const formatChanges = (changes) => {
        if (!changes) return null;
        return (
            <div className="changes-viewer">
                {Object.entries(changes).map(([key, value]) => (
                    <div key={key} className="change-item">
                        <span className="change-key">{key}</span>
                        <div className="change-values">
                            <span className="old-value">{value.old || '-'}</span>
                            <span className="arrow">→</span>
                            <span className="new-value">{value.new || '-'}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };
    
    return (
        <div className="history-detail-modal" onClick={onClose}>
            <div className="history-detail-container" onClick={(e) => e.stopPropagation()}>
                <div className="history-detail-header">
                    <h3>Change Details</h3>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="history-detail-body">
                    <div className="detail-section">
                        <h4>Basic Information</h4>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <FiClock size={14} />
                                <span className="label">Timestamp:</span>
                                <span>{new Date(history.performed_at).toLocaleString()}</span>
                            </div>
                            <div className="detail-item">
                                <FiUser size={14} />
                                <span className="label">Performed By:</span>
                                <span>{history.performed_by_email || 'System'}</span>
                            </div>
                            <div className="detail-item">
                                <FiArchive size={14} />
                                <span className="label">Action:</span>
                                <span className={`action-badge action-${history.action?.toLowerCase()}`}>
                                    {history.action}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {history.reason && (
                        <div className="detail-section">
                            <h4>Reason</h4>
                            <p>{history.reason}</p>
                        </div>
                    )}
                    
                    {history.changes && Object.keys(history.changes).length > 0 && (
                        <div className="detail-section">
                            <h4>Changes</h4>
                            {formatChanges(history.changes)}
                        </div>
                    )}
                    
                    {history.snapshot && (
                        <div className="detail-section">
                            <h4>Full Snapshot</h4>
                            {formatSnapshot(history.snapshot)}
                        </div>
                    )}
                </div>
                
                <div className="history-detail-footer">
                    <button className="close-modal-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default HistoryDetail;