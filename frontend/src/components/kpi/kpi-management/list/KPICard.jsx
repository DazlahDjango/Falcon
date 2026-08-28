import React from 'react';
import { FiEye, FiEdit, FiTrendingUp, FiTrendingDown, FiMinus, FiTarget, FiUser } from 'react-icons/fi';
import KPIStatusBadge from '../../common/KPIStatusBadge';
import TrafficLightIcon from '../../scores/TrafficLightIcon';

const KPICard = ({ kpi, onView, onEdit, canManage }) => {
    const getTrendIcon = () => {
        if (!kpi.trend) return null;
        switch (kpi.trend) {
            case 'up': return <FiTrendingUp size={14} color="var(--kpi-success)" />;
            case 'down': return <FiTrendingDown size={14} color="var(--kpi-danger)" />;
            default: return <FiMinus size={14} color="var(--kpi-warning)" />;
        }
    };
    
    const getKpiTypeLabel = (type) => {
        const types = {
            COUNT: 'Count',
            PERCENTAGE: 'Percentage',
            FINANCIAL: 'Financial',
            MILESTONE: 'Milestone',
            TIME: 'Time',
            IMPACT: 'Impact'
        };
        return types[type] || type;
    };
    
    const getScoreColor = () => {
        const score = kpi.current_score || 0;
        if (score >= 90) return 'var(--kpi-success)';
        if (score >= 75) return 'var(--kpi-primary)';
        if (score >= 50) return 'var(--kpi-warning)';
        return 'var(--kpi-danger)';
    };
    
    return (
        <div className="kpi-card" onClick={() => onView(kpi.id)}>
            <div className="kpi-card-header">
                <div className="kpi-card-title">
                    <h3>{kpi.name}</h3>
                    {getTrendIcon()}
                </div>
                <div className="kpi-card-badges">
                    <span className="kpi-type-badge">{getKpiTypeLabel(kpi.kpi_type)}</span>
                    <KPIStatusBadge status={kpi.is_active ? 'active' : 'inactive'} />
                </div>
            </div>
            
            <div className="kpi-card-description">
                {kpi.description || 'No description provided'}
            </div>
            
            <div className="kpi-card-stats">
                <div className="kpi-stat">
                    <FiTarget size={14} />
                    <span>Target: {kpi.target_min} - {kpi.target_max}</span>
                </div>
                <div className="kpi-stat">
                    <FiUser size={14} />
                    <span>Owner: {kpi.owner_email?.split('@')[0]}</span>
                </div>
            </div>
            
            {kpi.current_score !== undefined && (
                <div className="kpi-card-score">
                    <div className="kpi-score-header">
                        <span>Current Score</span>
                        <TrafficLightIcon status={kpi.traffic_light} />
                    </div>
                    <div className="kpi-score-value" style={{ color: getScoreColor() }}>
                        {kpi.current_score}%
                    </div>
                    <div className="kpi-score-progress">
                        <div 
                            className="kpi-score-progress-bar"
                            style={{ width: `${kpi.current_score}%`, background: getScoreColor() }}
                        />
                    </div>
                </div>
            )}
            
            {canManage && (
                <div className="kpi-card-actions">
                    <button className="view-btn" onClick={(e) => { e.stopPropagation(); onView(kpi.id); }}>
                        <FiEye size={14} />
                        View
                    </button>
                    <button className="edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(kpi.id); }}>
                        <FiEdit size={14} />
                        Edit
                    </button>
                </div>
            )}
        </div>
    );
};

export default KPICard;