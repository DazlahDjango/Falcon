// frontend/src/components/reports/widgets/KPIWidget.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './widgets.css';

export const KPIWidget = ({ widget, data }) => {
    const {
        value = 0,
        target = 0,
        progress = 0,
        status = 'Pending',
        unit = '',
        trend = 0,
        trendDirection = 'stable',
        comparison = {},
    } = data;

    const getStatusColor = (status) => {
        const colors = {
            'On Track': '#10b981',
            'At Risk': '#f59e0b',
            'Off Track': '#ef4444',
            'Pending': '#94a3b8',
            'Completed': '#10b981',
        };
        return colors[status] || '#94a3b8';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'On Track': '✅',
            'At Risk': '⚠️',
            'Off Track': '❌',
            'Pending': '⏳',
            'Completed': '✅',
        };
        return icons[status] || '📊';
    };

    const formatValue = (val) => {
        if (val === undefined || val === null) return '-';
        if (typeof val === 'number') {
            if (Number.isInteger(val)) return val.toLocaleString();
            return val.toFixed(2);
        }
        return String(val);
    };

    const getTrendIcon = () => {
        if (trendDirection === 'up') return '↑';
        if (trendDirection === 'down') return '↓';
        return '→';
    };

    const getTrendColor = () => {
        if (trendDirection === 'up') return '#10b981';
        if (trendDirection === 'down') return '#ef4444';
        return '#94a3b8';
    };

    return (
        <div className="kpi-widget">
            <div className="kpi-value-section">
                <div className="kpi-main-value">
                    <span className="kpi-value">{formatValue(value)}</span>
                    {unit && <span className="kpi-unit">{unit}</span>}
                </div>
                <div className="kpi-status">
                    <span
                        className="kpi-status-badge"
                        style={{ backgroundColor: getStatusColor(status) }}
                    >
                        {getStatusIcon(status)} {status}
                    </span>
                </div>
            </div>

            <div className="kpi-target-section">
                <span className="kpi-target-label">Target:</span>
                <span className="kpi-target-value">{formatValue(target)}</span>
                <span className="kpi-progress">
                    {typeof progress === 'number' ? `${progress.toFixed(1)}%` : '-'}
                </span>
            </div>

            <div className="kpi-progress-bar">
                <div
                    className="kpi-progress-fill"
                    style={{
                        width: `${Math.min(Math.max(progress, 0), 100)}%`,
                        backgroundColor: getStatusColor(status),
                    }}
                />
            </div>

            <div className="kpi-footer">
                {trend !== 0 && (
                    <span className="kpi-trend" style={{ color: getTrendColor() }}>
                        {getTrendIcon()} {typeof trend === 'number' ? trend.toFixed(1) : trend}%
                    </span>
                )}
                {Object.keys(comparison).length > 0 && (
                    <span className="kpi-comparison">
                        {Object.entries(comparison).map(([key, val]) => (
                            <span key={key} className="comparison-item">
                                {key}: {formatValue(val)}
                            </span>
                        ))}
                    </span>
                )}
            </div>
        </div>
    );
};

KPIWidget.propTypes = {
    widget: PropTypes.object.isRequired,
    data: PropTypes.object,
};