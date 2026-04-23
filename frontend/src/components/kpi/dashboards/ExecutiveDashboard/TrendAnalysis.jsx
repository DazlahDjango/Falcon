import React from 'react';
import PropTypes from 'prop-types';
import { LineChart } from '../../common/KPIChart';
import styles from './ExecutiveDashboard.module.css';

const TrendAnalysis = ({ trendData }) => {
    if (!trendData || trendData.length === 0) {
        return (
            <div className={styles.trendContainer}>
                <h4>Performance Trend</h4>
                <p className={styles.noData}>No trend data available</p>
            </div>
        );
    }
    const chartData = {
        labels: trendData.map(item => item.period),
        datasets: [
            {
                label: 'Organization Health Score',
                data: trendData.map(item => item.score),
                color: '#3b82f6',
                area: true,
            }
        ],
        yAxisLabel: 'Health Score (%)'
    };
    const calculateTrend = () => {
        if (trendData.length < 2) return {direction: 'stable', change: 0};
        const first = trendData[0].score;
        const last = trendData[trendData.length - 1].score;
        const change = ((last - first) / first) * 100;
        return {
            direction: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable',
            change: Math.abs(change).toFixed(1)
        };
    };
    const trend = calculateTrend();
    const getTrendIcon = () => {
        switch (trend.direction) {
            case 'improving': return '📈';
            case 'declining': return '📉';
            default: return '➡️';
        }
    };
    const getTrendColor = () => {
        switch (trend.direction) {
            case 'improving': return styles.trendPositive;
            case 'declining': return styles.trendNegative;
            default: return styles.trendNeutral;
        }
    };
    return (
        <div className={styles.trendContainer}>
            <div className={styles.trendHeader}>
                <h4>Performance Trend</h4>
                <div className={`${styles.trendBadge} ${getTrendColor()}`}>
                    {getTrendIcon()} {trend.direction} {trend.change}%
                </div>
            </div>
            <LineChart 
                data={chartData}
                height={300}
            />
            <div className={styles.trendNote}>
                * Trend shows organization health over the last {trendData.length} periods
            </div>
        </div>
    );
};
TrendAnalysis.propTypes = {
    trendData: PropTypes.arrayOf(PropTypes.shape({
        period: PropTypes.string,
        score: PropTypes.number,
    })),
};
TrendAnalysis.defaultProps = {
    trendData: [],
};
export default TrendAnalysis;