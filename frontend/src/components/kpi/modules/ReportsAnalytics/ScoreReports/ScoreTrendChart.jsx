import React from 'react';
import PropTypes from 'prop-types';
import { BarChart, PieChart, LineChart } from '../../../common';
import styles from './ScoreReports.module.css';

const ScoreTrendChart = ({ data, type = 'line' }) => {
    if (type === 'pie') {
        const pieData = {
            labels: data.labels,
            values: data.values,
            colors: data.colors
        };
        return <PieChart data={pieData} height={250} />
    }
    if (type === 'bar') {
        const topUsers = Object.values(data)
            .sort((a, b) => {
                const avgA = a.scores.reduce((sum, s) => sum + s.score, 0) / a.scores.length;
                const avgB = b.scores.reduce((sum, s) => sum + s.score, 0) / b.scores.length;
                return avgB - avgA;
            })
            .slice(0, 10);
         const barData = {
            labels: topUsers.map(u => u.name.length > 15 ? u.name.substring(0, 15) + '...' : u.name),
            datasets: [
                {
                    label: 'Average Score (%)',
                    data: topUsers.map(u => 
                        u.scores.reduce((sum, s) => sum + s.score, 0) / u.scores.length
                    ),
                    color: '#3b82f6',
                }
            ]
        };
        return <BarChart data={barData} height={250} />;
    }
    const firstUser = Object.values(data)[0];
    if (firstUser && firstUser.scores) {
        const lineData = {
            labels: firstUser.scores.map(s => `Month ${s.month}`),
            datasets: [
                {
                    label: firstUser.name,
                    data: firstUser.scores.map(s => s.score),
                    color: '#3b82f6',
                }
            ],
            yAxisLabel: 'Score (%)'
        };
        return <LineChart data={lineData} height={250} />
    }
    return <div className={styles.noData}>No data available</div>;
};
ScoreTrendChart.propTypes = {
    data: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
    ]).isRequired,
    type: PropTypes.oneOf(['line', 'bar', 'pie']),
};
export default ScoreTrendChart;