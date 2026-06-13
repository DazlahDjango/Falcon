import React from 'react';
import { FiBarChart2, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import KPIScoreGauge from '../common/KPIScoreGauge';
import KPIEmptyState from '../common/KPIEmptyState';

const AggregatedScores = ({ scores, loading, title = "Aggregated Scores", onEntityClick }) => {
    if (loading) {
        return <div className="kpi-loading-container">Loading aggregated scores...</div>;
    }

    if (!scores || scores.length === 0) {
        return (
            <KPIEmptyState 
                icon={<FiBarChart2 size={40} />}
                title="No Aggregated Scores"
                description="No aggregated scores available for this period."
            />
        );
    }

    const getTrendIcon = (score) => {
        if (!score.previous_score) return null;
        const change = score.aggregated_score - score.previous_score;
        if (change > 0) return <FiTrendingUp size={14} color="var(--kpi-success)" />;
        if (change < 0) return <FiTrendingDown size={14} color="var(--kpi-danger)" />;
        return null;
    };

    return (
        <div className="kpi-aggregated-scores">
            <div className="kpi-aggregated-scores-header">
                <h3>{title}</h3>
                <span className="kpi-aggregated-scores-period">
                    {scores[0]?.period || `${scores[0]?.year}-${String(scores[0]?.month).padStart(2, '0')}`}
                </span>
            </div>
            
            <div className="kpi-aggregated-scores-list">
                {scores.map(score => (
                    <div 
                        key={score.id} 
                        className="kpi-aggregated-score-item"
                        onClick={() => onEntityClick?.(score)}
                    >
                        <div className="kpi-aggregated-score-info">
                            <div className="kpi-aggregated-score-name">{score.entity_name}</div>
                            <div className="kpi-aggregated-score-stats">
                                <span>Members: {score.member_count}</span>
                                <span>KPIs: {score.kpi_count}</span>
                            </div>
                        </div>
                        <div className="kpi-aggregated-score-value">
                            <KPIScoreGauge score={score.aggregated_score} size={60} showLabel={false} />
                            <div className="kpi-aggregated-score-percentage">
                                {score.aggregated_score}%
                                {getTrendIcon(score)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AggregatedScores;