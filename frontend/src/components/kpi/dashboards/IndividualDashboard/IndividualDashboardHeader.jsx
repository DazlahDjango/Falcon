import React from 'react';
import PropTypes from 'prop-types';
import styles from './IndividualDashboard.module.css';

const IndividualDashboardHeader = ({ userName, period, onRefresh, refreshing }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };
    return (
        <div className={styles.header}>
            <div className={styles.headerLeft}>
                <h1 className={styles.title}>My Performance Dashboard</h1>
                <p className={styles.subtitle}>
                    {getGreeting()}, {userName || 'User'}! Here's your performance overview for {period}
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
IndividualDashboardHeader.propTypes = {
    userName: PropTypes.string,
    period: PropTypes.string.isRequired,
    onRefresh: PropTypes.func,
    refreshing: PropTypes.bool,
};
IndividualDashboardHeader.defaultProps = {
    userName: 'User',
};
export default IndividualDashboardHeader;