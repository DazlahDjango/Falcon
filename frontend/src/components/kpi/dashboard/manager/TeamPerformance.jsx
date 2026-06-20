import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

const TeamPerformance = ({ teamData }) => {
    const getTrendIcon = () => {
        const change = teamData?.score_change || 0;
        if (change > 0) return <FiTrendingUp size={14} color="var(--kpi-success)" />;
        if (change < 0) return <FiTrendingDown size={14} color="var(--kpi-danger)" />;
        return <FiMinus size={14} color="var(--kpi-warning)" />;
    };
    
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3>Team Performance</h3>
            </div>
            <div className="team-performance-content">
                <div className="performance-score">
                    <div className="score-value">{teamData?.team_avg_score || 0}%</div>
                    <div className="score-change">
                        {getTrendIcon()}
                        <span className={teamData?.score_change > 0 ? 'positive' : 'negative'}>
                            {Math.abs(teamData?.score_change || 0)}% vs last month
                        </span>
                    </div>
                </div>
                <div className="performance-stats">
                    <div className="stat">
                        <span className="stat-label">Green KPIs</span>
                        <span className="stat-value green">{teamData?.green_count || 0}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Yellow KPIs</span>
                        <span className="stat-value yellow">{teamData?.yellow_count || 0}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Red KPIs</span>
                        <span className="stat-value red">{teamData?.red_count || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamPerformance;