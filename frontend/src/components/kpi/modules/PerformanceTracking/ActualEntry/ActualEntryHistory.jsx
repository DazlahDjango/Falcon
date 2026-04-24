import React from 'react';
import PropTypes from 'prop-types';
import styles from './ActualEntryHistory.module.css';

const ActualEntryHistory = ({ history, kpi }) => {
    if (!history || history.length === 0) {
        return null;
    }
    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return <span className={`${styles.badge} ${styles.approved}`}>Approved</span>;
            case 'REJECTED':
                return <span className={`${styles.badge} ${styles.rejected}`}>Rejected</span>;
            case 'PENDING':
                return <span className={`${styles.badge} ${styles.pending}`}>Pending</span>;
            default:
                return <span className={`${styles.badge} ${styles.draft}`}>{status}</span>;
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };
    return (
        <div className={styles.history}>
            <h4>Recent History</h4>
            <div className={styles.historyList}>
                {history.slice(0, 5).map(entry => (
                    <div key={entry.id} className={styles.historyItem}>
                        <div className={styles.historyPeriod}>
                            {entry.year}-{String(entry.month).padStart(2, '0')}
                        </div>
                        <div className={styles.historyValue}>
                            {entry.actual_value} {kpi?.unit}
                        </div>
                        <div className={styles.historyStatus}>
                            {getStatusBadge(entry.status)}
                        </div>
                        <div className={styles.historyDate}>
                            {formatDate(entry.submitted_at)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
ActualEntryHistory.propTypes = {
    history: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        year: PropTypes.number,
        month: PropTypes.number,
        actual_value: PropTypes.number,
        status: PropTypes.string,
        submitted_at: PropTypes.string,
    })),
    kpi: PropTypes.shape({
        unit: PropTypes.string,
    }),
};
export default ActualEntryHistory;