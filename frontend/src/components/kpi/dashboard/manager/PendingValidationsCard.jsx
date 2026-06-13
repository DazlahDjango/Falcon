import React from 'react';
import { FiClock, FiUser, FiTarget } from 'react-icons/fi';

const PendingValidationsCard = ({ validations }) => {
    if (!validations || validations.length === 0) {
        return (
            <div className="dashboard-card">
                <div className="card-header">
                    <h3>Pending Validations</h3>
                    <span className="badge success">0 pending</span>
                </div>
                <div className="card-empty">No pending validations</div>
            </div>
        );
    }
    
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3>Pending Validations</h3>
                <span className="badge warning">{validations.length} pending</span>
            </div>
            <div className="pending-list">
                {validations.slice(0, 5).map((validation, index) => (
                    <div key={index} className="pending-item">
                        <div className="pending-info">
                            <div className="pending-title">
                                <FiTarget size={12} />
                                <span>{validation.kpi_name}</span>
                            </div>
                            <div className="pending-user">
                                <FiUser size={10} />
                                <span>{validation.user_name}</span>
                            </div>
                        </div>
                        <div className="pending-time">
                            <FiClock size={10} />
                            <span>{validation.days_pending}d</span>
                        </div>
                    </div>
                ))}
                {validations.length > 5 && (
                    <div className="view-more">+{validations.length - 5} more</div>
                )}
            </div>
        </div>
    );
};

export default PendingValidationsCard;