import React from 'react';
import { FiX, FiUser, FiTarget, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import KPIStatusBadge from '../common/KPIStatusBadge';

const ValidationDetail = ({ validation, onClose }) => {
    if (!validation) return null;
    
    return (
        <div className="validation-detail-modal">
            <div className="validation-detail-container">
                <div className="validation-detail-header">
                    <h3>Validation Details</h3>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="validation-detail-body">
                    <div className="detail-section">
                        <h4>KPI Information</h4>
                        <div className="detail-row">
                            <FiTarget size={14} />
                            <span className="label">KPI:</span>
                            <span className="value">{validation.actual_kpi || validation.kpi_name}</span>
                        </div>
                        <div className="detail-row">
                            <FiUser size={14} />
                            <span className="label">User:</span>
                            <span className="value">{validation.actual_user || validation.user_email}</span>
                        </div>
                        <div className="detail-row">
                            <FiCalendar size={14} />
                            <span className="label">Period:</span>
                            <span className="value">{validation.period}</span>
                        </div>
                    </div>
                    
                    <div className="detail-section">
                        <h4>Submission Details</h4>
                        <div className="detail-row">
                            <span className="label">Actual Value:</span>
                            <span className="value highlight">{validation.actual_value}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Status:</span>
                            <KPIStatusBadge status={validation.status} />
                        </div>
                        {validation.notes && (
                            <div className="detail-row">
                                <FiMessageSquare size={14} />
                                <span className="label">Notes:</span>
                                <span className="value">{validation.notes}</span>
                            </div>
                        )}
                    </div>
                    
                    {validation.validated_by && (
                        <div className="detail-section">
                            <h4>Validation Info</h4>
                            <div className="detail-row">
                                <span className="label">Validated By:</span>
                                <span className="value">{validation.validated_by_email}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Validated At:</span>
                                <span className="value">{new Date(validation.validated_at).toLocaleString()}</span>
                            </div>
                            {validation.comment && (
                                <div className="detail-row">
                                    <span className="label">Comment:</span>
                                    <span className="value">{validation.comment}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="validation-detail-footer">
                    <button className="close-modal-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default ValidationDetail;