import React from 'react';
import PropTypes from 'prop-types';
import { BarChart } from '../../../common/KPIChart';
import styles from './PhasingChart.module.css';

const PhasingChart = ({ phasing, targetValue }) => {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const chartData = {
        labels: months,
        datasets: [
            {
                label: 'Monthly Target',
                data: phasing.map(p => p.target_value),
                color: '#3b82f6',
            }
        ],
        yAxisLabel: 'Target Value'
    };
    const average = targetValue / 12;
    return (
        <div className={styles.chartContainer}>
            <BarChart data={chartData} height={300} />
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Annual Target:</span>
                    <span className={styles.statValue}>{targetValue.toFixed(2)}</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Monthly Average:</span>
                    <span className={styles.statValue}>{average.toFixed(2)}</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Highest Month:</span>
                    <span className={styles.statValue}>
                        {Math.max(...phasing.map(p => p.target_value)).toFixed(2)}
                    </span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Lowest Month:</span>
                    <span className={styles.statValue}>
                        {Math.min(...phasing.map(p => p.target_value)).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};
PhasingChart.propTypes = {
    phasing: PropTypes.arrayOf(PropTypes.shape({
        month: PropTypes.number,
        target_value: PropTypes.number
    })).isRequired,
    targetValue: PropTypes.number.isRequired,
};
export default PhasingChart;