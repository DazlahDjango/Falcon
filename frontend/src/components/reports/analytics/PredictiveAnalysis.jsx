// frontend/src/components/reports/analytics/PredictiveAnalysis.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { ReportLoading } from '../common';
import { AnalyticsChart } from './AnalyticsChart';
import './analytics.css';

export const PredictiveAnalysis = ({ data, loading = false }) => {
    if (loading) {
        return <ReportLoading variant="spinner" text="Generating predictions..." />;
    }

    if (!data) {
        return (
            <div className="analytics-empty">
                <span className="empty-icon">🔮</span>
                <p>No predictive data available</p>
                <span className="empty-hint">Run a predictive analysis to see results</span>
            </div>
        );
    }

    const {
        forecast = [],
        confidence_intervals = [],
        last_actual = 0,
        trend_direction = 'stable',
        method = 'linear',
    } = data;

    const periods = forecast.map((_, idx) => `Period ${idx + 1}`);

    const chartData = {
        labels: ['Actual', ...periods],
        datasets: [
            {
                label: 'Historical',
                data: [last_actual, ...forecast],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: false,
                pointRadius: 4,
            },
            ...(confidence_intervals.length > 0 ? [{
                label: 'Upper Bound',
                data: [last_actual, ...confidence_intervals.map((c) => c.upper || c.forecast + 10)],
                borderColor: 'rgba(37, 99, 235, 0.2)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: false,
                borderDash: [3, 3],
                pointRadius: 0,
            }, {
                label: 'Lower Bound',
                data: [last_actual, ...confidence_intervals.map((c) => c.lower || c.forecast - 10)],
                borderColor: 'rgba(37, 99, 235, 0.2)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: '+1',
                borderDash: [3, 3],
                pointRadius: 0,
            }] : []),
        ],
    };

    const getDirectionColor = () => {
        if (trend_direction === 'upward') return '#10b981';
        if (trend_direction === 'downward') return '#ef4444';
        return '#94a3b8';
    };

    const getDirectionIcon = () => {
        if (trend_direction === 'upward') return '↑';
        if (trend_direction === 'downward') return '↓';
        return '→';
    };

    return (
        <div className="predictive-analysis">
            <div className="predictive-stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Method</span>
                    <span className="stat-value">{method}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Forecast Periods</span>
                    <span className="stat-value">{forecast.length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Trend Direction</span>
                    <span className="stat-value" style={{ color: getDirectionColor() }}>
                        {getDirectionIcon()} {trend_direction}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Last Actual</span>
                    <span className="stat-value">{last_actual.toFixed(2)}</span>
                </div>
                {forecast.length > 0 && (
                    <div className="stat-card">
                        <span className="stat-label">Next Forecast</span>
                        <span className="stat-value" style={{ color: getDirectionColor() }}>
                            {forecast[0].toFixed(2)}
                        </span>
                    </div>
                )}
                {forecast.length > 1 && (
                    <div className="stat-card">
                        <span className="stat-label">Final Forecast</span>
                        <span className="stat-value" style={{ color: getDirectionColor() }}>
                            {forecast[forecast.length - 1].toFixed(2)}
                        </span>
                    </div>
                )}
            </div>

            <div className="analytics-chart-container">
                <AnalyticsChart
                    data={chartData}
                    type="line"
                    title="Forecast"
                    height={300}
                />
            </div>

            {confidence_intervals.length > 0 && (
                <div className="predictive-confidence">
                    <h4>Confidence Intervals</h4>
                    <div className="confidence-grid">
                        {confidence_intervals.slice(0, 5).map((interval, idx) => (
                            <div key={idx} className="confidence-item">
                                <span className="period">Period {idx + 1}</span>
                                <span className="range">
                                    {interval.lower?.toFixed(2) || '-'} - {interval.upper?.toFixed(2) || '-'}
                                </span>
                                <span className="confidence-level">
                                    {((interval.confidence || 0.95) * 100).toFixed(0)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

PredictiveAnalysis.propTypes = {
    data: PropTypes.object,
    loading: PropTypes.bool,
};