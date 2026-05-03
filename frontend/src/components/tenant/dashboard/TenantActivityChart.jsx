// frontend/src/components/tenant/dashboard/TenantActivityChart.jsx
import React from 'react';
import './dashboard.css';

export const TenantActivityChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="tenant-activity-container">
                <h3 className="tenant-activity-title">Tenant Activity</h3>
                <div className="flex items-center justify-center h-64 text-gray-500">
                    No activity data available
                </div>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="tenant-activity-container">
            <h3 className="tenant-activity-title">New Tenants (Last 30 Days)</h3>
            <div className="tenant-activity-chart flex items-end gap-2 h-64">
                {data.map((item, index) => {
                    const height = (item.count / maxValue) * 200;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                            <div className="text-xs text-gray-500 mb-1">{item.count}</div>
                            <div
                                className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                                style={{ height: `${Math.max(height, 4)}px` }}
                            />
                            <div className="text-xs text-gray-500 mt-1 rotate-45 origin-left">
                                {item.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};