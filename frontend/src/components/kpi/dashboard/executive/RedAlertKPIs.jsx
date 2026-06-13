import React from 'react';
import { FiAlertCircle, FiUser, FiTarget } from 'react-icons/fi';

const RedAlertKPIs = ({ alerts }) => {
    if (!alerts || alerts.length === 0) {
        return (
            <div className="dashboard-card">
                <div className="card-header">
                    <h3>Red Alert KPIs</h3>
                    <span className="badge success">0 alerts</span>
                </div>
                <div className="card-empty">No red alerts</div>
            </div>
        );
    }
    
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3>Red Alert KPIs</h3>
                <span className="badge danger">{alerts.length} alerts</span>
            </div>
            <div className="alerts-list">
                {alerts.slice(0, 5).map((alert, index) => (
                    <div key={index} className="alert-item">
                        <div className="alert-icon">
                            <FiAlertCircle size={16} color="#ef4444" />
                        </div>
                        <div className="alert-info">
                            <div className="alert-title">
                                <FiTarget size={12} />
                                <span>{alert.kpi}</span>
                            </div>
                            <div className="alert-user">
                                <FiUser size={10} />
                                <span>{alert.user}</span>
                            </div>
                        </div>
                        <div className="alert-consecutive">
                            {alert.consecutive_months}m
                        </div>
                    </div>
                ))}
                {alerts.length > 5 && (
                    <div className="view-more">+{alerts.length - 5} more</div>
                )}
            </div>
        </div>
    );
};

export default RedAlertKPIs;