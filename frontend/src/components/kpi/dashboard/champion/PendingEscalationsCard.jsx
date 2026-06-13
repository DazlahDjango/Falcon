import React from 'react';
import { FiAlertCircle, FiUser, FiTarget, FiClock } from 'react-icons/fi';

const PendingEscalationsCard = ({ escalations, escalationsList }) => {
    if (!escalations || escalations === 0) {
        return (
            <div className="dashboard-card">
                <div className="card-header">
                    <h3>Pending Escalations</h3>
                    <span className="badge success">0 escalations</span>
                </div>
                <div className="card-empty">No pending escalations</div>
            </div>
        );
    }
    
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3>Pending Escalations</h3>
                <span className="badge warning">{escalations} escalations</span>
            </div>
            <div className="escalations-list">
                {escalationsList?.slice(0, 5).map((item, index) => (
                    <div key={index} className="escalation-item">
                        <div className="escalation-icon">
                            <FiAlertCircle size={16} color="var(--kpi-warning)" />
                        </div>
                        <div className="escalation-info">
                            <div className="escalation-title">
                                <FiTarget size={12} />
                                <span>{item.kpi_name}</span>
                            </div>
                            <div className="escalation-details">
                                <span><FiUser size={10} /> {item.escalated_by}</span>
                                <span><FiClock size={10} /> {item.days_pending}d</span>
                            </div>
                        </div>
                        <div className="escalation-status">
                            {item.status}
                        </div>
                    </div>
                ))}
                {escalationsList?.length > 5 && (
                    <div className="view-more">+{escalationsList.length - 5} more</div>
                )}
            </div>
        </div>
    );
};

export default PendingEscalationsCard;