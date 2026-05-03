// frontend/src/components/tenant/dashboard/TenantStatsCards.jsx
import React from 'react';
import './dashboard.css';

export const TenantStatsCards = ({ stats }) => {
    const cards = [
        { label: 'Total Tenants', value: stats?.totalTenants || 0, icon: '🏢', color: 'blue' },
        { label: 'Active Tenants', value: stats?.activeTenants || 0, icon: '✅', color: 'green' },
        { label: 'Suspended Tenants', value: stats?.suspendedTenants || 0, icon: '⛔', color: 'red' },
        { label: 'Provisioning', value: stats?.provisioningTenants || 0, icon: '🔄', color: 'yellow' },
    ];

    const colorClasses = {
        blue: 'bg-blue-100',
        green: 'bg-green-100',
        red: 'bg-red-100',
        yellow: 'bg-yellow-100',
    };

    return (
        <div className="tenant-stats-grid">
            {cards.map((card, index) => (
                <div key={index} className="tenant-stat-card">
                    <div className={`tenant-stat-icon ${colorClasses[card.color]}`}>
                        {card.icon}
                    </div>
                    <div className="tenant-stat-content">
                        <div className="tenant-stat-value">{card.value.toLocaleString()}</div>
                        <div className="tenant-stat-label">{card.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};