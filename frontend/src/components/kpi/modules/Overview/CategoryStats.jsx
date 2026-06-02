import React from 'react';
import { FiFolder, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';

const CategoryStats = ({ categories, stats }) => {
    const utilizationRate = stats.total > 0 ? (stats.withKPIs / stats.total * 100).toFixed(1) : 0;

    // Group categories by type
    const categoriesByType = categories.reduce((acc, cat) => {
        const type = cat.category_type || 'OTHER';
        if (!acc[type]) acc[type] = 0;
        acc[type]++;
        return acc;
    }, {});

    const typeColors = {
        FINANCIAL: '#10b981',
        IMPACT: '#8b5cf6',
        OPERATIONAL: '#3b82f6',
        CUSTOMER: '#f59e0b',
        INTERNAL: '#ef4444',
        GROWTH: '#06b6d4',
        COMPLIANCE: '#6b7280',
        OTHER: '#9ca3af',
    };

    const typeLabels = {
        FINANCIAL: 'Financial',
        IMPACT: 'Impact',
        OPERATIONAL: 'Operational',
        CUSTOMER: 'Customer',
        INTERNAL: 'Internal',
        GROWTH: 'Growth',
        COMPLIANCE: 'Compliance',
        OTHER: 'Other',
    };

    return (
        <div className="stat-section">
            <div className="section-header">
                <h3 className="section-title">
                    <FiFolder size={18} />
                    Category Analytics
                </h3>
                <span className="section-badge">{stats.total} Categories</span>
            </div>

            <div className="stats-grid two-col">
                <div className="stat-item utilization">
                    <div className="stat-number-large">{utilizationRate}%</div>
                    <div className="stat-label">Utilization Rate</div>
                    <div className="stat-sub">{stats.withKPIs} categories have KPIs</div>
                </div>
                <div className="stat-item empty">
                    <div className="stat-number-large">{stats.total - stats.withKPIs}</div>
                    <div className="stat-label">Empty Categories</div>
                    <div className="stat-sub">No KPIs assigned</div>
                </div>
            </div>

            <div className="progress-bar-container">
                <div className="progress-label">
                    <span>Category Usage</span>
                    <span>{utilizationRate}%</span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill success" style={{ width: `${utilizationRate}%` }} />
                </div>
            </div>

            <div className="type-distribution">
                <div className="list-header">Distribution by Type</div>
                <div className="type-list">
                    {Object.entries(categoriesByType).slice(0, 7).map(([type, count]) => (
                        <div key={type} className="type-item">
                            <span className="type-dot" style={{ backgroundColor: typeColors[type] || '#9ca3af' }} />
                            <span className="type-name">{typeLabels[type] || type}</span>
                            <span className="type-count">{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryStats;