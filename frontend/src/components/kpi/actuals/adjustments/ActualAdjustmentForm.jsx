import React, { useState } from 'react';
import { FiSend, FiX } from 'react-icons/fi';

const ActualAdjustmentForm = ({ actual, onSubmit, onCancel, loading }) => {
    const [adjustedValue, setAdjustedValue] = useState(actual?.actual_value || '');
    const [reason, setReason] = useState('');
    const [errors, setErrors] = useState({});

    const handleSubmit = async () => {
        const newErrors = {};
        if (!adjustedValue) newErrors.adjustedValue = 'Please enter adjusted value';
        if (!reason.trim()) newErrors.reason = 'Please provide a reason for adjustment';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        await onSubmit({ adjustedValue: parseFloat(adjustedValue), reason });
    };

    return (
        <div className="kpi-adjustment-form-modal">
            <div className="kpi-adjustment-form-container">
                <div className="kpi-adjustment-form-header">
                    <h3>Request Adjustment</h3>
                    <button className="kpi-adjustment-form-close" onClick={onCancel}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="kpi-adjustment-form-body">
                    <div className="kpi-adjustment-form-group">
                        <label>Current Value</label>
                        <input 
                            type="text"
                            className="kpi-adjustment-form-input-disabled"
                            value={actual?.actual_value || ''}
                            disabled
                        />
                    </div>
                    
                    <div className="kpi-adjustment-form-group">
                        <label>Adjusted Value <span className="kpi-required">*</span></label>
                        <input 
                            type="number"
                            className={`kpi-adjustment-form-input ${errors.adjustedValue ? 'error' : ''}`}
                            value={adjustedValue}
                            onChange={(e) => setAdjustedValue(e.target.value)}
                            placeholder="Enter the corrected value"
                        />
                        {errors.adjustedValue && (
                            <span className="kpi-adjustment-form-error">{errors.adjustedValue}</span>
                        )}
                    </div>
                    
                    <div className="kpi-adjustment-form-group">
                        <label>Reason for Adjustment <span className="kpi-required">*</span></label>
                        <textarea 
                            className={`kpi-adjustment-form-textarea ${errors.reason ? 'error' : ''}`}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows="4"
                            placeholder="Explain why this adjustment is needed..."
                        />
                        {errors.reason && (
                            <span className="kpi-adjustment-form-error">{errors.reason}</span>
                        )}
                    </div>
                </div>
                
                <div className="kpi-adjustment-form-footer">
                    <button className="kpi-adjustment-form-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button 
                        className="kpi-adjustment-form-submit"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        <FiSend size={14} />
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActualAdjustmentForm;