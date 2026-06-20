import React from 'react';
import { FiClock, FiUser, FiTarget, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { HiOutlineCalendar } from 'react-icons/hi';
import KPIStatusBadge from '../common/KPIStatusBadge';

const ValidationCard = ({ validation, onApprove, onReject, onEscalate, canValidate }) => {
    const getStatusClass = () => {
        switch (validation.status?.toLowerCase()) {
            case 'pending': return 'kpi-validation-card-pending';
            case 'approved': return 'kpi-validation-card-approved';
            case 'rejected': return 'kpi-validation-card-rejected';
            default: return '';
        }
    };

    return (
        <div className={`kpi-validation-card ${getStatusClass()}`}>
            <div className="kpi-validation-header">
                <div className="kpi-validation-title">
                    <FiTarget size={16} />
                    <span>{validation.actual_kpi || validation.kpi_name}</span>
                </div>
                <KPIStatusBadge status={validation.status || validation.status_display} />
            </div>
            
            <div className="kpi-validation-meta">
                <div className="kpi-validation-meta-item">
                    <FiUser size={12} />
                    <span>{validation.actual_user || validation.user_email}</span>
                </div>
                <div className="kpi-validation-meta-item">
                    <HiOutlineCalendar size={12} />
                    <span>Period: {validation.period || `${validation.year}-${validation.month}`}</span>
                </div>
                <div className="kpi-validation-meta-item">
                    <FiClock size={12} />
                    <span>Submitted: {new Date(validation.submitted_at).toLocaleDateString()}</span>
                </div>
            </div>
            
            <div className="kpi-validation-value">
                Value: {validation.actual_value}
            </div>
            
            {validation.notes && (
                <div className="kpi-validation-notes">
                    {validation.notes}
                </div>
            )}
            
            {validation.status === 'PENDING' && canValidate && (
                <div className="kpi-validation-actions">
                    <button 
                        className="kpi-validation-approve-btn"
                        onClick={() => onApprove(validation)}
                    >
                        <FiCheckCircle size={14} />
                        Approve
                    </button>
                    <button 
                        className="kpi-validation-reject-btn"
                        onClick={() => onReject(validation)}
                    >
                        <FiXCircle size={14} />
                        Reject
                    </button>
                </div>
            )}
        </div>
    );
};

export default ValidationCard;