import React, { useState, useEffect } from 'react';
import { FiSend, FiAlertCircle } from 'react-icons/fi';
import useReferenceData from '../../../hooks/kpi/useReferenceData';
import KPILoading from '../common/KPILoading';

const EscalationForm = ({ actualId, onSubmit, onCancel, loading: submitting }) => {
    const [escalatedTo, setEscalatedTo] = useState('');
    const [reason, setReason] = useState('');
    const [errors, setErrors] = useState({});
    
    const { referenceData, loading } = useReferenceData(['users']);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const newErrors = {};
        if (!escalatedTo) newErrors.escalatedTo = 'Please select someone to escalate to';
        if (!reason.trim()) newErrors.reason = 'Please provide a reason for escalation';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        await onSubmit({ escalatedTo, reason });
    };

    if (loading) {
        return <KPILoading size="sm" text="Loading users..." />;
    }

    const managers = referenceData?.users?.filter(u => 
        u.role === 'manager' || u.role === 'executive' || u.role === 'client_admin'
    ) || [];

    return (
        <form className="kpi-escalation-form" onSubmit={handleSubmit}>
            <div className="kpi-escalation-form-group">
                <label className="kpi-escalation-form-label">
                    Escalate To <span style={{ color: 'var(--kpi-danger)' }}>*</span>
                </label>
                <select 
                    className="kpi-escalation-form-select"
                    value={escalatedTo}
                    onChange={(e) => setEscalatedTo(e.target.value)}
                    style={{ borderColor: errors.escalatedTo ? 'var(--kpi-danger)' : undefined }}
                >
                    <option value="">Select a manager...</option>
                    {managers.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.full_name} ({user.email}) - {user.role}
                        </option>
                    ))}
                </select>
                {errors.escalatedTo && (
                    <span style={{ color: 'var(--kpi-danger)', fontSize: '0.75rem' }}>
                        {errors.escalatedTo}
                    </span>
                )}
            </div>
            
            <div className="kpi-escalation-form-group">
                <label className="kpi-escalation-form-label">
                    Reason for Escalation <span style={{ color: 'var(--kpi-danger)' }}>*</span>
                </label>
                <textarea
                    className="kpi-escalation-form-textarea"
                    rows="4"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain why this needs to be escalated..."
                    style={{ borderColor: errors.reason ? 'var(--kpi-danger)' : undefined }}
                />
                {errors.reason && (
                    <span style={{ color: 'var(--kpi-danger)', fontSize: '0.75rem' }}>
                        {errors.reason}
                    </span>
                )}
            </div>
            
            <div className="kpi-validation-actions" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="kpi-confirm-cancel" onClick={onCancel}>
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className="kpi-validation-approve-btn"
                    disabled={submitting}
                >
                    <FiSend size={14} />
                    {submitting ? 'Sending...' : 'Send Escalation'}
                </button>
            </div>
        </form>
    );
};

export default EscalationForm;