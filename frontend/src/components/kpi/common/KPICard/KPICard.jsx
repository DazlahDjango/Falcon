import React from 'react';
import PropTypes from 'prop-types';
import TrafficLight from '../TrafficLight';
import styles from './KPICard.module.css';

const KPICard = ({
    kpi,
    score,
    status, 
    trend,
    actual, 
    target,
    unit,
    onClick,
    showDetails,
    className,
    compact
}) => {
    const formatValue = (value, type) => {
        if (value === undefined || value === null) return 'N/A';
        if (type === 'percentage') return `${value.toFixed(1)}%`;
        if (type === 'currency') return `KES ${value.toLocaleString()}`;
        return value.toLocaleString();
    };
    const getTrendIcon = () => {
        if (!trend) return null;
        switch (trend.direction) {
            case 'IMPROVING': return '📈';
            case 'DECLINING': return '📉';
            case 'STABLE': return '➡️';
            default: return '📊';
        }
    };
    const getTrendColor = () => {
        if (!trend) return '';
        switch (trend.direction) {
            case 'IMPROVING': return styles.trendUp;
            case 'DECLINING': return styles.trendDown;
            default: return styles.trendStable;
        }
    };
    return (
        <div 
            className={`${styles.kpiCard} ${compact ? styles.compact : ''} ${className || ''} ${onClick ? styles.clickable : ''}`}
            onClick={onClick}
        >
            <div className={styles.header}>
                <h3 className={styles.title}>{kpi.name}</h3>
                <TrafficLight status={status} size="sm" showLabel={false} />
            </div>
            
            <div className={styles.scoreSection}>
                <div className={styles.currentScore}>
                    <span className={styles.scoreValue}>{formatValue(score, 'percentage')}</span>
                    {trend && (
                        <span className={`${styles.trend} ${getTrendColor()}`}>
                            {getTrendIcon()} {trend.confidence}%
                        </span>
                    )}
                </div>
            </div>

            {showDetails && (
                <div className={styles.details}>
                    <div className={styles.actualTarget}>
                        <div className={styles.actual}>
                            <span className={styles.label}>Actual</span>
                            <span className={styles.value}>{formatValue(actual, kpi.kpiType)} {unit}</span>
                        </div>
                        <div className={styles.target}>
                            <span className={styles.label}>Target</span>
                            <span className={styles.value}>{formatValue(target, kpi.kpiType)} {unit}</span>
                        </div>
                    </div>
                    <div className={styles.progress}>
                        <div 
                            className={styles.progressBar} 
                            style={{ 
                                width: `${Math.min(100, (actual / target) * 100)}%`,
                                backgroundColor: status === 'GREEN' ? '#22c55e' : status === 'YELLOW' ? '#eab308' : '#ef4444'
                            }} 
                        />
                    </div>
                </div>
            )}

            {kpi.code && <div className={styles.footer}>
                <span className={styles.code}>Code: {kpi.code}</span>
                {kpi.category && <span className={styles.category}>{kpi.category.name}</span>}
            </div>}
        </div>
    );
};
KPICard.propTypes = {
    kpi: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        code: PropTypes.string,
        kpiType: PropTypes.string,
        category: PropTypes.shape({ name: PropTypes.string }),
    }).isRequired,
    score: PropTypes.number,
    status: PropTypes.oneOf(['GREEN', 'YELLOW', 'RED']),
    trend: PropTypes.shape({
        direction: PropTypes.string,
        confidence: PropTypes.number,
    }),
    actual: PropTypes.number,
    target: PropTypes.number,
    unit: PropTypes.string,
    onClick: PropTypes.func,
    showDetails: PropTypes.bool,
    className: PropTypes.string,
    compact: PropTypes.bool,
};
KPICard.defaultProps = {
    showDetails: true,
    compact: false,
};
export default KPICard;