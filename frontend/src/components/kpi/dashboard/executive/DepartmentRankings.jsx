import React from 'react';
import { FiAward, FiZap } from 'react-icons/fi';
import { Medal } from 'lucide-react';

const DepartmentRankings = ({ rankings }) => {
    if (!rankings || rankings.length === 0) {
        return (
            <div className="dashboard-card">
                <div className="card-header">
                    <h3>Department Rankings</h3>
                </div>
                <div className="card-empty">No ranking data available</div>
            </div>
        );
    }
    
    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <FiZap size={18} color="#FFD700" />;
            case 2: return <FiAward size={18} color="#C0C0C0" />;
            case 3: return <Medal size={18} color="#CD7F32" />;
            default: return <span className="rank-number">{rank}</span>;
        }
    };
    
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3>Department Rankings</h3>
                <a href="#" className="view-all">View full report →</a>
            </div>
            <div className="rankings-list">
                {rankings.map((dept, index) => (
                    <div key={index} className="ranking-item">
                        <div className="ranking-position">
                            {getRankIcon(index + 1)}
                        </div>
                        <div className="ranking-info">
                            <div className="ranking-name">{dept.department}</div>
                            <div className="ranking-score">{dept.score}%</div>
                        </div>
                        <div className="ranking-trend">
                            {dept.score_change > 0 && <span className="trend-up">↑ {dept.score_change}%</span>}
                            {dept.score_change < 0 && <span className="trend-down">↓ {Math.abs(dept.score_change)}%</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DepartmentRankings;