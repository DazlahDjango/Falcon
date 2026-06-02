import React from 'react';
import { FiBriefcase, FiCheckCircle, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';

const SectorStats = ({ sectors }) => {
    const totalSectors = sectors.length;
    const activeSectors = sectors.filter(s => s.is_active).length;
    const inactiveSectors = totalSectors - activeSectors;

    const totalFrameworks = sectors.reduce((sum, s) => sum + (s.framework_count || 0), 0);
    const totalTemplates = sectors.reduce((sum, s) => sum + (s.template_count || 0), 0);

    const stats = [
        {
            label: 'Total Sectors',
            value: totalSectors,
            icon: FiBriefcase,
            color: '#667eea',
            bgColor: '#667eea10',
        },
        {
            label: 'Active Sectors',
            value: activeSectors,
            icon: FiCheckCircle,
            color: '#10b981',
            bgColor: '#10b98110',
        },
        {
            label: 'Inactive Sectors',
            value: inactiveSectors,
            icon: FiAlertCircle,
            color: '#ef4444',
            bgColor: '#ef444410',
        },
        {
            label: 'Total Frameworks',
            value: totalFrameworks,
            icon: FiTrendingUp,
            color: '#8b5cf6',
            bgColor: '#8b5cf610',
        },
    ];

    return (
        <div className="sector-stats">
            {stats.map((stat, index) => (
                <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                    <div className="stat-card-content">
                        <div className="stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
                            <stat.icon size={20} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SectorStats;