// frontend/src/components/reports/analytics/ComparativeAnalysis.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { ReportLoading } from '../common';
import { AnalyticsChart } from './AnalyticsChart';
import './analytics.css';

export const ComparativeAnalysis = ({ data, loading = false }) => {
    if (loading) {
        return <ReportLoading variant="spinner" text="Comparing data..." />;
    }

    if (!data) {
        return (
            <div className="analytics-empty">
                <span className="empty-icon">⚖️</span>
                <p>No comparative data available</p>
                <span className="empty-hint">Run a comparative analysis to see results</span>
            </div>
        );
    }

    const {
        groups = {},
        rankings = [],
        top_group = null,
        bottom_group = null,
        overall_avg = 0,
    } = data;

    const groupNames = Object.keys(groups);
    const groupValues = groupNames.map((name) => groups[name]?.avg || 0);
    const groupColors = groupNames.map((_, idx) => {
        const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
        return colors[idx % colors.length];
    });

    const chartData = {
        labels: groupNames,
        datasets: [
            {
                label: 'Average Performance',
                data: groupValues,
                backgroundColor: groupColors,
            },
        ],
    };

    const sortedRankings = rankings.slice(0, 10);

    return (
        <div className="comparative-analysis">
            <div className="comparative-stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Groups</span>
                    <span className="stat-value">{groupNames.length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Overall Average</span>
                    <span className="stat-value">{overall_avg.toFixed(1)}%</span>
                </div>
                {top_group && (
                    <div className="stat-card">
                        <span className="stat-label">Top Group</span>
                        <span className="stat-value" style={{ color: '#10b981' }}>
                            {top_group}
                        </span>
                    </div>
                )}
                {bottom_group && (
                    <div className="stat-card">
                        <span className="stat-label">Bottom Group</span>
                        <span className="stat-value" style={{ color: '#ef4444' }}>
                            {bottom_group}
                        </span>
                    </div>
                )}
            </div>

            <div className="analytics-chart-container">
                <AnalyticsChart
                    data={chartData}
                    type="bar"
                    title="Comparative Performance by Group"
                    height={300}
                />
            </div>

            <div className="comparative-rankings">
                <h4>Rankings</h4>
                <div className="rankings-list">
                    {sortedRankings.map((item, idx) => {
                        const [name, value] = Array.isArray(item) ? item : [item, 0];
                        const avg = typeof value === 'object' ? value.avg || 0 : value;
                        const isTop = idx < 3;
                        const isBottom = idx >= sortedRankings.length - 3;

                        return (
                            <div
                                key={idx}
                                className={`ranking-item ${isTop ? 'top' : ''} ${isBottom ? 'bottom' : ''}`}
                            >
                                <span className="rank">{idx + 1}</span>
                                <span className="rank-name">{name}</span>
                                <span
                                    className="rank-score"
                                    style={{
                                        color: isTop ? '#10b981' : isBottom ? '#ef4444' : '#475569',
                                    }}
                                >
                                    {typeof avg === 'number' ? avg.toFixed(1) : avg}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

ComparativeAnalysis.propTypes = {
    data: PropTypes.object,
    loading: PropTypes.bool,
};