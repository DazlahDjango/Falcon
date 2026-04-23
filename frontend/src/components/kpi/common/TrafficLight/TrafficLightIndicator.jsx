import React from 'react';
import PropTypes from 'prop-types';
import styles from './TrafficLight.module.css';

const TrafficLightIndicator = ({ status, size, showLabel, label, emoji }) => {
    const getStatusClass = () => {
        switch (status) {
            case 'GREEN': return styles.green;
            case 'YELLOW': return styles.yellow;
            case 'RED': return styles.red;
            default: return styles.gray;
        }
    };
    return (
        <div className={`${styles.indicator} ${getStatusClass()} ${styles[size]}`}>
            {emoji && <span className={styles.emoji}>{emoji}</span>}
            {showLabel && <span className={styles.label}>{label || status}</span>}
        </div>
    );
};
TrafficLightIndicator.propTypes = {
    status: PropTypes.oneOf(['GREEN', 'YELLOW', 'RED']).isRequired,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    showLabel: PropTypes.bool,
    label: PropTypes.string,
    emoji: PropTypes.string,
};
TrafficLightIndicator.defaultProps = {
    size: 'md',
    showLabel: false,
};
export default TrafficLightIndicator;