import React from 'react';
import { FiStar, FiAward, FiTrendingUp, FiTrendingDown, FiMinus, FiZap } from 'react-icons/fi';
import TrafficLightIcon from './TrafficLightIcon';

const DepartmentRanking = ({ rankings, loading, onDepartmentClick }) => {
    if (loading) {
        return <div className="kpi-loading-container">Loading rankings...</div>;
    }

    if (!rankings || rankings.length === 0) {
        return (
            <div className="kpi-department-ranking-empty">
                No department rankings available
            </div>
        );
    }

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <FiStar size={20} color="#FFD700" />;  // Gold star
            case 2: return <FiAward size={20} color="#C0C0C0" />; // Silver award
            case 3: return <FiZap size={20} color="#CD7F32" />;    // Bronze zap
            default: return <span className="kpi-department-ranking-number">{rank}</span>;
        }
    };

    const getTrend = (ranking) => {
        if (!ranking.previous_rank) return null;
        const change = ranking.previous_rank - ranking.rank;
        if (change > 0) return <FiTrendingUp size={12} color="var(--kpi-success)" />;
        if (change < 0) return <FiTrendingDown size={12} color="var(--kpi-danger)" />;
        return <FiMinus size={12} color="var(--kpi-warning)" />;
    };

    return (
        <div className="kpi-department-ranking">
            <div className="kpi-department-ranking-header">
                <h3>Department Rankings</h3>
                <span className="kpi-department-ranking-period">
                    {rankings[0]?.period || `${rankings[0]?.year}-${String(rankings[0]?.month).padStart(2, '0')}`}
                </span>
            </div>
            
            <div className="kpi-department-ranking-list">
                {rankings.map((dept, index) => (
                    <div 
                        key={dept.department_id || dept.id} 
                        className="kpi-department-ranking-item"
                        onClick={() => onDepartmentClick?.(dept)}
                    >
                        <div className="kpi-department-ranking-rank">
                            {getRankIcon(index + 1)}
                        </div>
                        <div className="kpi-department-ranking-info">
                            <div className="kpi-department-ranking-name">
                                {dept.department_name || dept.department}
                                {getTrend(dept)}
                            </div>
                            <div className="kpi-department-ranking-meta">
                                <TrafficLightIcon 
                                    status={dept.overall_score >= 90 ? 'GREEN' : dept.overall_score >= 50 ? 'YELLOW' : 'RED'} 
                                    size="sm"
                                />
                                <span>{dept.employee_count || dept.member_count} employees</span>
                            </div>
                        </div>
                        <div className="kpi-department-ranking-score">
                            <span className="kpi-department-ranking-score-value">
                                {dept.overall_score || dept.aggregated_score}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DepartmentRanking;