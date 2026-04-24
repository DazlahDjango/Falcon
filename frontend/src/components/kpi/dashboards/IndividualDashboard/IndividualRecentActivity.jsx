import React from 'react';
import PropTypes from 'prop-types';
import styles from './IndividualDashboard.module.css';

const IndividualRecentActivity = ({ activities }) => {
    const getActivityIcon = (status) => {
        switch (status) {
            case 'APPROVED':
                return '✅';
            case 'REJECTED':
                return '❌';
            case 'PENDING':
                return '⏳';
            default:
                return '📝';
        }
    };
    const getStatusClass = (status) => {
        switch (status) {
            case 'APPROVED':
                return styles.activityApproved;
            case 'REJECTED':
                return styles.activityRejected;
            case 'PENDING':
                return styles.activityPending;
            default:
                return '';
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };
    if (!activities || activities.length === 0) {
        return (
            <div className={styles.activitySection}>
                <h3>Recent Activity</h3>
                <div className={styles.noActivity}>
                    <p>No recent activity to display.</p>
                </div>
            </div>
        );
    }
    return (
        <div className={styles.activityContainer}>
            <h3>Recent Activity</h3>
            <div className={styles.activityList}>
                {activities.map((activity, index) => (
                    <div key={index} className={styles.activityItem}>
                        <div className={styles.activityIcon}>
                            {getActivityIcon(activity.status)}
                        </div>
                        <div className={styles.activityContent}>
                            <div className={styles.activityTitle}>
                                <span className={styles.activityKpi}>{activity.kpi}</span>
                                <span className={`${styles.activityStatus} ${getStatusClass(activity.status)}`}>
                                    {activity.status}
                                </span>
                            </div>
                            <div className={styles.activityDetails}>
                                <span className={styles.activityValue}>
                                    Value: {activity.actual} {activity.unit}
                                </span>
                                <span className={styles.activityDate}>
                                    {formatDate(activity.timestamp)}
                                </span>
                            </div>
                            {activity.notes && (
                                <div className={styles.activityNotes}>
                                    📝 {activity.notes}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
IndividualRecentActivity.propTypes = {
    activities: PropTypes.arrayOf(PropTypes.shape({
        kpi: PropTypes.string,
        actual: PropTypes.number,
        unit: PropTypes.string,
        status: PropTypes.string,
        notes: PropTypes.string,
        timestamp: PropTypes.string,
    })),
};
IndividualRecentActivity.defaultProps = {
    activities: [],
};
export default IndividualRecentActivity;