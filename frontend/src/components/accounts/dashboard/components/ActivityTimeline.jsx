import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FiUser, FiTarget, FiCheckCircle, FiAlertCircle, FiEdit } from 'react-icons/fi';

const ActivityTimeline = ({ activities, title = 'Recent Activity', limit = 10 }) => {
    const getActivityIcon = (type) => {
        switch (type) {
            case 'kpi_updated': return <FiTarget />;
            case 'kpi_approved': return <FiCheckCircle />;
            case 'review_submitted': return <FiEdit />;
            case 'alert': return <FiAlertCircle />;
            default: return <FiUser />;
        }
    };
    
    const getActivityColor = (type) => {
        switch (type) {
            case 'kpi_approved': return 'success';
            case 'alert': return 'danger';
            case 'kpi_updated': return 'info';
            default: return 'default';
        }
    };
    
    const displayedActivities = activities?.slice(0, limit) || [];
    
    if (displayedActivities.length === 0) {
        return (
            <div className="activity-timeline empty">
                <p>No recent activity</p>
            </div>
        );
    }
    
    return (
        <div className="activity-timeline">
            <h3 className="timeline-title">{title}</h3>
            <div className="timeline-items">
                {displayedActivities.map((activity) => (
                    <div key={activity.id} className="timeline-item">
                        <div className={`timeline-icon ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                        </div>
                        <div className="timeline-content">
                            <div className="timeline-header">
                                <span className="timeline-user">{activity.user_name}</span>
                                <span className="timeline-time">
                                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                </span>
                            </div>
                            <p className="timeline-description">{activity.description}</p>
                            {activity.metadata && (
                                <div className="timeline-metadata">
                                    {activity.metadata}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityTimeline;