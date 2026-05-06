// frontend/src/components/tenant/resources/UsageChart.jsx
import React from 'react';
import './resources.css';

const UsageChart = ({ data, title }) => {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="chart-container">
                <div className="resource-text-center resource-p-8 resource-text-gray-500">
                    No usage data available
                </div>
            </div>
        );
    }

    return (
        <div className="chart-container">
            <h3 className="chart-title">{title || 'Usage Statistics'}</h3>
            <div className="space-y-4">
                {Object.entries(data).map(([key, value]) => {
                    const percentage = value.limit > 0 ? (value.current / value.limit) * 100 : 0;
                    const isWarning = percentage > 75;
                    const isCritical = percentage > 90;

                    let fillClass = 'resource-progress-fill';
                    if (isCritical) fillClass += ' resource-progress-fill-critical';
                    else if (isWarning) fillClass += ' resource-progress-fill-warning';

                    return (
                        <div key={key}>
                            <div className="resource-flex resource-justify-between resource-mb-1">
                                <span className="resource-text-sm resource-font-bold">
                                    {key.replace(/_/g, ' ').toUpperCase()}
                                </span>
                                <span className="resource-text-sm resource-text-gray-500">
                                    {value.current || 0} / {value.limit || 0}
                                </span>
                            </div>
                            <div className="resource-progress-container">
                                <div className="resource-progress-bar">
                                    <div
                                        className={fillClass}
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                    />
                                </div>
                                <div className="resource-progress-text">
                                    <span>{percentage.toFixed(1)}% used</span>
                                    {isWarning && (
                                        <span className={isCritical ? 'resource-text-red-600' : 'resource-text-yellow-600'}>
                                            {isCritical ? 'Critical!' : 'Warning!'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export { UsageChart };