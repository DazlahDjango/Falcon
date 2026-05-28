import React from 'react';
import PropTypes from 'prop-types';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

export const RevenueBreakdown = ({ data, loading }) => {
    if (loading) {
        return <div className="revenue-breakdown-skeleton">Loading...</div>;
    }

    if (!data || !data.by_plan || data.by_plan.length === 0) {
        return (
            <div className="revenue-breakdown-empty">
                <p>No revenue breakdown available</p>
            </div>
        );
    }

    const chartData = {
        labels: data.by_plan.map(item => item.plan_name || item.plan_type),
        datasets: [
            {
                data: data.by_plan.map(item => (item.revenue || 0) / 100),
                backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 15,
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: KES ${value.toLocaleString()} (${percentage}%)`;
                    },
                },
            },
        },
    };

    return (
        <div className="revenue-breakdown">
            <div className="revenue-breakdown-chart">
                <Pie data={chartData} options={options} />
            </div>
            <div className="revenue-breakdown-table">
                {data.by_plan.map((item, index) => (
                    <div key={index} className="breakdown-row">
                        <span className="breakdown-label">{item.plan_name || item.plan_type}</span>
                        <span className="breakdown-amount">
                            KES {((item.revenue || 0) / 100).toLocaleString()}
                        </span>
                        <span className="breakdown-percentage">
                            {((item.revenue / data.total_revenue) * 100).toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

RevenueBreakdown.propTypes = {
    data: PropTypes.shape({
        by_plan: PropTypes.array,
        total_revenue: PropTypes.number,
    }),
    loading: PropTypes.bool,
};

export default RevenueBreakdown;