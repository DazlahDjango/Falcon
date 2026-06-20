import React from 'react';
import { FiActivity, FiShield, FiAlertCircle, FiBarChart2 } from 'react-icons/fi';

const AuditStats = ({ totalLogs, securityEvents, periodDays }) => {
    const stats = [
        {
            icon: <FiActivity size={24} />,
            value: totalLogs.toLocaleString(),
            label: 'Total Events',
            color: '#2563eb',
            bg: '#eff6ff',
        },
        {
            icon: <FiShield size={24} />,
            value: securityEvents.toLocaleString(),
            label: 'Security Events',
            color: '#f59e0b',
            bg: '#fef3c7',
        },
        {
            icon: <FiBarChart2 size={24} />,
            value: `${periodDays} days`,
            label: 'Retention Period',
            color: '#10b981',
            bg: '#d1fae5',
        },
        {
            icon: <FiAlertCircle size={24} />,
            value: 'Real-time',
            label: 'Monitoring',
            color: '#8b5cf6',
            bg: '#ede9fe',
        },
    ];

    return (
        <div className="audit-stats">
            {stats.map((stat, index) => (
                <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                    <div className="stat-icon" style={{ backgroundColor: stat.bg, color: stat.color }}>
                        {stat.icon}
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AuditStats;