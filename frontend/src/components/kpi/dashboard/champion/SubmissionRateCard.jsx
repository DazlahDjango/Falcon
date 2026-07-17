import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

const SubmissionRateCard = ({ submissionRate, totalSubmissions, expectedSubmissions }) => {
    const getTrendIcon = () => {
        const change = submissionRate?.change || 0;
        if (change > 0) return <FiTrendingUp size={14} color="var(--kpi-success)" />;
        if (change < 0) return <FiTrendingDown size={14} color="var(--kpi-danger)" />;
        return <FiMinus size={14} color="var(--kpi-warning)" />;
    };
    
    const percentage = expectedSubmissions > 0 ? (totalSubmissions / expectedSubmissions) * 100 : 0;
    
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3>Organization Submission Rate</h3>
            </div>
            <div className="submission-rate-content">
                <div className="rate-circle">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                        <circle 
                            cx="60" cy="60" r="54" fill="none" 
                            stroke="#4f46e5"
                            strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 54}`}
                            strokeDashoffset={`${2 * Math.PI * 54 * (1 - submissionRate / 100)}`}
                            transform="rotate(-90 60 60)"
                            strokeLinecap="round"
                        />
                        <text x="60" y="55" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1f2937">
                            {submissionRate}%
                        </text>
                        <text x="60" y="72" textAnchor="middle" fontSize="8" fill="#6b7280">Completion</text>
                    </svg>
                </div>
                <div className="submission-stats">
                    <div className="stat">
                        <span className="stat-label">Total Submissions</span>
                        <span className="stat-value">{totalSubmissions || 0}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Expected</span>
                        <span className="stat-value">{expectedSubmissions || 0}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Remaining</span>
                        <span className="stat-value">{(expectedSubmissions || 0) - (totalSubmissions || 0)}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Progress</span>
                        <span className="stat-value">{Number(percentage || 0).toFixed(1)}%</span>
                        {getTrendIcon()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionRateCard;