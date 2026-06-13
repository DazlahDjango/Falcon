// src/components/reviews/reviewAnalytics/ReviewDepartmentComparison.jsx
import React from 'react';
import './analytics.css';

const ReviewDepartmentComparison = ({ departments, onDepartmentClick, loading }) => {
    if (loading) {
        return <div className="analytics-loading">Loading departments...</div>;
    }

    if (!departments || departments.length === 0) {
        return <div className="analytics-empty">No department data available</div>;
    }

    const sortedDepartments = [...departments].sort((a, b) => (b.average_score || 0) - (a.average_score || 0));

    const getRatingClass = (score) => {
        if (score >= 4) return 'rating-excellent';
        if (score >= 3) return 'rating-good';
        if (score >= 2) return 'rating-average';
        return 'rating-poor';
    };

    return (
        <div className="chart-card">
            <div className="chart-title">Department Performance</div>
            <div className="analytics-list">
                <div className="list-header">
                    <span>Department</span>
                    <span>Avg Score</span>
                    <span>Completion</span>
                    <span>Rating</span>
                </div>
                {sortedDepartments.map(dept => (
                    <div
                        key={dept.id}
                        className="list-row"
                        onClick={() => onDepartmentClick?.(dept.id)}
                    >
                        <span className="list-row-name">{dept.name}</span>
                        <span className="list-row-score">{dept.average_score?.toFixed(1) || 'N/A'}</span>
                        <span>{dept.completion_rate || 0}%</span>
                        <span>
                            <span className={`rating-badge ${getRatingClass(dept.average_score)}`}>
                                {dept.rating_label || 'N/A'}
                            </span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewDepartmentComparison;