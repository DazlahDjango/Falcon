import React from 'react';
import { FiPackage, FiCheckCircle, FiTrendingUp, FiStar } from 'react-icons/fi';

const TemplateStats = ({ templates }) => {
    const totalTemplates = templates.length;
    const publishedTemplates = templates.filter(t => t.is_published).length;
    const draftTemplates = totalTemplates - publishedTemplates;
    const totalUsage = templates.reduce((sum, t) => sum + (t.usage_count || 0), 0);
    const avgUsage = totalTemplates > 0 ? Math.round(totalUsage / totalTemplates) : 0;

    const stats = [
        {
            label: 'Total Templates',
            value: totalTemplates,
            icon: FiPackage,
            color: '#667eea',
            bgColor: '#667eea10',
        },
        {
            label: 'Published',
            value: publishedTemplates,
            icon: FiCheckCircle,
            color: '#10b981',
            bgColor: '#10b98110',
        },
        {
            label: 'Total Uses',
            value: totalUsage,
            icon: FiTrendingUp,
            color: '#f59e0b',
            bgColor: '#f59e0b10',
        },
        {
            label: 'Avg Uses/Template',
            value: avgUsage,
            icon: FiStar,
            color: '#8b5cf6',
            bgColor: '#8b5cf610',
        },
    ];

    return (
        <div className="template-stats">
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

export default TemplateStats;