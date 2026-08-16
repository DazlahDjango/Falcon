import React, { useState } from 'react';
import { FiCheckCircle, FiXCircle, FiFileText, FiClock, FiUser, FiMessageSquare, FiAlertCircle } from 'react-icons/fi';
import KPIStatusBadge from '../common/KPIStatusBadge';
import RejectionReasonSelect from './RejectionReasonSelect';
import ValidationDetail from './ValidationDetail';

const ValidationQueue = ({ pendingValidations = [], onApprove, onReject, loading }) => {
    const [selectedValidation, setSelectedValidation] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('MISSING_EVIDENCE');
    const [rejectionComment, setRejectionComment] = useState('');

    const handleRejectSubmit = (id) => {
        if (!rejectionComment.trim()) {
            alert('Please enter a rejection comment for the team member.');
            return;
        }
        onReject && onReject(id, { reason: rejectionReason, comment: rejectionComment });
        setRejectingId(null);
        setRejectionComment('');
    };

    if (loading) {
        return <div className="loading-state">Loading pending validations...</div>;
    }

    if (!pendingValidations || pendingValidations.length === 0) {
        return (
            <div className="empty-queue-card">
                <FiCheckCircle size={36} color="var(--kpi-success)" />
                <h4>Approval Queue Clear!</h4>
                <p>All direct-report monthly actual submissions have been validated.</p>
            </div>
        );
    }

    return (
        <div className="validation-queue-container">
            <div className="queue-header">
                <h3>Direct Reports Approval Queue ({pendingValidations.length})</h3>
                <span className="queue-badge">Action Required</span>
            </div>

            <div className="validation-cards-grid">
                {pendingValidations.map((item) => (
                    <div key={item.id} className="validation-item-card">
                        <div className="card-top">
                            <div className="user-info">
                                <FiUser className="icon" />
                                <div>
                                    <strong>{item.user_name || item.user_email || 'Direct Report'}</strong>
                                    <span className="user-role">{item.department_name || 'Team Member'}</span>
                                </div>
                            </div>
                            <KPIStatusBadge status={item.status || 'PENDING'} />
                        </div>

                        <div className="card-metrics">
                            <div className="metric-row">
                                <span className="label">KPI:</span>
                                <span className="value font-medium">{item.kpi_name || item.kpi_code}</span>
                            </div>
                            <div className="metric-row">
                                <span className="label">Period:</span>
                                <span className="value"><FiClock size={12} /> {item.period || item.month_year || 'Current Period'}</span>
                            </div>
                            <div className="metric-row highlight">
                                <span className="label">Actual Entered:</span>
                                <span className="value actual-val">{Number(item.actual_value || 0).toLocaleString()} {item.unit || ''}</span>
                            </div>
                        </div>

                        {(item.evidence_url || item.file_url || item.evidence) && (
                            <div className="evidence-attachment-pill">
                                <FiFileText size={14} />
                                <a 
                                    href={item.evidence_url || item.file_url || item.evidence} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    View Attached Evidence File ↗
                                </a>
                            </div>
                        )}

                        {item.notes && (
                            <div className="item-notes">
                                <FiMessageSquare size={12} />
                                <span>"{item.notes}"</span>
                            </div>
                        )}

                        {rejectingId === item.id ? (
                            <div className="rejection-box">
                                <label className="block text-xs font-semibold mb-1">Rejection Reason</label>
                                <RejectionReasonSelect 
                                    value={rejectionReason} 
                                    onChange={setRejectionReason} 
                                />
                                <textarea
                                    className="rejection-comment-input"
                                    placeholder="Explain required corrections or missing proof..."
                                    value={rejectionComment}
                                    onChange={(e) => setRejectionComment(e.target.value)}
                                    rows={2}
                                />
                                <div className="rejection-actions">
                                    <button className="btn-cancel-sm" onClick={() => setRejectingId(null)}>Cancel</button>
                                    <button className="btn-reject-confirm" onClick={() => handleRejectSubmit(item.id)}>Confirm Rejection</button>
                                </div>
                            </div>
                        ) : (
                            <div className="card-actions">
                                <button className="btn-detail" onClick={() => setSelectedValidation(item)}>
                                    Details
                                </button>
                                <button className="btn-reject" onClick={() => setRejectingId(item.id)}>
                                    <FiXCircle size={14} /> Reject
                                </button>
                                <button className="btn-approve" onClick={() => onApprove && onApprove(item.id)}>
                                    <FiCheckCircle size={14} /> Approve
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedValidation && (
                <ValidationDetail
                    validation={selectedValidation}
                    onClose={() => setSelectedValidation(null)}
                />
            )}
        </div>
    );
};

export default ValidationQueue;
