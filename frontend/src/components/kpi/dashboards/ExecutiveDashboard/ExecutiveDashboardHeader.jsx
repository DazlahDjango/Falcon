import React from 'react';
import PropTypes from 'prop-types';
import styles from './ExecutiveDashboard.module.css';

const ExecutiveDashboardHeader = ({ period, onRefresh, refreshing }) => {
    return (
        <div className={styles.header}>
            <div className={styles.headerLeft}>
                <h1 className={styles.title}>Executive Dashboard</h1>
                <p className={styles.subtitle}>
                    Organization-wide performance insights for {period}
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
ExecutiveDashboardHeader.propTypes = {
    period: PropTypes.string.isRequired,
    onRefresh: PropTypes.func,
    refreshing: PropTypes.bool,
};
export default ExecutiveDashboardHeader;