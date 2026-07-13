import React from 'react';
import { FiActivity, FiZap, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all p-6">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 bg-${color}-50 rounded-2xl`}>
                <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
            {subtitle && (
                <div className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {subtitle}
                </div>
            )}
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
    </div>
);

const ConnectionStatsCards = ({ stats, metrics }) => {
    const cards = [
        {
            title: 'Total Stream',
            value: stats?.total || 0,
            icon: FiActivity,
            color: 'blue',
        },
        {
            title: 'Active Now',
            value: stats?.active || 0,
            icon: FiZap,
            color: 'green',
            subtitle: 'Real-time',
        },
        {
            title: 'Idle Pool',
            value: stats?.idle || 0,
            icon: FiClock,
            color: 'amber',
            subtitle: 'Standby',
        },
        {
            title: 'Faults',
            value: stats?.error || 0,
            icon: FiAlertCircle,
            color: 'red',
            subtitle: 'Critical',
        },
        {
            title: 'Cluster Health',
            value: `${((stats?.healthy / (stats?.total || 1)) * 100 || 0).toFixed(0)}%`,
            icon: FiCheckCircle,
            color: 'indigo',
            subtitle: 'Sync Status',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {cards.map((card, index) => (
                <StatCard key={index} {...card} />
            ))}
        </div>
    );
};

export default ConnectionStatsCards;