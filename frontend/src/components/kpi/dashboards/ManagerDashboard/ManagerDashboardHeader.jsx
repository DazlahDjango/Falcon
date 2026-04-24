import React from 'react';
import PropTypes from 'prop-types';
import styles from './ManagerDashboard.module.css';

const ManagerDashboardHeader = ({ managerName, period, onRefresh, refreshing }) => {
    return (
        <div className={styles.header}>
            <div className={styles.headerLeft}>
                <h1 className={styles.title}>Team Performance Dashboard</h1>
                <p className={styles.subtitle}>
                    Welcome back, {managerName || 'Manager'}! Here's your team's performance for {period}
                </p>
            </div>
            <div className={styles.headerRight}>
                <button 
                    onClick={onRefresh} 
                    className={`${styles.refreshButton} ${refreshing ? styles.refreshing : ''}`}
                    disabled={refreshing}
                >
                    <span className={styles.refreshIcon}>⟳</span>
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>
        </div>
    );
};
ManagerDashboardHeader.propTypes = {
    managerName: PropTypes.string,
    period: PropTypes.string.isRequired,
    onRefresh: PropTypes.func,
    refreshing: PropTypes.bool,
};
ManagerDashboardHeader.defaultProps = {
    managerName: 'Manager',
};
export default ManagerDashboardHeader;