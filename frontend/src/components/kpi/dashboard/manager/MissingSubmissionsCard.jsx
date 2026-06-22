import React from 'react';
import { FiAlertCircle, FiUser, FiTarget } from 'react-icons/fi';

const MissingSubmissionsCard = ({ missing }) => {
    if (!missing || missing.length === 0) {
        return (
            <div className="dashboard-card">
                <div className="card-header">
                    <h3>Missing Submissions</h3>
                    <span className="badge success">0 missing</span>
                </div>
                <div className="card-empty">All submissions complete</div>
            </div>
        );
    }
    
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3>Missing Submissions</h3>
                <span className="badge danger">{missing.length} missing</span>
            </div>
            <div className="missing-list">
                {missing.slice(0, 5).map((item, index) => (
                    <div key={index} className="missing-item">
                        <div className="missing-info">
                            <div className="missing-title">
                                <FiTarget size={12} />
                                <span>{item.kpi_name}</span>
                            </div>
                            <div className="missing-user">
                                <FiUser size={10} />
                                <span>{item.user_name}</span>
                            </div>
                        </div>
                        <div className="missing-alert">
                            <FiAlertCircle size={12} />
                            <span>Overdue</span>
                        </div>
                    </div>
                ))}
                {missing.length > 5 && (
                    <div className="view-more">+{missing.length - 5} more</div>
                )}
            </div>
        </div>
    );
};

export default MissingSubmissionsCard;