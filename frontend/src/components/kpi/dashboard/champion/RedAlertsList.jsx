import React from 'react';
import PropTypes from 'prop-types';
import styles from './ChampionDashboard.module.css';

const RedAlertsList = ({ alerts }) => {
    if (!alerts || alerts.length === 0) {
        return (
            <div className={styles.alertsContainer}>
                <h4>Red Alerts</h4>
                <div className={styles.noAlerts}>
                    <span className={styles.checkIcon}>✅</span>
                    <p>No red alerts at this time</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.alertsContainer}>
            <h4>Red Alerts</h4>
            <div className={styles.alertsList}>
                {alerts.map((alert, index) => (
                    <div key={index} className={styles.alertItem}>
                        <div className={styles.alertIcon}>🔴</div>
                        <div className={styles.alertContent}>
                            <div className={styles.alertTitle}>
                                {alert.kpi} - {alert.user}
                            </div>
                            <div className={styles.alertDetails}>
                                <span className={styles.alertScore}>Score: {alert.score?.toFixed(1)}%</span>
                                <span className={styles.alertDuration}>
                                    {alert.consecutiveMonths} month{alert.consecutiveMonths !== 1 ? 's' : ''} in red
                                </span>
                            </div>
                            <div className={styles.alertAction}>
                                ⚠️ Immediate attention required
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
RedAlertsList.propTypes = {
    alerts: PropTypes.arrayOf(PropTypes.shape({
        kpi: PropTypes.string,
        user: PropTypes.string,
        consecutiveMonths: PropTypes.number,
        score: PropTypes.number,
    })),
};
RedAlertsList.defaultProps = {
    alerts: [],
};
export default RedAlertsList;