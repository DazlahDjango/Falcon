// frontend/src/components/tenant/resources/QuotaWarningAlert.jsx
import React from 'react';
import './resources.css';

export const QuotaWarningAlert = ({ warning, onDismiss }) => {
    const isCritical = warning.severity === 'critical' || warning.percentage >= 90;

    return (
        <div className={`quota-warning ${isCritical ? 'quota-warning-critical' : 'quota-warning-warning'}`}>
            <div className="quota-warning-icon">
                {isCritical ? '⚠️' : '⚡'}
            </div>
            <div className="quota-warning-content">
                <div className="quota-warning-title">
                    {warning.title || `${warning.resource_type} Quota Warning`}
                </div>
                <div className="quota-warning-message">
                    {warning.message || `You have used ${warning.percentage?.toFixed(1)}% of your ${warning.resource_type} limit (${warning.current}/${warning.limit}).`}
                </div>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
            )}
        </div>
    );
};