// frontend/src/components/tenant/dashboard/TenantOverviewDashboard.jsx
import React from 'react';
import { TenantStatsCards } from './TenantStatsCards';
import { TenantActivityChart } from './TenantActivityChart';
import { TenantHealthWidget } from './TenantHealthWidget';
import './dashboard.css';

export const TenantOverviewDashboard = ({
    stats,
    activityData,
    healthData,
    loading = false
}) => {
    if (loading) {
        return (
            <div className="tenant-dashboard-container">
                <div className="text-center p-8 text-gray-500">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="tenant-dashboard-container">
            <TenantStatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <TenantActivityChart data={activityData} />
                </div>
                <div className="lg:col-span-1">
                    <TenantHealthWidget healthData={healthData} />
                </div>
            </div>
        </div>
    );
};