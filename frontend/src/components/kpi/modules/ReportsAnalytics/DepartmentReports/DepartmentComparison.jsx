import React from 'react';
import PropTypes from 'prop-types';
import { PieChart, BarChart } from '../../../common';
import styles from './DepartmentReports.module.css';

const DepartmentComparison = ({ data, type = 'bar' }) => {
    if (type === 'pie') {
        const pieData = {
            labels: data.labels,
            values: data.values,
            colors: data.colors
        };
        
        return <PieChart data={pieData} height={250} />;
    }
    const barData = {
        labels: data.map(d => d.name),
        datasets: [
            {
                label: 'Score (%)',
                data: data.map(d => d.score),
                color: '#3b82f6',
            }
        ],
        yAxisLabel: 'Score (%)'
    };
    return <BarChart data={barData} height={250} />;
};
DepartmentComparison.propTypes = {
    data: PropTypes.oneOfType([
        PropTypes.shape({
            labels: PropTypes.array,
            values: PropTypes.array,
            colors: PropTypes.array
        }),
        PropTypes.array
    ]).isRequired,
    type: PropTypes.oneOf(['bar', 'pie']),
};
export default DepartmentComparison;