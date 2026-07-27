// frontend/src/components/reports/widgets/ChartWidget.jsx
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js/auto';
import './widgets.css';

export const ChartWidget = ({ widget, data }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;

        const ctx = chartRef.current.getContext('2d');

        const chartData = data?.chart_data || data;
        const chartType = data?.chart_type || widget?.config?.chart_type || 'bar';
        const labels = chartData?.labels || data?.labels || [];
        const datasets = chartData?.datasets || data?.datasets || [];
        const colors = data?.colors || ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const config = {
            type: chartType,
            data: {
                labels: labels,
                datasets: datasets.length > 0 ? datasets : [{
                    label: widget?.title || 'Data',
                    data: chartData?.values || data?.values || [],
                    backgroundColor: colors,
                    borderColor: colors.map(c => c),
                    borderWidth: 2,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: data?.show_legend !== false,
                        position: 'top',
                    },
                    tooltip: {
                        enabled: true,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        };

        chartInstance.current = new Chart(ctx, config);

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, widget]);

    if (!data) {
        return (
            <div className="chart-placeholder">
                <p>No chart data available</p>
            </div>
        );
    }

    return (
        <div className="chart-widget">
            <canvas ref={chartRef} />
        </div>
    );
};

ChartWidget.propTypes = {
    widget: PropTypes.object.isRequired,
    data: PropTypes.object,
};