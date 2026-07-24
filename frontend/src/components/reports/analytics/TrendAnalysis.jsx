// frontend/src/components/reports/analytics/TrendAnalysis.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiArrowUp, FiArrowDown, FiMinus } from 'react-icons/fi';
import { ReportLoading } from '../common';
import { AnalyticsChart } from './AnalyticsChart';
import './analytics.css';

export const TrendAnalysis = ({ data, loading = false }) => {
    if (loading) {
        return <ReportLoading variant="spinner" text="Analyzing trends..." />;
    }

    if (!data) {
        return (
            <div className="analytics-empty">
                <span className="empty-icon">📈</span>
                <p>No trend data available</p>
                <span className="empty-hint">Run a trend analysis to see results</span>
            </div>
        );
    }

    const {
        periods = [],
        values = [],
        trend_line = [],
        trend_direction = 'stable',
        growth_rate = 0,
        mom_growth = [],
        yoy_growth = [],
        average = 0,
        min = 0,
        max = 0,
        volatility = 0,
    } = data;

    const getDirectionIcon = () => {
        if (trend_direction === 'upward') return <FiArrowUp size={20} className="trend-up" />;
        if (trend_direction === 'downward') return <FiArrowDown size={20} className="trend-down" />;
        return <FiMinus size={20} className="trend-stable" />;
    };

    const getDirectionColor = () => {
        if (trend_direction === 'upward') return '#10b981';
        if (trend_direction === 'downward') return '#ef4444';
        return '#94a3b8';
    };

    const getGrowthColor = (growth) => {
        if (growth > 0) return '#10b981';
        if (growth < 0) return '#ef4444';
        return '#94a3b8';
    };

    const chartData = {
        labels: periods,
        datasets: [
            {
                label: 'Values',
                data: values,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
            },
            ...(trend_line.length > 0 ? [{
                label: 'Trend Line',
                data: trend_line,
                borderColor: '#ef4444',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
            }] : []),
        ],
    };

    return (
        <div className="trend-analysis">
            <div className="trend-stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Direction</span>
                    <span className="stat-value" style={{ color: getDirectionColor() }}>
                        {getDirectionIcon()}
                        {trend_direction}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Growth Rate</span>
                    <span className="stat-value" style={{ color: getGrowthColor(growth_rate) }}>
                        {growth_rate > 0 ? '+' : ''}{growth_rate.toFixed(1)}%
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Average</span>
                    <span className="stat-value">{average.toFixed(2)}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Range</span>
                    <span className="stat-value">
                        {min.toFixed(2)} - {max.toFixed(2)}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Volatility</span>
                    <span className="stat-value">{volatility.toFixed(2)}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Data Points</span>
                    <span className="stat-value">{periods.length}</span>
                </div>
            </div>

            <div className="analytics-chart-container">
                <AnalyticsChart
                    data={chartData}
                    type="line"
                    title="Trend Analysis"
                    height={300}
                />
            </div>

            {(mom_growth.length > 0 || yoy_growth.length > 0) && (
                <div className="trend-growth-details">
                    {mom_growth.length > 0 && (
                        <div className="growth-section">
                            <h4>Month-over-Month Growth</h4>
                            <div className="growth-values">
                                {mom_growth.slice(-6).map((g, idx) => (
                                    <span
                                        key={idx}
                                        className="growth-value"
                                        style={{ color: getGrowthColor(g) }}
                                    >
                                        {g > 0 ? '+' : ''}{g.toFixed(1)}%
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {yoy_growth.length > 0 && (
                        <div className="growth-section">
                            <h4>Year-over-Year Growth</h4>
                            <div className="growth-values">
                                {yoy_growth.slice(-3).map((g, idx) => (
                                    <span
                                        key={idx}
                                        className="growth-value"
                                        style={{ color: getGrowthColor(g) }}
                                    >
                                        {g > 0 ? '+' : ''}{g.toFixed(1)}%
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

TrendAnalysis.propTypes = {
    data: PropTypes.object,
    loading: PropTypes.bool,
};