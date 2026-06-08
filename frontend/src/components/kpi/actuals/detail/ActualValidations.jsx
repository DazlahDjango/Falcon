import React from 'react';
import { FiUser, FiCalendar, FiMessageSquare, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const ActualValidations = ({ validations }) => {
    if (!validations || validations.length === 0) {
        return (
            <div className="kpi-actual-validations-card">
                <h3>Validation History</h3>
                <p className="kpi-actual-validations-empty">No validations recorded yet</p>
            </div>
        );
    }

    return (
        <div className="kpi-actual-validations-card">
            <h3>Validation History ({validations.length})</h3>
            <div className="kpi-actual-validations-list">
                {validations.map((validation, index) => (
                    <div key={index} className="kpi-actual-validation-item">
                        <div className="kpi-actual-validation-header">
                            <div className="kpi-actual-validation-status">
                                {validation.status === 'APPROVED' ? (
                                    <FiCheckCircle size={16} color="var(--kpi-success)" />
                                ) : (
                                    <FiXCircle size={16} color="var(--kpi-danger)" />
                                )}
                                <span className={validation.status === 'APPROVED' ? 'approved' : 'rejected'}>
                                    {validation.status}
                                </span>
                            </div>
                            <div className="kpi-actual-validation-date">
                                <FiCalendar size={12} />
                                {new Date(validation.validated_at).toLocaleString()}
                            </div>
                        </div>
                        <div className="kpi-actual-validation-details">
                            <div className="kpi-actual-validation-validator">
                                <FiUser size={12} />
                                By: {validation.validated_by_email}
                            </div>
                            {validation.rejection_reason_text && (
                                <div className="kpi-actual-validation-reason">
                                    Reason: {validation.rejection_reason_text}
                                </div>
                            )}
                            {validation.comment && (
                                <div className="kpi-actual-validation-comment">
                                    <FiMessageSquare size={12} />
                                    {validation.comment}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActualValidations;