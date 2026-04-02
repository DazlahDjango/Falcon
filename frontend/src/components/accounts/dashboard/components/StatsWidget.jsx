import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatsWidget = ({ 
    title, 
    value, 
    icon, 
    trend = null, 
    progress = null, 
    subtitle = null,
    color = 'primary',
    className = ''
}) => {
    const getColorClass = () => {
        switch (color) {
            case 'primary': return 'stats-primary';
            case 'success': return 'stats-success';
            case 'warning': return 'stats-warning';
            case 'danger': return 'stats-danger';
            case 'info': return 'stats-info';
            default: return 'stats-primary';
        }
    };
    
    return (
        <div className={`stats-widget ${getColorClass()} ${className}`}>
            <div className="stats-header">
                <h3 className="stats-title">{title}</h3>
                <div className="stats-icon">{icon}</div>
            </div>
            <div className="stats-value">{value}</div>
            {progress !== null && (
                <div className="stats-progress">
                    <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
            )}
            {trend !== null && (
                <div className={`stats-trend ${trend > 0 ? 'trend-up' : 'trend-down'}`}>
                    {trend > 0 ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
                    <span>{Math.abs(trend)}%</span>
                </div>
            )}
            {subtitle && <div className="stats-subtitle">{subtitle}</div>}
        </div>
    );
};

export default StatsWidget;