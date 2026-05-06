// frontend/src/components/tenant/connections/ConnectionStatsCards.jsx
import React from 'react';
import { FiActivity, FiZap, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
                {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-full bg-${color}-100`}>
                <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
        </div>
    </div>
);

const ConnectionStatsCards = ({ stats, metrics }) => {
    const cards = [
        {
            title: 'Total Connections',
            value: stats?.total || 0,
            icon: FiActivity,
            color: 'blue',
        },
        {
            title: 'Active',
            value: stats?.active || 0,
            icon: FiZap,
            color: 'green',
            subtitle: `${metrics?.active_connections || 0} in pool`,
        },
        {
            title: 'Idle',
            value: stats?.idle || 0,
            icon: FiClock,
            color: 'yellow',
        },
        {
            title: 'Errors',
            value: stats?.error || 0,
            icon: FiAlertCircle,
            color: 'red',
        },
        {
            title: 'Health Status',
            value: `${stats?.healthy || 0}/${stats?.total || 0}`,
            icon: FiCheckCircle,
            color: 'teal',
            subtitle: `${stats?.unhealthy || 0} unhealthy`,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {cards.map((card, index) => (
                <StatCard key={index} {...card} />
            ))}
        </div>
    );
};

export default ConnectionStatsCards;