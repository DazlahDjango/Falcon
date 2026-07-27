// frontend/src/components/reports/analytics/AnalyticsChart.jsx
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js/auto';
import './analytics.css';

export const AnalyticsChart = ({
    data,
    type = 'bar',
    title = '',
    height = 300,
    className = '',
}) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current || !data) return;

        const ctx = chartRef.current.getContext('2d');

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const chartData = {
            labels: data.labels || [],
            datasets: data.datasets || [],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: data.datasets?.length > 1,
                    position: 'top',
                },
                tooltip: {
                    enabled: true,
                },
                title: {
                    display: !!title,
                    text: title,
                    font: {
                        size: 16,
                        weight: '600',
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            if (Number.isInteger(value)) {
                                return value;
                            }
                            return value.toFixed(1);
                        },
                    },
                },
            },
        };

        if (type === 'pie' || type === 'doughnut') {
            delete options.scales;
        }

        chartInstance.current = new Chart(ctx, {
            type: type,
            data: chartData,
            options: options,
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, type, title]);

    if (!data || !data.labels || data.labels.length === 0) {
        return (
            <div className="analytics-chart-empty">
                <p>No data to display</p>
            </div>
        );
    }

    return (
        <div className={`analytics-chart ${className}`} style={{ height: `${height}px` }}>
            <canvas ref={chartRef} />
        </div>
    );
};

AnalyticsChart.propTypes = {
    data: PropTypes.shape({
        labels: PropTypes.array,
        datasets: PropTypes.array,
    }).isRequired,
    type: PropTypes.oneOf(['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'scatter']),
    title: PropTypes.string,
    height: PropTypes.number,
    className: PropTypes.string,
};