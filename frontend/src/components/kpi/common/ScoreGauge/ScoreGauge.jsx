import React from 'react';
import PropTypes from 'prop-types';
import GaugeChart from '../KPIChart/GaugeChart';
import styles from './ScoreGauge.module.css';

const ScoreGauge = ({ score, title, size, greenThreshold, yellowThreshold, showDetails }) => {
    const getStatus = () => {
        if (score >= greenThreshold) return 'GREEN';
        if (score >= yellowThreshold) return 'YELLOW';
        return 'RED';
    };
    const getStatusColor = () => {
        switch (getStatus()) {
            case 'GREEN': return '#22c55e';
            case 'YELLOW': return '#eab308';
            default: return '#ef4444';
        }
    };
    const getStatusLabel = () => {
        switch (getStatus()) {
            case 'GREEN': return 'On Track';
            case 'YELLOW': return 'At Risk';
            default: return 'Off Track';
        }
    };
    const chartHeight = size === 'sm' ? 150 : size === 'lg' ? 250 : 200;
    return (
        <div className={`${styles.scoreGauge} ${styles[size]}`}>
            <GaugeChart
                data={{
                    value: score,
                    greenThreshold,
                    yellowThreshold,
                }}
                height={chartHeight}
                title={title}
            />
            {showDetails && (
                <div className={styles.details}>
                    <div className={styles.scoreValue} style={{ color: getStatusColor() }}>
                        {score.toFixed(1)}%
                    </div>
                    <div className={styles.scoreStatus}>{getStatusLabel()}</div>
                    <div className={styles.thresholds}>
                        <span>Target: ≥{greenThreshold}%</span>
                        <span>Min: ≥{yellowThreshold}%</span>
                    </div>
                </div>
            )}
        </div>
    );
};
ScoreGauge.propTypes = {
    score: PropTypes.number.isRequired,
    title: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    greenThreshold: PropTypes.number,
    yellowThreshold: PropTypes.number,
    showDetails: PropTypes.bool,
};
ScoreGauge.defaultProps = {
    size: 'md',
    greenThreshold: 90,
    yellowThreshold: 50,
    showDetails: true,
};
export default ScoreGauge;