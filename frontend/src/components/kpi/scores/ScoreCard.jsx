import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiCalendar, FiUser } from 'react-icons/fi';
import TrafficLightIcon from './TrafficLightIcon';
import KPIStatusBadge from '../common/KPIStatusBadge';

const ScoreCard = ({ score, onClick }) => {
    const getTrendIcon = () => {
        if (!score.trend) return null;
        if (score.trend === 'up') return <FiTrendingUp size={14} color="var(--kpi-success)" />;
        if (score.trend === 'down') return <FiTrendingDown size={14} color="var(--kpi-danger)" />;
        return <FiMinus size={14} color="var(--kpi-warning)" />;
    };

    const getScoreColor = () => {
        const value = score.score || 0;
        if (value >= 90) return 'var(--kpi-success)';
        if (value >= 75) return 'var(--kpi-primary)';
        if (value >= 50) return 'var(--kpi-warning)';
        return 'var(--kpi-danger)';
    };

    return (
        <div className="kpi-score-card" onClick={() => onClick?.(score)}>
            <div className="kpi-score-card-header">
                <div className="kpi-score-card-title">
                    <span className="kpi-score-card-kpi-name">{score.kpi_name || score.kpi?.name}</span>
                    {getTrendIcon()}
                </div>
                <TrafficLightIcon status={score.traffic_light_status?.status || score.status} />
            </div>
            
            <div className="kpi-score-card-body">
                <div className="kpi-score-card-value">
                    <span className="kpi-score-card-number" style={{ color: getScoreColor() }}>
                        {score.score}%
                    </span>
                </div>
                <div className="kpi-score-card-details">
                    <div className="kpi-score-card-detail">
                        <span className="kpi-score-card-detail-label">Actual:</span>
                        <span className="kpi-score-card-detail-value">{score.actual_value}</span>
                    </div>
                    <div className="kpi-score-card-detail">
                        <span className="kpi-score-card-detail-label">Target:</span>
                        <span className="kpi-score-card-detail-value">{score.target_value}</span>
                    </div>
                    <div className="kpi-score-card-detail">
                        <span className="kpi-score-card-detail-label">Achievement:</span>
                        <span className="kpi-score-card-detail-value">
                            {score.achievement_percentage || score.achievement}%
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="kpi-score-card-footer">
                <div className="kpi-score-card-meta">
                    <FiCalendar size={12} />
                    <span>{score.period || `${score.year}-${String(score.month).padStart(2, '0')}`}</span>
                </div>
                {score.user_email && (
                    <div className="kpi-score-card-meta">
                        <FiUser size={12} />
                        <span>{score.user_email?.split('@')[0]}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScoreCard;