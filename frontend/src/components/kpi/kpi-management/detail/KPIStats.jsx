import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiBarChart2, FiUsers, FiTarget, FiActivity } from 'react-icons/fi';

const KPIStats = ({ kpi }) => {
    const stats = [
        {
            label: 'Current Score',
            value: kpi.current_score || 0,
            suffix: '%',
            icon: <FiActivity size={20} />,
            color: (kpi.current_score || 0) >= 90 ? 'success' : (kpi.current_score || 0) >= 75 ? 'primary' : (kpi.current_score || 0) >= 50 ? 'warning' : 'danger'
        },
        {
            label: 'Target Achievement',
            value: kpi.achievement_rate || 0,
            suffix: '%',
            icon: <FiTarget size={20} />,
            color: 'primary'
        },
        {
            label: 'Total Scores',
            value: kpi.scores_count || 0,
            suffix: '',
            icon: <FiBarChart2 size={20} />,
            color: 'info'
        },
        {
            label: 'Assigned Users',
            value: kpi.assigned_users_count || 0,
            suffix: '',
            icon: <FiUsers size={20} />,
            color: 'info'
        }
    ];
    
    const trendData = [
        { month: 'Jan', score: 65 },
        { month: 'Feb', score: 68 },
        { month: 'Mar', score: 72 },
        { month: 'Apr', score: 75 },
        { month: 'May', score: 78 },
        { month: 'Jun', score: 82 }
    ];
    
    const maxScore = Math.max(...trendData.map(d => d.score), 100);
    
    return (
        <div className="kpi-stats-section">
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className={`stat-card stat-card-${stat.color}`}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-content">
                            <div className="stat-label">{stat.label}</div>
                            <div className="stat-value">
                                {typeof stat.value === 'number' ? stat.value.toFixed(1) : stat.value}
                                {stat.suffix}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="trend-chart">
                <h4>Performance Trend (Last 6 Months)</h4>
                <div className="chart-bars">
                    {trendData.map((item, index) => (
                        <div key={index} className="chart-bar-wrapper">
                            <div 
                                className="chart-bar"
                                style={{ height: `${(item.score / maxScore) * 100}%` }}
                            >
                                <span className="chart-value">{item.score}%</span>
                            </div>
                            <div className="chart-label">{item.month}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KPIStats;