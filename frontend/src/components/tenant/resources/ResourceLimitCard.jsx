// frontend/src/components/tenant/resources/ResourceLimitCard.jsx
import React from 'react';
import { FiZap } from 'react-icons/fi';
import './resources.css';

export const ResourceLimitCard = ({ title, icon, current, limit, softLimit, hardLimit, burstAllowed, unit = '', format }) => {
    // Use soft limit as warning threshold if available
    const warningLimit = softLimit || limit;
    const percentage = limit > 0 ? (current / limit) * 100 : 0;
    const warningPercentage = warningLimit > 0 ? (current / warningLimit) * 100 : 0;

    let progressClass = 'resource-progress-fill';
    let statusText = 'Good';

    if (percentage >= 100) {
        progressClass = 'resource-progress-fill-critical';
        statusText = 'Exceeded';
    } else if (warningPercentage >= 100 || percentage >= 90) {
        progressClass = 'resource-progress-fill-critical';
        statusText = 'Critical';
    } else if (percentage >= 80) {
        progressClass = 'resource-progress-fill-warning';
        statusText = 'Warning';
    }

    const displayCurrent = format ? format(current) : `${current}${unit}`;
    const displayLimit = format ? format(limit) : `${limit}${unit}`;

    return (
        <div className="resource-card">
            <div className="resource-card-header">
                <span className="resource-card-title">
                    <span className="mr-1">{icon}</span> {title}
                </span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                        percentage >= 90 ? 'bg-red-100 text-red-700' :
                        percentage >= 80 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                    }`}>
                        {statusText}
                    </span>
                    {burstAllowed && (
                        <span style={{
                            fontSize: '10px', fontWeight: 600, color: '#7c3aed',
                            background: '#ede9fe', padding: '1px 5px', borderRadius: '4px',
                            display: 'inline-flex', alignItems: 'center', gap: '2px'
                        }}>
                            <FiZap size={9} /> Burst
                        </span>
                    )}
                </div>
            </div>

            <div className="resource-card-value">
                {displayCurrent}
                <span className="resource-card-unit"> / {displayLimit}</span>
            </div>

            {/* Soft & hard limit badges */}
            {(softLimit || hardLimit) && (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    {softLimit && (
                        <span style={{ fontSize: '10px', color: '#92400e', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>
                            Soft: {softLimit}{unit}
                        </span>
                    )}
                    {hardLimit && (
                        <span style={{ fontSize: '10px', color: '#991b1b', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>
                            Hard: {hardLimit}{unit}
                        </span>
                    )}
                </div>
            )}

            <div className="resource-progress-container">
                <div className="resource-progress-bar">
                    {/* Soft limit marker line */}
                    {softLimit && limit > 0 && (
                        <div style={{
                            position: 'absolute', top: 0, bottom: 0,
                            left: `${Math.min((softLimit / limit) * 100, 100)}%`,
                            width: '2px', background: '#f59e0b', zIndex: 1,
                        }} />
                    )}
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