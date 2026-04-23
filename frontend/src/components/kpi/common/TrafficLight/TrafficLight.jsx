import React from 'react';
import PropTypes from 'prop-types';
import TrafficLightIndicator from './TrafficLightIndicator';
import TrafficLightHistory from './TrafficLightHistory';
import styles from './TrafficLight.module.css';

const TrafficLight = ({ status, score, size, showLabel, showHistory, history, onClick }) => {
    const getStatusConfig = () => {
        const configs = {
            GREEN: { label: 'On Track', emoji: '🟢', color: '#22c55e', textColor: '#15803d' },
            YELLOW: { label: 'At Risk', emoji: '🟡', color: '#eab308', textColor: '#a16207' },
            RED: { label: 'Off Track', emoji: '🔴', color: '#ef4444', textColor: '#b91c1c' },
        };
        return configs[status] || configs.YELLOW;
    };
    const config = getStatusConfig();
    return (
        <div 
            className={`${styles.trafficLight} ${styles[size]} ${onClick ? styles.clickable : ''}`}
            onClick={onClick}
        >
            <TrafficLightIndicator 
                status={status} 
                size={size}
                showLabel={showLabel}
                label={config.label}
                emoji={config.emoji}
            />
            {score !== undefined && (
                <span className={styles.score} style={{ color: config.textColor }}>
                    {score.toFixed(1)}%
                </span>
            )}
            {showHistory && history && (
                <TrafficLightHistory history={history} />
            )}
        </div>
    );
};
TrafficLight.propTypes = {
    status: PropTypes.oneOf(['GREEN', 'YELLOW', 'RED']).isRequired,
    score: PropTypes.number,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    showLabel: PropTypes.bool,
    showHistory: PropTypes.bool,
    history: PropTypes.arrayOf(PropTypes.string),
    onClick: PropTypes.func,
};
TrafficLight.defaultProps = {
    size: 'md',
    showLabel: true,
    showHistory: false,
};
export default TrafficLight;