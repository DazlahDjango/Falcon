import React from 'react';
import { FiEdit, FiTrash2, FiTrendingUp, FiTrendingDown, FiMinus, FiShare2 } from 'react-icons/fi';
import KPIStatusBadge from '../../common/KPIStatusBadge';

const TargetTable = ({ targets, onRowClick, onEdit, onDelete, onCascade, canEdit, canDelete, canCascade }) => {
    const getProgressIcon = (target) => {
        if (!target.current_value) return <FiMinus size={14} color="var(--kpi-gray-400)" />;
        const progress = (target.current_value / target.target_value) * 100;
        if (progress >= 100) return <FiTrendingUp size={14} color="var(--kpi-success)" />;
        if (progress >= 85) return <FiMinus size={14} color="var(--kpi-warning)" />;
        return <FiTrendingDown size={14} color="var(--kpi-danger)" />;
    };

    const getProgressColor = (target) => {
        if (!target.current_value) return 'var(--kpi-gray-400)';
        const progress = (target.current_value / target.target_value) * 100;
        if (progress >= 100) return 'var(--kpi-success)';
        if (progress >= 85) return 'var(--kpi-warning)';
        return 'var(--kpi-danger)';
    };

    return (
        <div className="kpi-target-table-container">
            <table className="kpi-target-table">
                <thead>
                    <tr>
                        <th>KPI</th>
                        <th>User</th>
                        <th>Year</th>
                        <th>Target Value</th>
                        <th>Current Progress</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {targets.map(target => {
                        const progress = target.current_value ? (target.current_value / target.target_value) * 100 : 0;
                        return (
                            <tr 
                                key={target.id} 
                                className="kpi-target-table-row"
                                onClick={() => onRowClick?.(target)}
                            >
                                <td className="kpi-target-table-kpi">
                                    {target.kpi_name || target.kpi?.name}
                                </td>
                                <td>{target.user_email?.split('@')[0] || target.user?.email?.split('@')[0]}</td>
                                <td>{target.year}</td>
                                <td className="kpi-target-table-value">{target.target_value}</td>
                                <td>
                                    <div className="kpi-target-table-progress">
                                        <div className="kpi-target-table-progress-bar">
                                            <div 
                                                className="kpi-target-table-progress-fill"
                                                style={{ 
                                                    width: `${Math.min(100, progress)}%`,
                                                    background: getProgressColor(target)
                                                }}
                                            />
                                        </div>
                                        <span className="kpi-target-table-progress-text">
                                            {progress.toFixed(1)}%
                                            {getProgressIcon(target)}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    {target.is_approved ? (
                                        <KPIStatusBadge status="approved" customText="Approved" />
                                    ) : (
                                        <KPIStatusBadge status="pending" customText="Pending" />
                                    )}
                                </td>
                                <td className="kpi-target-table-actions">
                                    {canCascade && (
                                        <button 
                                            className="kpi-target-edit-btn"
                                            title="Cascade Target"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCascade?.(target);
                                            }}
                                        >
                                            <FiShare2 size={14} />
                                        </button>
                                    )}
                                    {canEdit && (
                                        <button 
                                            className="kpi-target-edit-btn"
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
                                            className="kpi-target-delete-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete?.(target);
                                            }}
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default TargetTable;