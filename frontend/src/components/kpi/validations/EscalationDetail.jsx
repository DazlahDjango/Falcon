import React, { useState } from 'react';
import { FiX, FiCheckCircle, FiUser, FiTarget, FiClock, FiMail } from 'react-icons/fi';
import KPIStatusBadge from '../common/KPIStatusBadge';

const EscalationDetail = ({ escalation, onResolve, onClose, canResolve }) => {
    const [resolution, setResolution] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleResolve = async () => {
        if (!resolution.trim()) {
            alert('Please provide a resolution');
            return;
        }
        setSubmitting(true);
        await onResolve(escalation.id, resolution);
        setSubmitting(false);
    };

    return (
        <div className="kpi-validation-modal-overlay" onClick={onClose}>
            <div className="kpi-validation-modal" onClick={(e) => e.stopPropagation()}>
                <div className="kpi-validation-modal-header">
                    <h3>Escalation Details</h3>
                    <button className="kpi-validation-modal-close" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="kpi-validation-modal-body">
                    <div className="kpi-escalation-detail">
                        <div className="kpi-escalation-detail-section">
                            <div className="kpi-escalation-detail-label">
                                <FiTarget size={12} /> KPI
                            </div>
                            <div className="kpi-escalation-detail-value">
                                {escalation.actual_kpi}
                            </div>
                        </div>
                        
                        <div className="kpi-escalation-detail-section">
                            <div className="kpi-escalation-detail-label">
                                <FiUser size={12} /> From
                            </div>
                            <div className="kpi-escalation-detail-value">
                                {escalation.escalated_by_email}
                            </div>
                        </div>
                        
                        <div className="kpi-escalation-detail-section">
                            <div className="kpi-escalation-detail-label">
                                <FiMail size={12} /> To
                            </div>
                            <div className="kpi-escalation-detail-value">
                                {escalation.escalated_to_email}
                            </div>
                        </div>
                        
                        <div className="kpi-escalation-detail-section">
                            <div className="kpi-escalation-detail-label">
                                <FiClock size={12} /> Date
                            </div>
                            <div className="kpi-escalation-detail-value">
                                {new Date(escalation.escalated_at).toLocaleString()}
                            </div>
                        </div>
                        
                        <div className="kpi-escalation-detail-section">
                            <div className="kpi-escalation-detail-label">
                                Status
                            </div>
                            <KPIStatusBadge status={escalation.status} />
                        </div>
                        
                        <div className="kpi-escalation-detail-section">
                            <div className="kpi-escalation-detail-label">
                                Reason
                            </div>
                            <div className="kpi-escalation-detail-value">
                                {escalation.reason}
                            </div>
                        </div>
                        
                        {escalation.status === 'RESOLVED' && (
                            <div className="kpi-escalation-detail-section">
                                <div className="kpi-escalation-detail-label">
                                    Resolution
                                </div>
                                <div className="kpi-escalation-detail-value">
                                    {escalation.resolution}
                                </div>
                                <div className="kpi-escalation-detail-value" style={{ fontSize: '0.75rem', color: 'var(--kpi-gray-500)' }}>
                                    Resolved by: {escalation.resolved_by_email}
                                </div>
                            </div>
                        )}
                        
                        {canResolve && escalation.status === 'PENDING' && (
                            <div className="kpi-escalation-detail-section">
                                <div className="kpi-escalation-form-group">
                                    <label className="kpi-escalation-form-label">
                                        Resolution <span style={{ color: 'var(--kpi-danger)' }}>*</span>
                                    </label>
                                    <textarea
                                        className="kpi-escalation-form-textarea"
                                        rows="4"
                                        value={resolution}
                                        onChange={(e) => setResolution(e.target.value)}
                                        placeholder="Describe how this escalation was resolved..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="kpi-validation-modal-footer">
                    <button className="kpi-confirm-cancel" onClick={onClose}>
                        Close
                    </button>
                    {canResolve && escalation.status === 'PENDING' && (
                        <button 
                            className="kpi-validation-approve-btn"
                            onClick={handleResolve}
                            disabled={submitting}
                        >
                            <FiCheckCircle size={14} />
                            {submitting ? 'Resolving...' : 'Resolve Escalation'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EscalationDetail;