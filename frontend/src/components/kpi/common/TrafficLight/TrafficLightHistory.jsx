import React from 'react';
import PropTypes from 'prop-types';
import styles from './TrafficLight.module.css';
const TrafficLightHistory = ({ history, months = 6 }) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'GREEN': return '🟢';
            case 'YELLOW': return '🟡';
            case 'RED': return '🔴';
            default: return '⚪';
        }
    };
    const recentHistory = history.slice(-months);
    return (
        <div className={styles.historyContainer}>
            <span className={styles.historyLabel}>Trend:</span>
            <div className={styles.historyDots}>
                {recentHistory.map((status, index) => (
                    <span 
                        key={index} 
                        className={styles.historyDot}
                        title={`Month ${index + 1}: ${status}`}
                    >
                        {getStatusIcon(status)}
                    </span>
                ))}
            </div>
        </div>
    );
};
TrafficLightHistory.propTypes = {
    history: PropTypes.arrayOf(PropTypes.oneOf(['GREEN', 'YELLOW', 'RED'])).isRequired,
    months: PropTypes.number,
};
TrafficLightHistory.defaultProps = {
    months: 6,
};
export default TrafficLightHistory;