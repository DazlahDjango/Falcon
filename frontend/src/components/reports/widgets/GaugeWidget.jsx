// frontend/src/components/reports/widgets/GaugeWidget.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './widgets.css';

export const GaugeWidget = ({ widget, data }) => {
    const {
        value = 0,
        min = 0,
        max = 100,
        target = 80,
        threshold_low = 50,
        threshold_medium = 80,
        status = 'good',
        percentage = 0,
    } = data;

    const getStatusColor = (status) => {
        const colors = {
            good: '#10b981',
            warning: '#f59e0b',
            critical: '#ef4444',
        };
        return colors[status] || '#10b981';
    };

    const getStatusLabel = (status) => {
        const labels = {
            good: 'Good',
            warning: 'Warning',
            critical: 'Critical',
        };
        return labels[status] || 'Good';
    };

    const getStatusIcon = (status) => {
        const icons = {
            good: '✅',
            warning: '⚠️',
            critical: '🚨',
        };
        return icons[status] || '✅';
    };

    const getPercentage = () => {
        if (typeof percentage === 'number') return percentage;
        if (max === min) return 0;
        return ((value - min) / (max - min)) * 100;
    };

    const progress = getPercentage();
    const normalizedValue = Math.min(Math.max(progress, 0), 100);

    const angle = (normalizedValue / 100) * 180;
    const strokeDasharray = `${(angle / 180) * 100}, 100`;

    const getColor = () => {
        if (normalizedValue >= threshold_medium) return '#10b981';
        if (normalizedValue >= threshold_low) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="gauge-widget">
            <div className="gauge-container">
                <svg className="gauge-svg" viewBox="0 0 200 120">
                    <path
                        className="gauge-background"
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="16"
                        strokeLinecap="round"
                    />
                    <path
                        className="gauge-foreground"
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke={getColor()}
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset="0"
                        style={{ transition: 'stroke-dasharray 1s ease' }}
                    />
                    <text
                        x="100"
                        y="80"
                        className="gauge-value"
                        textAnchor="middle"
                        fontSize="28"
                        fontWeight="bold"
                        fill="#0f172a"
                    >
                        {typeof value === 'number' ? value.toFixed(1) : value}
                    </text>
                    <text
                        x="100"
                        y="100"
                        className="gauge-label"
                        textAnchor="middle"
                        fontSize="12"
                        fill="#64748b"
                    >
                        {widget?.title || 'Value'}
                    </text>
                </svg>
            </div>

            <div className="gauge-info">
                <div className="gauge-target">
                    <span className="gauge-info-label">Target:</span>
                    <span className="gauge-info-value">{target}</span>
                </div>
                <div className="gauge-status" style={{ color: getStatusColor(status) }}>
                    {getStatusIcon(status)} {getStatusLabel(status)}
                </div>
            </div>

            <div className="gauge-thresholds">
                <div className="threshold-bar">
                    <div
                        className="threshold-segment"
                        style={{ width: `${threshold_low}%`, background: '#ef4444' }}
                    />
                    <div
                        className="threshold-segment"
                        style={{ width: `${threshold_medium - threshold_low}%`, background: '#f59e0b' }}
                    />
                    <div
                        className="threshold-segment"
                        style={{ width: `${100 - threshold_medium}%`, background: '#10b981' }}
                    />
                </div>
                <div className="threshold-labels">
                    <span>{min}</span>
                    <span>{threshold_low}</span>
                    <span>{threshold_medium}</span>
                    <span>{max}</span>
                </div>
            </div>
        </div>
    );
};

GaugeWidget.propTypes = {
    widget: PropTypes.object.isRequired,
    data: PropTypes.object,
};