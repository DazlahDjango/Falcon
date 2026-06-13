import React from 'react';
import { FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

const RecentActivity = ({ activities }) => {
    const getActivityIcon = (type) => {
        switch (type) {
            case 'submission': return <FiCheckCircle size={14} color="var(--kpi-success)" />;
            case 'validation': return <FiAlertCircle size={14} color="var(--kpi-warning)" />;
            default: return <FiClock size={14} color="var(--kpi-primary)" />;
        }
    };
    
    if (!activities || activities.length === 0) {
        return (
            <div className="dashboard-card">
                <div className="card-header">
                    <h3>Recent Activity</h3>
                </div>
                <div className="card-empty">No recent activity</div>
            </div>
        );
    }
    
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3>Recent Activity</h3>
                <a href="#" className="view-all">View all →</a>
            </div>
            <div className="activity-list">
                {activities.map((activity, index) => (
                    <div key={index} className="activity-item">
                        <div className="activity-icon">
                            {getActivityIcon(activity.type)}
                        </div>
                        <div className="activity-content">
                            <div className="activity-title">{activity.title}</div>
                            <div className="activity-time">{activity.time}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivity;