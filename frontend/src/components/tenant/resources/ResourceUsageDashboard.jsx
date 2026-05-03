// frontend/src/components/tenant/resources/ResourceUsageDashboard.jsx
import React from 'react';
import { ResourceLimitCard } from './ResourceLimitCard';
import { QuotaWarningAlert } from './QuotaWarningAlert';
import './resources.css';

export const ResourceUsageDashboard = ({ resources, warnings, loading = false }) => {
    if (loading) {
        return (
            <div className="resource-dashboard">
                <div className="text-center p-8 text-gray-500">Loading resources...</div>
            </div>
        );
    }

    const resourceTypes = [
        { key: 'users', label: 'Users', unit: '', icon: '👥' },
        { key: 'storage_mb', label: 'Storage', unit: 'MB', icon: '💾', format: (v) => `${v} MB` },
        { key: 'api_calls_per_day', label: 'API Calls', unit: '', icon: '📡', format: (v) => v.toLocaleString() },
        { key: 'kpis', label: 'KPIs', unit: '', icon: '📊' },
        { key: 'departments', label: 'Departments', unit: '', icon: '🏢' },
        { key: 'concurrent_sessions', label: 'Concurrent Sessions', unit: '', icon: '🖥️' },
    ];

    const resourceMap = {};
    resources.forEach(r => {
        resourceMap[r.resource_type] = r;
    });

    return (
        <div className="resource-dashboard">
            <h2 className="resource-dashboard-title">Resource Usage</h2>
            <p className="resource-dashboard-subtitle">Monitor your tenant's resource consumption and limits</p>

            {warnings && warnings.length > 0 && (
                <div className="mb-4">
                    {warnings.map((warning, index) => (
                        <QuotaWarningAlert key={index} warning={warning} />
                    ))}
                </div>
            )}

            <div className="resource-grid">
                {resourceTypes.map(type => {
                    const resource = resourceMap[type.key];
                    if (!resource) return null;

                    return (
                        <ResourceLimitCard
                            key={type.key}
                            title={type.label}
                            icon={type.icon}
                            current={resource.current_value}
                            limit={resource.limit_value}
                            unit={type.unit}
                            format={type.format}
                        />
                    );
                })}
            </div>
        </div>
    );
};