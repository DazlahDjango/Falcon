import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export const RevenueChart = ({ data, loading, type = 'line', height = 300 }) => {
    if (loading) {
        return (
            <div className="revenue-chart-skeleton">
                <div className="skeleton-chart"></div>
            </div>
        );
    }

    if (!data || !data.breakdown || data.breakdown.length === 0) {
        return (
            <div className="revenue-chart-empty">
                <p>No revenue data available</p>
            </div>
        );
    }

    const chartData = {
        labels: data.breakdown.map(item => {
            if (item.date) return new Date(item.date).toLocaleDateString();
            if (item.month) return item.month;
            if (item.week) return item.week;
            return '';
        }),
        datasets: [
            {
                label: 'Revenue',
                data: data.breakdown.map(item => (item.total || 0) / 100),
                borderColor: '#2563eb',
                backgroundColor: type === 'line' ? 'rgba(37, 99, 235, 0.1)' : '#2563eb',
                fill: type === 'line',
                tension: 0.4,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#fff',
                pointRadius: 4,
                pointHoverRadius: 6,
                barPercentage: 0.7,
                categoryPercentage: 0.8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        label += `KES ${context.raw.toLocaleString()}`;
                        return label;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => `KES ${value.toLocaleString()}`,
                },
                title: {
                    display: true,
                    text: 'Amount (KES)',
                },
            },
            x: {
                title: {
                    display: true,
                    text: data.period === 'daily' ? 'Date' : data.period === 'weekly' ? 'Week' : 'Month',
                },
            },
        },
    };

    const ChartComponent = type === 'line' ? Line : Bar;

    return (
        <div className="revenue-chart" style={{ height: `${height}px` }}>
            <ChartComponent data={chartData} options={options} />
        </div>
    );
};

RevenueChart.propTypes = {
    data: PropTypes.shape({
        breakdown: PropTypes.array,
        period: PropTypes.string,
        total_revenue: PropTypes.number,
    }),
    loading: PropTypes.bool,
    type: PropTypes.oneOf(['line', 'bar']),
    height: PropTypes.number,
};

export default RevenueChart;