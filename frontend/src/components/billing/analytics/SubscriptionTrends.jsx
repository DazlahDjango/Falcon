import React from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { ArcElement } from 'chart.js';

ChartJS.register(ArcElement);

export const SubscriptionTrends = ({ data, loading }) => {
    if (loading) {
        return <div className="subscription-trends-skeleton">Loading...</div>;
    }

    if (!data) {
        return (
            <div className="subscription-trends-empty">
                <p>No subscription data available</p>
            </div>
        );
    }

    const planDistribution = {
        labels: [],
        datasets: [
            {
                data: [],
                backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#6b7280'],
                borderWidth: 0,
            },
        ],
    };

    Object.entries(data.by_plan_type || {}).forEach(([plan, count]) => {
        if (count > 0) {
            planDistribution.labels.push(plan.charAt(0).toUpperCase() + plan.slice(1));
            planDistribution.datasets[0].data.push(count);
        }
    });

    const statusDistribution = {
        labels: ['Active', 'Trialing', 'Past Due', 'Cancelled', 'Expired'],
        datasets: [
            {
                data: [
                    data.total_active || 0,
                    data.total_trialing || 0,
                    data.total_past_due || 0,
                    data.total_cancelled || 0,
                    data.total_expired || 0,
                ],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6b7280', '#9ca3af'],
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
                        return `${label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };

    return (
        <div className="subscription-trends">
            <div className="subscription-trends-grid">
                <div className="subscription-trends-card">
                    <h4>Plan Distribution</h4>
                    <div className="subscription-trends-chart">
                        <Doughnut data={planDistribution} options={options} />
                    </div>
                </div>
                <div className="subscription-trends-card">
                    <h4>Status Distribution</h4>
                    <div className="subscription-trends-chart">
                        <Doughnut data={statusDistribution} options={options} />
                    </div>
                </div>
            </div>

            <div className="subscription-trends-stats">
                <div className="trend-stat">
                    <span className="trend-stat-label">Total Subscriptions</span>
                    <span className="trend-stat-value">{data.total_active + data.total_trialing + data.total_cancelled + data.total_expired || 0}</span>
                </div>
                <div className="trend-stat">
                    <span className="trend-stat-label">Active</span>
                    <span className="trend-stat-value success">{data.total_active || 0}</span>
                </div>
                <div className="trend-stat">
                    <span className="trend-stat-label">Growth Rate</span>
                    <span className="trend-stat-value">{data.growth_rate || 0}%</span>
                </div>
            </div>
        </div>
    );
};

SubscriptionTrends.propTypes = {
    data: PropTypes.shape({
        total_active: PropTypes.number,
        total_trialing: PropTypes.number,
        total_past_due: PropTypes.number,
        total_cancelled: PropTypes.number,
        total_expired: PropTypes.number,
        by_plan_type: PropTypes.object,
        growth_rate: PropTypes.number,
    }),
    loading: PropTypes.bool,
};

export default SubscriptionTrends;