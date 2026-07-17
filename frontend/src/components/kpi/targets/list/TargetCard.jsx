import React from 'react';
import { FiTarget, FiUser, FiCalendar, FiEdit, FiTrash2, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import KPIStatusBadge from '../../common/KPIStatusBadge';

const TargetCard = ({ target, onClick, onEdit, onDelete, canEdit, canDelete }) => {
    const getProgress = () => {
        if (!target.current_value) return 0;
        return (target.current_value / target.target_value) * 100;
    };

    const progress = getProgress();
    const isAhead = progress > 100;
    const isBehind = progress < 85;

    return (
        <div className="kpi-target-card" onClick={() => onClick?.(target)}>
            <div className="kpi-target-card-header">
                <div className="kpi-target-card-title">
                    <FiTarget size={16} />
                    <span>{target.kpi_name || target.kpi?.name}</span>
                </div>
                <div className="kpi-target-card-actions">
                    {canEdit && (
                        <button 
                            className="kpi-target-card-edit"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(target);
                            }}
                        >
                            <FiEdit size={14} />
                        </button>
                    )}
                    {canDelete && (
                        <button 
                            className="kpi-target-card-delete"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.(target);
                            }}
                        >
                            <FiTrash2 size={14} />
                        </button>
                    )}
                </div>
            </div>
            
            <div className="kpi-target-card-body">
                <div className="kpi-target-card-value">
                    <span className="kpi-target-card-number">{target.target_value}</span>
                    <span className="kpi-target-card-unit">{target.kpi?.unit || ''}</span>
                </div>
                <div className="kpi-target-card-progress">
                    <div className="kpi-target-card-progress-bar">
                        <div 
                            className="kpi-target-card-progress-fill"
                            style={{ width: `${Math.min(100, progress)}%` }}
                        />
                    </div>
                    <div className="kpi-target-card-progress-text">
                        {Number(progress || 0).toFixed(1)}% of target
                        {isAhead && <FiTrendingUp size={12} color="var(--kpi-success)" />}
                        {isBehind && <FiTrendingDown size={12} color="var(--kpi-warning)" />}
                    </div>
                </div>
            </div>
            
            <div className="kpi-target-card-footer">
                <div className="kpi-target-card-meta">
                    <FiUser size={12} />
                    <span>{target.user_email?.split('@')[0] || target.user?.email?.split('@')[0]}</span>
                </div>
                <div className="kpi-target-card-meta">
                    <FiCalendar size={12} />
                    <span>{target.year}</span>
                </div>
                {target.is_approved && (
                    <KPIStatusBadge status="approved" customText="Approved" />
                )}
            </div>
        </div>
    );
};

export default TargetCard;