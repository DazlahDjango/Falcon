// frontend/src/components/tenant/resources/ResourceLimitTable.jsx
import React from 'react';
import './resources.css';

export const ResourceLimitTable = ({ resources, onEdit, loading = false }) => {
    if (loading) {
        return (
            <div className="resource-table-container">
                <div className="p-8 text-center text-gray-500">Loading resources...</div>
            </div>
        );
    }

    if (!resources || resources.length === 0) {
        return (
            <div className="resource-table-container">
                <div className="p-8 text-center text-gray-500">No resources found</div>
            </div>
        );
    }

    const resourceLabels = {
        users: 'Users',
        storage_mb: 'Storage (MB)',
        api_calls_per_day: 'API Calls Per Day',
        kpis: 'KPIs',
        departments: 'Departments',
        concurrent_sessions: 'Concurrent Sessions',
    };

    const getPercentageClass = (percentage) => {
        if (percentage >= 100) return 'text-red-600 font-bold';
        if (percentage >= 90) return 'text-red-500';
        if (percentage >= 80) return 'text-yellow-600';
        return 'text-green-600';
    };

    return (
        <div className="resource-table-container">
            <div className="overflow-x-auto">
                <table className="resource-table">
                    <thead>
                        <tr>
                            <th>Resource Type</th>
                            <th>Current Usage</th>
                            <th>Limit</th>
                            <th>Usage %</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resources.map((resource) => {
                            const percentage = resource.limit_value > 0
                                ? (resource.current_value / resource.limit_value) * 100
                                : 0;
                            const percentageClass = getPercentageClass(percentage);

                            let status = 'Good';
                            let statusClass = 'bg-green-100 text-green-700';
                            if (percentage >= 100) {
                                status = 'Exceeded';
                                statusClass = 'bg-red-100 text-red-700';
                            } else if (percentage >= 90) {
                                status = 'Critical';
                                statusClass = 'bg-red-100 text-red-700';
                            } else if (percentage >= 80) {
                                status = 'Warning';
                                statusClass = 'bg-yellow-100 text-yellow-700';
                            }

                            return (
                                <tr key={resource.id}>
                                    <td className="font-medium">{resourceLabels[resource.resource_type] || resource.resource_type}</td>
                                    <td>{resource.current_value.toLocaleString()}</td>
                                    <td>{resource.limit_value.toLocaleString()}</td>
                                    <td className={percentageClass}>{percentage.toFixed(1)}%</td>
                                    <td>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                                            {status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => onEdit?.(resource)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};