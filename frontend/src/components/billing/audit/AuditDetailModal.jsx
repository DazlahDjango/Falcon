import React, { useState } from 'react';
import { FiX, FiCopy, FiCheck } from 'react-icons/fi';
import { StatusBadge } from '../shared/StatusBadge';
import './audit.css';

export const AuditDetailModal = ({ log, onClose }) => {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('details');

    const copyToClipboard = (text) => { navigator.clipboard.writeText(JSON.stringify(text, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    const formatJSON = (data) => { try { return JSON.stringify(data, null, 2); } catch { return String(data); } };

    return (
        <div className="audit-modal-overlay" onClick={onClose}>
            <div className="audit-modal" onClick={(e) => e.stopPropagation()}>
                <div className="audit-modal-header"><h3>Audit Event Details</h3><button className="close-btn" onClick={onClose}><FiX /></button></div>
                <div className="audit-modal-tabs"><button className={`tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Details</button><button className={`tab ${activeTab === 'changes' ? 'active' : ''}`} onClick={() => setActiveTab('changes')}>Changes</button><button className={`tab ${activeTab === 'metadata' ? 'active' : ''}`} onClick={() => setActiveTab('metadata')}>Metadata</button></div>
                <div className="audit-modal-body">
                    {activeTab === 'details' && (<div className="audit-details"><div className="detail-row"><span className="label">Timestamp:</span><span className="value">{new Date(log.created_at).toLocaleString()}</span></div><div className="detail-row"><span className="label">User:</span><span className="value">{log.user_email} ({log.user_role})</span></div><div className="detail-row"><span className="label">IP Address:</span><span className="value">{log.user_ip || 'N/A'}</span></div><div className="detail-row"><span className="label">Action:</span><span className="value">{log.action}</span></div><div className="detail-row"><span className="label">Resource Type:</span><span className="value">{log.resource_type}</span></div><div className="detail-row"><span className="label">Resource ID:</span><span className="value mono">{log.resource_id}</span><button className="copy-btn" onClick={() => copyToClipboard(log.resource_id)}>{copied ? <FiCheck /> : <FiCopy />}</button></div><div className="detail-row"><span className="label">Status:</span><span className="value">{log.success ? <StatusBadge type="transaction" status="success" size="sm" /> : <StatusBadge type="transaction" status="failed" size="sm" />}</span></div>{log.error_message && <div className="detail-row error"><span className="label">Error:</span><span className="value">{log.error_message}</span></div>}</div>)}
                    {activeTab === 'changes' && (<div className="audit-changes"><div className="changes-header"><h4>State Changes</h4><button className="copy-btn" onClick={() => copyToClipboard(log.changes)}><FiCopy /></button></div><pre className="changes-content">{formatJSON(log.changes)}</pre></div>)}
                    {activeTab === 'metadata' && (<div className="audit-metadata"><div className="metadata-header"><h4>Metadata</h4><button className="copy-btn" onClick={() => copyToClipboard(log.metadata)}><FiCopy /></button></div><pre className="metadata-content">{formatJSON(log.metadata)}</pre></div>)}
                </div>
                <div className="audit-modal-footer"><button className="close-modal-btn" onClick={onClose}>Close</button></div>
            </div>
        </div>
    );
};

export default AuditDetailModal;