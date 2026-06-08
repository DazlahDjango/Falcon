import React from 'react';
import PropTypes from 'prop-types';
import styles from './ChampionDashboard.module.css';

const EscalationsList = ({ escalations, onResolve }) => {
    const getPriorityClass = (createdAt) => {
        const daysOpen = (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24);
        if (daysOpen > 5) return styles.priorityHigh;
        if (daysOpen > 2) return styles.priorityMedium;
        return styles.priorityLow;
    };
    const getDaysOpen = (createdAt) => {
        const days = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    };
    if (!escalations || escalations.length === 0) {
        return (
            <div className={styles.escalationsContainer}>
                <h4>Pending Escalations</h4>
                <div className={styles.noEscalations}>
                    <span className={styles.checkIcon}>✅</span>
                    <p>No pending escalations</p>
                </div>
            </div>
        );
    }
    return (
        <div className={styles.escalationsContainer}>
            <h4>Pending Escalations</h4>
            <div className={styles.escalationsList}>
                {escalations.map((escalation, index) => (
                    <div key={index} className={`${styles.escalationItem} ${getPriorityClass(escalation.createdAt)}`}>
                        <div className={styles.escalationHeader}>
                            <div className={styles.escalationInfo}>
                                <span className={styles.escalationKpi}>{escalation.kpi}</span>
                                <span className={styles.escalationUser}>{escalation.user}</span>
                            </div>
                            <div className={styles.escalationPriority}>
                                {getDaysOpen(escalation.createdAt)}
                            </div>
                        </div>
                        <div className={styles.escalationReason}>
                            <span className={styles.reasonLabel}>Reason:</span>
                            {escalation.reason}
                        </div>
                        <div className={styles.escalationActions}>
                            <button 
                                onClick={() => onResolve(escalation.id)}
                                className={styles.resolveButton}
                            >
                                Mark Resolved
                            </button>
                            <button className={styles.viewButton}>
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
EscalationsList.propTypes = {
    escalations: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        kpi: PropTypes.string,
        user: PropTypes.string,
        reason: PropTypes.string,
        createdAt: PropTypes.string,
    })),
    onResolve: PropTypes.func,
};
EscalationsList.defaultProps = {
    escalations: [],
    onResolve: () => {},
};
export default EscalationsList;