// src/components/reviews/reviewAnalytics/ReviewManagerAnalytics.jsx
import React from 'react';
import './analytics.css';

const ReviewManagerAnalytics = ({ managers, onManagerClick, loading }) => {
    if (loading) {
        return <div className="analytics-loading">Loading managers...</div>;
    }

    if (!managers || managers.length === 0) {
        return <div className="analytics-empty">No manager data available</div>;
    }

    const sortedManagers = [...managers].sort((a, b) => (b.team_average_score || 0) - (a.team_average_score || 0));

    const getRatingClass = (score) => {
        if (score >= 4) return 'rating-excellent';
        if (score >= 3) return 'rating-good';
        if (score >= 2) return 'rating-average';
        return 'rating-poor';
    };

    const getInflationClass = (score) => {
        if (!score) return '';
        if (score > 0.5) return 'trend-up';
        if (score > 0.2) return 'trend-neutral';
        return 'trend-down';
    };

    return (
        <div className="chart-card">
            <div className="chart-title">Manager Performance</div>
            <div className="analytics-list">
                <div className="list-header">
                    <span>Manager</span>
                    <span>Team Size</span>
                    <span>Team Avg</span>
                    <span>Inflation</span>
                </div>
                {sortedManagers.map(manager => (
                    <div
                        key={manager.id}
                        className="list-row"
                        onClick={() => onManagerClick?.(manager.id)}
                    >
                        <span className="list-row-name">{manager.name}</span>
                        <span>{manager.team_size || 0}</span>
                        <span className="list-row-score">{manager.team_average_score?.toFixed(1) || 'N/A'}</span>
                        <span className={getInflationClass(manager.rating_inflation_score)}>
                            {manager.rating_inflation_score?.toFixed(2) || '0.00'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewManagerAnalytics;