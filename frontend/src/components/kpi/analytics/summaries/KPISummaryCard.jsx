import React from 'react';
import { FiTarget, FiUsers, FiBarChart2 } from 'react-icons/fi';

const KPISummaryCard = ({ summary, onClick }) => {
    const getScoreColor = () => {
        const score = summary.average_score || 0;
        if (score >= 90) return 'var(--kpi-success)';
        if (score >= 75) return 'var(--kpi-primary)';
        if (score >= 50) return 'var(--kpi-warning)';
        return 'var(--kpi-danger)';
    };
    
    const total = (summary.green_count || 0) + (summary.yellow_count || 0) + (summary.red_count || 0);
    const greenPercent = total > 0 ? ((summary.green_count || 0) / total) * 100 : 0;
    const yellowPercent = total > 0 ? ((summary.yellow_count || 0) / total) * 100 : 0;
    const redPercent = total > 0 ? ((summary.red_count || 0) / total) * 100 : 0;
    
    return (
        <div className="kpi-summary-card" onClick={onClick}>
            <div className="kpi-summary-card-header">
                <h4>{summary.kpi_name}</h4>
                <span className="kpi-code">{summary.kpi_code}</span>
            </div>
            
            <div className="kpi-summary-score" style={{ color: getScoreColor() }}>
                {summary.average_score}%
            </div>
            
            <div className="kpi-summary-period">{summary.period}</div>
            
            <div className="kpi-summary-stats">
                <div className="stat">
                    <FiBarChart2 size={12} />
                    <span>{total} scores</span>
                </div>
                <div className="stat">
                    <FiUsers size={12} />
                    <span>{summary.total_users} users</span>
                </div>
                <div className="stat">
                    <FiTarget size={12} />
                    <span>{summary.kpi_code}</span>
                </div>
            </div>
            
            <div className="distribution-bar">
                <div className="green" style={{ width: `${greenPercent}%` }} />
                <div className="yellow" style={{ width: `${yellowPercent}%` }} />
                <div className="red" style={{ width: `${redPercent}%` }} />
            </div>
            
            <div className="distribution-labels">
                <span>🟢 {summary.green_count}</span>
                <span>🟡 {summary.yellow_count}</span>
                <span>🔴 {summary.red_count}</span>
            </div>
        </div>
    );
};

export default KPISummaryCard;