import React from 'react';
import { FiClock, FiUser, FiEdit2, FiPlus, FiArchive, FiCheckCircle } from 'react-icons/fi';

const getActionIcon = (action) => {
    switch (action) {
        case 'CREATE': return <FiPlus size={14} />;
        case 'UPDATE': return <FiEdit2 size={14} />;
        case 'ACTIVATE': return <FiCheckCircle size={14} />;
        case 'DEACTIVATE': return <FiArchive size={14} />;
        default: return <FiEdit2 size={14} />;
    }
};

const getActionColor = (action) => {
    switch (action) {
        case 'CREATE': return '#10b981';
        case 'UPDATE': return '#f59e0b';
        case 'ACTIVATE': return '#3b82f6';
        case 'DEACTIVATE': return '#ef4444';
        default: return '#6c757d';
    }
};

const RecentActivity = ({ activities }) => {
    if (!activities || activities.length === 0) {
        return (
            <div className="recent-activity">
                <div className="section-header">
                    <h3 className="section-title">
                        <FiClock size={18} />
                        Recent Activity
                    </h3>
                </div>
                <div className="empty-state">
                    <p>No recent activity to display.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="recent-activity">
            <div className="section-header">
                <h3 className="section-title">
                    <FiClock size={18} />
                    Recent Activity
                </h3>
                <span className="section-badge">{activities.length} events</span>
            </div>

            <div className="activity-timeline">
                {activities.map((activity, index) => (
                    <div key={index} className="activity-item">
                        <div className="activity-icon" style={{ backgroundColor: `${getActionColor(activity.action)}20`, color: getActionColor(activity.action) }}>
                            {getActionIcon(activity.action)}
                        </div>
                        <div className="activity-content">
                            <div className="activity-title">
                                <span className="activity-action">{activity.action}</span>
                                <span className="activity-target">{activity.kpi_name}</span>
                            </div>
                            <div className="activity-meta">
                                <span className="activity-user">
                                    <FiUser size={12} />
                                    {activity.performed_by || 'System'}
                                </span>
                                <span className="activity-time">
                                    {new Date(activity.performed_at).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivity;