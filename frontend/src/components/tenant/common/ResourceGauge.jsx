// frontend/src/components/tenant/common/ResourceGauge.jsx
import React from 'react';
import { QUOTA_WARNING_THRESHOLDS } from '../../../config/constants/tenantConstants';

export const ResourceGauge = ({ current, limit, label, unit = '' }) => {
    const percentage = limit > 0 ? (current / limit) * 100 : 0;

    let color = 'bg-green-500';
    if (percentage >= QUOTA_WARNING_THRESHOLDS.CRITICAL) {
        color = 'bg-red-500';
    } else if (percentage >= QUOTA_WARNING_THRESHOLDS.WARNING) {
        color = 'bg-yellow-500';
    }

    return (
        <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{label}</span>
                <span className="text-gray-600">
                    {current}{unit} / {limit}{unit}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className={`${color} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
                {percentage.toFixed(1)}% used
            </div>
        </div>
    );
};