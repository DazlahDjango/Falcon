import React from 'react';
import { FiPackage, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiFolder, FiFileText } from 'react-icons/fi';

const StatsCards = ({ stats }) => {
    const cards = [
        {
            title: 'Total Frameworks',
            value: stats.frameworks.total,
            icon: FiPackage,
            color: '#667eea',
            bgColor: '#667eea10',
            trend: `${stats.frameworks.published} published`,
        },
        {
            title: 'Total Categories',
            value: stats.categories.total,
            icon: FiFolder,
            color: '#10b981',
            bgColor: '#10b98110',
            trend: `${stats.categories.withKPIs} with KPIs`,
        },
        {
            title: 'Total Templates',
            value: stats.templates.total,
            icon: FiFileText,
            color: '#f59e0b',
            bgColor: '#f59e0b10',
            trend: `${stats.templates.totalUsage} total uses`,
        },
        {
            title: 'Total KPIs',
            value: stats.kpis.total,
            icon: FiTrendingUp,
            color: '#ef4444',
            bgColor: '#ef444410',
            trend: `${stats.kpis.active} active`,
        },
    ];

    return (
        <div className="stats-cards">
            {cards.map((card, index) => (
                <div key={index} className="stat-card" style={{ borderLeftColor: card.color }}>
                    <div className="stat-card-content">
                        <div className="stat-icon" style={{ backgroundColor: card.bgColor, color: card.color }}>
                            <card.icon size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{card.value}</div>
                            <div className="stat-label">{card.title}</div>
                            <div className="stat-trend">{card.trend}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;