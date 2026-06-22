import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiActivity, FiBarChart2, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const InsightsOverview = ({ insights }) => {
    const stats = [
        {
            label: 'Average Score',
            value: insights?.overview?.average_score || 0,
            suffix: '%',
            icon: <FiActivity size={20} />,
            color: 'primary'
        },
        {
            label: 'Total KPIs',
            value: insights?.overview?.total_kpis || 0,
            suffix: '',
            icon: <FiBarChart2 size={20} />,
            color: 'info'
        },
        {
            label: 'Green KPIs',
            value: insights?.overview?.distribution?.green || 0,
            suffix: '',
            icon: <FiCheckCircle size={20} />,
            color: 'success'
        },
        {
            label: 'Red KPIs',
            value: insights?.overview?.distribution?.red || 0,
            suffix: '',
            icon: <FiAlertCircle size={20} />,
            color: 'danger'
        }
    ];
    
    const trend = insights?.trend;
    const isPositive = trend?.direction === 'improving';
    
    return (
        <div className="analytics-stats-grid">
            {stats.map((stat, index) => (
                <div key={index} className={`analytics-stat-card analytics-stat-card-${stat.color}`}>
                    <div className="analytics-stat-icon">{stat.icon}</div>
                    <div className="analytics-stat-value">
                        {typeof stat.value === 'number' ? stat.value.toFixed(1) : stat.value}
                        {stat.suffix}
                    </div>
                    <div className="analytics-stat-label">{stat.label}</div>
                </div>
            ))}
            
            <div className="analytics-stat-card analytics-stat-card-primary">
                <div className="analytics-stat-icon"><FiTrendingUp size={20} /></div>
                <div className="analytics-stat-value">
                    {trend?.current_score?.toFixed(1) || 0}%
                </div>
                <div className="analytics-stat-label">Current Score</div>
                <div className={`analytics-stat-change ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? '↑' : '↓'} {Math.abs(trend?.change || 0).toFixed(1)}% vs last month
                </div>
            </div>
        </div>
    );
};

export default InsightsOverview;