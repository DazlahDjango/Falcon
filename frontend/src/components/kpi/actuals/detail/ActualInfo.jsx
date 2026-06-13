import React from 'react';
import { FiTarget, FiUser, FiCalendar, FiFileText, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import ActualStatusBadge from '../list/ActualStatusBadge';

const ActualInfo = ({ actual }) => {
    const getAchievementColor = () => {
        const achievement = actual.achievement_percentage || actual.achievement;
        if (!achievement) return 'var(--kpi-gray-500)';
        if (achievement >= 90) return 'var(--kpi-success)';
        if (achievement >= 75) return 'var(--kpi-primary)';
        if (achievement >= 50) return 'var(--kpi-warning)';
        return 'var(--kpi-danger)';
    };

    return (
        <div className="kpi-actual-info-card">
            <h3>Submission Details</h3>
            <div className="kpi-actual-info-grid">
                <div className="kpi-actual-info-item">
                    <div className="kpi-actual-info-label">
                        <FiTarget size={14} />
                        KPI
                    </div>
                    <div className="kpi-actual-info-value">{actual.kpi_name || actual.kpi?.name}</div>
                </div>
                
                <div className="kpi-actual-info-item">
                    <div className="kpi-actual-info-label">
                        <FiUser size={14} />
                        Submitted By
                    </div>
                    <div className="kpi-actual-info-value">{actual.user_email || actual.user?.email}</div>
                </div>
                
                <div className="kpi-actual-info-item">
                    <div className="kpi-actual-info-label">
                        <FiCalendar size={14} />
                        Period
                    </div>
                    <div className="kpi-actual-info-value">
                        {actual.period || `${actual.year}-${String(actual.month).padStart(2, '0')}`}
                    </div>
                </div>
                
                <div className="kpi-actual-info-item">
                    <div className="kpi-actual-info-label">
                        Status
                    </div>
                    <div className="kpi-actual-info-value">
                        <ActualStatusBadge status={actual.status} />
                    </div>
                </div>
                
                <div className="kpi-actual-info-item">
                    <div className="kpi-actual-info-label">
                        Actual Value
                    </div>
                    <div className="kpi-actual-info-value kpi-actual-info-highlight">
                        {actual.actual_value}
                    </div>
                </div>
                
                {actual.target_value && (
                    <div className="kpi-actual-info-item">
                        <div className="kpi-actual-info-label">
                            Target Value
                        </div>
                        <div className="kpi-actual-info-value">{actual.target_value}</div>
                    </div>
                )}
                
                {actual.achievement_percentage && (
                    <div className="kpi-actual-info-item">
                        <div className="kpi-actual-info-label">
                            Achievement
                        </div>
                        <div className="kpi-actual-info-value" style={{ color: getAchievementColor() }}>
                            {actual.achievement_percentage}%
                        </div>
                    </div>
                )}
                
                <div className="kpi-actual-info-item">
                    <div className="kpi-actual-info-label">
                        <FiFileText size={14} />
                        Submitted At
                    </div>
                    <div className="kpi-actual-info-value">
                        {new Date(actual.submitted_at).toLocaleString()}
                    </div>
                </div>
            </div>
            
            {actual.notes && (
                <div className="kpi-actual-info-notes">
                    <div className="kpi-actual-info-label">Notes</div>
                    <div className="kpi-actual-info-value">{actual.notes}</div>
                </div>
            )}
        </div>
    );
};

export default ActualInfo;