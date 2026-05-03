// frontend/src/components/tenant/resources/ResourceLimitCard.jsx
import React from 'react';
import './resources.css';

export const ResourceLimitCard = ({ title, icon, current, limit, unit = '', format }) => {
    const percentage = limit > 0 ? (current / limit) * 100 : 0;

    let progressClass = 'resource-progress-fill';
    let statusText = '';

    if (percentage >= 100) {
        progressClass = 'resource-progress-fill-critical';
        statusText = 'Exceeded';
    } else if (percentage >= 90) {
        progressClass = 'resource-progress-fill-critical';
        statusText = 'Critical';
    } else if (percentage >= 80) {
        progressClass = 'resource-progress-fill-warning';
        statusText = 'Warning';
    } else {
        statusText = 'Good';
    }

    const displayCurrent = format ? format(current) : `${current}${unit}`;
    const displayLimit = format ? format(limit) : `${limit}${unit}`;

    return (
        <div className="resource-card">
            <div className="resource-card-header">
                <span className="resource-card-title">
                    <span className="mr-1">{icon}</span> {title}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${percentage >= 90 ? 'bg-red-100 text-red-700' :
                        percentage >= 80 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                    }`}>
                    {statusText}
                </span>
            </div>
            <div className="resource-card-value">
                {displayCurrent}
                <span className="resource-card-unit"> / {displayLimit}</span>
            </div>
            <div className="resource-progress-container">
                <div className="resource-progress-bar">
                    <div
                        className={progressClass}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
                <div className="resource-progress-text">
                    <span>{percentage.toFixed(1)}% used</span>
                    <span>{Math.max(0, limit - current)}{unit} remaining</span>
                </div>
            </div>
        </div>
    );
};