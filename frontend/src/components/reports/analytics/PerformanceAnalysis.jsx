// frontend/src/components/reports/analytics/PerformanceAnalysis.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { ReportLoading } from '../common';
import { AnalyticsChart } from './AnalyticsChart';
import './analytics.css';

export const PerformanceAnalysis = ({ data, loading = false }) => {
    if (loading) {
        return <ReportLoading variant="spinner" text="Analyzing performance..." />;
    }

    if (!data) {
        return (
            <div className="analytics-empty">
                <span className="empty-icon">📊</span>
                <p>No performance data available</p>
                <span className="empty-hint">Run a performance analysis to see results</span>
            </div>
        );
    }

    const {
        items = [],
        summary = {},
        rankings = {},
        status_distribution = {},
    } = data;

    const {
        total_items = 0,
        average_progress = 0,
        average_performance = 0,
        completion_rate = 0,
        on_track = 0,
        at_risk = 0,
        off_track = 0,
    } = summary;

    const topPerformers = rankings?.top_performers || [];
    const bottomPerformers = rankings?.bottom_performers || [];

    const statusColors = {
        'On Track': '#10b981',
        'At Risk': '#f59e0b',
        'Off Track': '#ef4444',
        'Pending': '#94a3b8',
    };

    const chartData = {
        labels: items.slice(0, 20).map((item) => item.name || 'Unknown'),
        datasets: [
            {
                label: 'Progress',
                data: items.slice(0, 20).map((item) => item.progress || 0),
                backgroundColor: items.slice(0, 20).map((item) =>
                    statusColors[item.status] || '#94a3b8'
                ),
            },
        ],
    };

    const statusChartData = {
        labels: Object.keys(status_distribution),
        datasets: [
            {
                label: 'Status Distribution',
                data: Object.values(status_distribution),
                backgroundColor: Object.keys(status_distribution).map(
                    (key) => statusColors[key] || '#94a3b8'
                ),
            },
        ],
    };

    return (
        <div className="performance-analysis">
            <div className="performance-stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Total Items</span>
                    <span className="stat-value">{total_items}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Avg Progress</span>
                    <span className="stat-value">{average_progress.toFixed(1)}%</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Avg Performance</span>
                    <span className="stat-value">{average_performance.toFixed(1)}%</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Completion Rate</span>
                    <span className="stat-value">{completion_rate.toFixed(1)}%</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">On Track</span>
                    <span className="stat-value" style={{ color: '#10b981' }}>
                        {on_track}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">At Risk</span>
                    <span className="stat-value" style={{ color: '#f59e0b' }}>
                        {at_risk}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Off Track</span>
                    <span className="stat-value" style={{ color: '#ef4444' }}>
                        {off_track}
                    </span>
                </div>
            </div>

            <div className="analytics-charts-grid">
                <div className="analytics-chart-container">
                    <AnalyticsChart
                        data={chartData}
                        type="bar"
                        title="Progress by Item"
                        height={250}
                    />
                </div>
                <div className="analytics-chart-container">
                    <AnalyticsChart
                        data={statusChartData}
                        type="pie"
                        title="Status Distribution"
                        height={250}
                    />
                </div>
            </div>

            <div className="performance-rankings">
                {topPerformers.length > 0 && (
                    <div className="rankings-section">
                        <h4>🏆 Top Performers</h4>
                        <div className="rankings-list">
                            {topPerformers.map((item, idx) => (
                                <div key={idx} className="ranking-item">
                                    <span className="rank">{idx + 1}</span>
                                    <span className="rank-name">{item.name || 'Unknown'}</span>
                                    <span className="rank-score" style={{ color: '#10b981' }}>
                                        {item.progress?.toFixed(1) || 0}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {bottomPerformers.length > 0 && (
                    <div className="rankings-section">
                        <h4>⚠️ Bottom Performers</h4>
                        <div className="rankings-list">
                            {bottomPerformers.map((item, idx) => (
                                <div key={idx} className="ranking-item">
                                    <span className="rank">{idx + 1}</span>
                                    <span className="rank-name">{item.name || 'Unknown'}</span>
                                    <span className="rank-score" style={{ color: '#ef4444' }}>
                                        {item.progress?.toFixed(1) || 0}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

PerformanceAnalysis.propTypes = {
    data: PropTypes.object,
    loading: PropTypes.bool,
};