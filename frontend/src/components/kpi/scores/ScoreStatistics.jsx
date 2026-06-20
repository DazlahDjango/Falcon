import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiActivity, FiBarChart2 } from 'react-icons/fi';
import KPIScoreGauge from '../common/KPIScoreGauge';

const ScoreStatistics = ({ statistics }) => {
    if (!statistics) return null;

    const stats = [
        {
            label: 'Average Score',
            value: statistics.avg_score || 0,
            suffix: '%',
            icon: <FiActivity size={20} />,
            color: 'primary'
        },
        {
            label: 'Highest Score',
            value: statistics.max_score || 0,
            suffix: '%',
            icon: <FiTrendingUp size={20} />,
            color: 'success'
        },
        {
            label: 'Lowest Score',
            value: statistics.min_score || 0,
            suffix: '%',
            icon: <FiTrendingDown size={20} />,
            color: 'danger'
        },
        {
            label: 'Total KPIs',
            value: statistics.total_count || 0,
            suffix: '',
            icon: <FiBarChart2 size={20} />,
            color: 'info'
        }
    ];

    const distribution = [
        { label: 'Green', count: statistics.green_count || 0, color: 'var(--kpi-success)' },
        { label: 'Yellow', count: statistics.yellow_count || 0, color: 'var(--kpi-warning)' },
        { label: 'Red', count: statistics.red_count || 0, color: 'var(--kpi-danger)' }
    ];

    const total = (statistics.green_count || 0) + (statistics.yellow_count || 0) + (statistics.red_count || 0);

    return (
        <div className="kpi-score-statistics">
            <div className="kpi-score-stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className={`kpi-score-stat-card kpi-score-stat-card-${stat.color}`}>
                        <div className="kpi-score-stat-icon">{stat.icon}</div>
                        <div className="kpi-score-stat-content">
                            <div className="kpi-score-stat-label">{stat.label}</div>
                            <div className="kpi-score-stat-value">
                                {typeof stat.value === 'number' ? stat.value.toFixed(1) : stat.value}
                                {stat.suffix}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="kpi-score-distribution">
                <div className="kpi-score-distribution-title">Score Distribution</div>
                <div className="kpi-score-distribution-bars">
                    {distribution.map(item => (
                        <div key={item.label} className="kpi-score-distribution-item">
                            <div className="kpi-score-distribution-label">
                                <span className="kpi-score-distribution-dot" style={{ background: item.color }} />
                                {item.label}
                            </div>
                            <div className="kpi-score-distribution-bar-container">
                                <div 
                                    className="kpi-score-distribution-bar"
                                    style={{ 
                                        width: `${total > 0 ? (item.count / total) * 100 : 0}%`,
                                        background: item.color
                                    }}
                                />
                            </div>
                            <div className="kpi-score-distribution-count">{item.count}</div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="kpi-score-gauge-container">
                <KPIScoreGauge score={statistics.avg_score || 0} size={120} label="Overall Score" />
            </div>
        </div>
    );
};

export default ScoreStatistics;