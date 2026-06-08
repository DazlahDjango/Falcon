import React from 'react';
import PropTypes from 'prop-types';
import styles from './ChampionDashboard.module.css';

const ChampionDashboardHeader = ({ period, onRefresh, refreshing }) => {
    return (
        <div className={styles.header}>
            <div className={styles.headerLeft}>
                <h1 className={styles.title}>Dashboard Champion</h1>
                <p className={styles.subtitle}>
                    Data Quality & Compliance Oversight for {period}
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
ChampionDashboardHeader.propTypes = {
    period: PropTypes.string.isRequired,
    onRefresh: PropTypes.func,
    refreshing: PropTypes.bool,
};
export default ChampionDashboardHeader;