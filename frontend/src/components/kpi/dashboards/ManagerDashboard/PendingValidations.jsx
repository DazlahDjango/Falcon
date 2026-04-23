import React from 'react';
import PropTypes from 'prop-types';
import styles from './ManagerDashboard.module.css';

const PendingValidations = ({ 
    pendingValidations, 
    missingSubmissions, 
    onValidate,
    onApprove,
    onReject 
}) => {
    const getPriorityClass = (submittedAt) => {
        const daysPending = (new Date() - new Date(submittedAt)) / (1000 * 60 * 60 * 24);
        if (daysPending > 3) return styles.priorityHigh;
        if (daysPending > 1) return styles.priorityMedium;
        return styles.priorityLow;
    };
    if ((!pendingValidations || pendingValidations.length === 0) && missingSubmissions === 0) {
        return (
            <div className={styles.validationsEmpty}>
                <div className={styles.emptyIcon}>✅</div>
                <p>All caught up! No pending validations.</p>
            </div>
        );
    }
    return (
        <div className={styles.validationsContainer}>
            <h4>Pending Actions</h4>
            
            {missingSubmissions > 0 && (
                <div className={styles.missingSection}>
                    <div className={styles.missingHeader}>
                        <span className={styles.missingIcon}>⚠️</span>
                        <span className={styles.missingTitle}>Missing Submissions</span>
                        <span className={styles.missingCount}>{missingSubmissions}</span>
                    </div>
                    <p className={styles.missingText}>
                        {missingSubmissions} team member{missingSubmissions !== 1 ? 's' : ''} ha{missingSubmissions !== 1 ? 've' : 's'} not submitted data for this period.
                    </p>
                    <button onClick={onValidate} className={styles.remindButton}>
                        Send Reminders
                    </button>
                </div>
            )}

            {pendingValidations && pendingValidations.length > 0 && (
                <div className={styles.pendingList}>
                    <div className={styles.pendingHeader}>
                        <span>Pending Validations</span>
                        <span className={styles.pendingCount}>{pendingValidations.length}</span>
                    </div>
                    {pendingValidations.map(validation => (
                        <div key={validation.id} className={styles.pendingItem}>
                            <div className={styles.pendingInfo}>
                                <div className={styles.pendingUser}>
                                    <span className={styles.userName}>{validation.userName}</span>
                                    <span className={styles.userKpi}>{validation.kpiName}</span>
                                </div>
                                <div className={styles.pendingValue}>
                                    Value: {validation.actualValue} {validation.unit}
                                </div>
                                <div className={`${styles.pendingPriority} ${getPriorityClass(validation.submittedAt)}`}>
                                    Pending for {getDaysPending(validation.submittedAt)} days
                                </div>
                            </div>
                            <div className={styles.pendingActions}>
                                <button 
                                    onClick={() => onApprove(validation.id)}
                                    className={styles.approveButton}
                                >
                                    ✓ Approve
                                </button>
                                <button 
                                    onClick={() => onReject(validation.id)}
                                    className={styles.rejectButton}
                                >
                                    ✗ Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
    function getDaysPending(submittedAt) {
        const days = Math.floor((new Date() - new Date(submittedAt)) / (1000 * 60 * 60 * 24));
        return days;
    }
};
PendingValidations.propTypes = {
    pendingValidations: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        userName: PropTypes.string,
        kpiName: PropTypes.string,
        actualValue: PropTypes.number,
        unit: PropTypes.string,
        submittedAt: PropTypes.string,
    })),
    missingSubmissions: PropTypes.number,
    onValidate: PropTypes.func,
    onApprove: PropTypes.func,
    onReject: PropTypes.func,
};
PendingValidations.defaultProps = {
    pendingValidations: [],
    missingSubmissions: 0,
    onValidate: () => {},
    onApprove: () => {},
    onReject: () => {},
};
export default PendingValidations;