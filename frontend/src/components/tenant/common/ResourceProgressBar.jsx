// frontend/src/components/tenant/common/ResourceProgressBar.jsx
import React from 'react';
import { QUOTA_WARNING_THRESHOLDS } from '../../../config/constants/tenantConstants';

export const ResourceProgressBar = ({ current, limit, label, unit = '', showPercentage = true, showLabel = true }) => {
    const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;

    let color = 'bg-green-500';
    let statusText = '';

    if (percentage >= QUOTA_WARNING_THRESHOLDS.CRITICAL) {
        color = 'bg-red-500';
        statusText = 'Critical';
    } else if (percentage >= QUOTA_WARNING_THRESHOLDS.WARNING) {
        color = 'bg-yellow-500';
        statusText = 'Warning';
    } else if (percentage >= QUOTA_WARNING_THRESHOLDS.EXCEEDED) {
        color = 'bg-red-700';
        statusText = 'Exceeded';
    } else {
        statusText = 'Good';
    }

    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <div className="flex items-center gap-2">
                        {statusText && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${color === 'bg-green-500' ? 'bg-green-100 text-green-700' :
                                    color === 'bg-yellow-500' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {statusText}
                            </span>
                        )}
                        {showPercentage && (
                            <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                        )}
                    </div>
                </div>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`${color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Used: {current}{unit}</span>
                <span>Limit: {limit}{unit}</span>
                <span>Remaining: {Math.max(0, limit - current)}{unit}</span>
            </div>
        </div>
    );
};