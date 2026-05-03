// frontend/src/components/tenant/dashboard/TenantAlertsWidget.jsx
import React from 'react';

export const TenantAlertsWidget = ({ alerts, onViewAlert, loading = false }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    {[1, 2].map(i => (
                        <div key={i} className="h-12 bg-gray-100 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!alerts || alerts.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500 text-sm">
                No active alerts
            </div>
        );
    }

    const getAlertColor = (type) => {
        switch (type) {
            case 'critical': return 'border-red-500 bg-red-50';
            case 'warning': return 'border-yellow-500 bg-yellow-50';
            default: return 'border-blue-500 bg-blue-50';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Active Alerts</h3>
            </div>
            <div className="divide-y divide-gray-100">
                {alerts.map((alert, index) => (
                    <div
                        key={index}
                        onClick={() => onViewAlert?.(alert)}
                        className={`px-4 py-3 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${getAlertColor(alert.type)}`}
                    >
                        <div className="font-medium text-sm">{alert.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{alert.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{alert.time}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};