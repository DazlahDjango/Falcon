import React from 'react';
import PropTypes from 'prop-types';
import { BarChart } from '../../common/KPIChart';
import styles from './ManagerDashboard.module.css';

const TeamPerformanceChart = ({ teamMembers }) => {
    const chartData = {
        labels: teamMembers.map(m => m.name?.split(' ')[0] || 'User'),
        datasets: [
            {
                label: 'Performance Score (%)',
                data: teamMembers.map(m => m.score || 0),
                color: '#3b82f6',
            }
        ],
        yAxisLabel: 'Score (%)'
    };
    const options = {
        tooltip: {
            formatter: (params) => {
                return `${params.name}: ${params.value.toFixed(1)}%`;
            }
        }
    };
    if (!teamMembers || teamMembers.length === 0) {
        return (
            <div className={styles.chartPlaceholder}>
                <p>No team member data available</p>
            </div>
        );
    }
    return (
        <div className={styles.chartContainer}>
            <h4>Team Performance Distribution</h4>
            <BarChart 
                data={chartData}
                options={options}
                height={300}
            />
            <div className={styles.chartNote}>
                * Scores shown as percentage of target achievement
            </div>
        </div>
    );
};
TeamPerformanceChart.propTypes = {
    teamMembers: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        score: PropTypes.number,
    })),
};
TeamPerformanceChart.defaultProps = {
    teamMembers: [],
};
export default TeamPerformanceChart;