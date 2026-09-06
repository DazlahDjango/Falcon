import React, { useState } from 'react';
import { FiX, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import RejectionReasonSelect from './RejectionReasonSelect';

const ValidationModal = ({ isOpen, type, validation, onConfirm, onClose }) => {
    const [comment, setComment] = useState('');
    const [reasonId, setReasonId] = useState(null);

    if (!isOpen || !validation) return null;

    const handleConfirm = () => {
        if (type === 'approve') {
            onConfirm({ comment });
        } else if (type === 'reject') {
            if (!reasonId) {
                alert('Please select a rejection reason');
                return;
            }
            onConfirm({ reasonId, comment });
        }
    };

    return (
        <div className="kpi-validation-modal-overlay" onClick={onClose}>
            <div className="kpi-validation-modal" onClick={(e) => e.stopPropagation()}>
                <div className="kpi-validation-modal-header">
                    <h3>
                        {type === 'approve' ? 'Approve Validation' : 'Reject Validation'}
                    </h3>
                    <button className="kpi-validation-modal-close" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="kpi-validation-modal-body">
                    <div style={{ marginBottom: 'var(--kpi-space-4)' }}>
                        <strong>KPI:</strong> {validation.actual_kpi || validation.kpi_name}<br />
                        <strong>User:</strong> {validation.actual_user || validation.user_email}<br />
                        <strong>Value:</strong> {validation.actual_value}
                    </div>
                    
                    {type === 'reject' && (
                        <RejectionReasonSelect 
                            value={reasonId}
                            onChange={setReasonId}
                        />
                    )}
                    
                    <div className="kpi-escalation-form-group">
                        <label className="kpi-escalation-form-label">
                            Remarks (optional)
                        </label>
                        <textarea
                            className="kpi-rejection-comment"
                            rows="3"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add any additional remarks..."
                        />
                    </div>
                </div>
                
                <div className="kpi-validation-modal-footer">
                    <button className="kpi-confirm-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button 
                        className={type === 'approve' ? 'kpi-validation-approve-btn' : 'kpi-validation-reject-btn'}
                        onClick={handleConfirm}
                    >
                        {type === 'approve' ? <FiCheckCircle size={14} /> : <FiXCircle size={14} />}
                        {type === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ValidationModal;