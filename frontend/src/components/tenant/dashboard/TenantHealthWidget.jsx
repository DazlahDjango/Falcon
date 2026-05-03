// frontend/src/components/tenant/dashboard/TenantHealthWidget.jsx
import React from 'react';
import './dashboard.css';

export const TenantHealthWidget = ({ healthData }) => {
    const getHealthStatusClass = () => {
        if (healthData?.status === 'healthy') return 'tenant-health-status-healthy';
        if (healthData?.status === 'warning') return 'tenant-health-status-warning';
        return 'tenant-health-status-critical';
    };

    const getHealthStatusLabel = () => {
        if (healthData?.status === 'healthy') return 'All Systems Operational';
        if (healthData?.status === 'warning') return 'Some Issues Detected';
        return 'Critical Issues';
    };

    return (
        <div className="tenant-health-widget">
            <div className="tenant-health-header">
                <h3 className="tenant-health-title">System Health</h3>
                <span className={`tenant-health-status ${getHealthStatusClass()}`}>
                    {getHealthStatusLabel()}
                </span>
            </div>

            <div className="tenant-health-metrics">
                <div className="tenant-health-metric">
                    <span className="tenant-health-metric-label">Database</span>
                    <span className="tenant-health-metric-value">
                        {healthData?.database === 'healthy' ? '✅ Operational' : '❌ Issue'}
                    </span>
                </div>
                <div className="tenant-health-metric">
                    <span className="tenant-health-metric-label">Cache</span>
                    <span className="tenant-health-metric-value">
                        {healthData?.cache === 'healthy' ? '✅ Operational' : '❌ Issue'}
                    </span>
                </div>
                <div className="tenant-health-metric">
                    <span className="tenant-health-metric-label">Worker</span>
                    <span className="tenant-health-metric-value">
                        {healthData?.worker === 'healthy' ? '✅ Operational' : '❌ Issue'}
                    </span>
                </div>
                <div className="tenant-health-metric">
                    <span className="tenant-health-metric-label">Storage</span>
                    <span className="tenant-health-metric-value">
                        {healthData?.storage || 'N/A'}
                    </span>
                </div>
            </div>
        </div>
    );
};