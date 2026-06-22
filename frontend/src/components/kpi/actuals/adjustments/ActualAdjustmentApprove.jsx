import React, { useState } from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';

const ActualAdjustmentApprove = ({ adjustment, onConfirm, onClose }) => {
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm(comment);
        setLoading(false);
    };

    return (
        <div className="kpi-adjustment-approve-modal" onClick={onClose}>
            <div className="kpi-adjustment-approve-container" onClick={(e) => e.stopPropagation()}>
                <div className="kpi-adjustment-approve-header">
                    <h3>Approve Adjustment Request</h3>
                    <button className="kpi-adjustment-approve-close" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="kpi-adjustment-approve-body">
                    <div className="kpi-adjustment-approve-details">
                        <div className="kpi-adjustment-approve-detail">
                            <span className="label">KPI:</span>
                            <span>{adjustment.kpi_name}</span>
                        </div>
                        <div className="kpi-adjustment-approve-detail">
                            <span className="label">Original Value:</span>
                            <span className="original">{adjustment.original_value}</span>
                        </div>
                        <div className="kpi-adjustment-approve-detail">
                            <span className="label">Adjusted Value:</span>
                            <span className="adjusted">{adjustment.adjusted_value}</span>
                        </div>
                        <div className="kpi-adjustment-approve-detail">
                            <span className="label">Reason:</span>
                            <span>{adjustment.reason}</span>
                        </div>
                    </div>
                    
                    <div className="kpi-adjustment-form-group">
                        <label>Approval Comment (Optional)</label>
                        <textarea 
                            className="kpi-adjustment-form-textarea"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="3"
                            placeholder="Add any notes about this approval..."
                        />
                    </div>
                </div>
                
                <div className="kpi-adjustment-approve-footer">
                    <button className="kpi-adjustment-approve-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button 
                        className="kpi-adjustment-approve-confirm"
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        <FiCheckCircle size={14} />
                        {loading ? 'Processing...' : 'Confirm Approval'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActualAdjustmentApprove;