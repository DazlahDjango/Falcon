import React from 'react';
import { FiEye, FiEdit, FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import KPIStatusBadge from '../../common/KPIStatusBadge';
import TrafficLightIcon from '../../scores/TrafficLightIcon';

const KPITable = ({ kpis, onView, onEdit, canManage }) => {
    const getTrendIcon = (trend) => {
        if (!trend) return null;
        switch (trend) {
            case 'up': return <FiTrendingUp size={12} color="var(--kpi-success)" />;
            case 'down': return <FiTrendingDown size={12} color="var(--kpi-danger)" />;
            default: return <FiMinus size={12} color="var(--kpi-warning)" />;
        }
    };
    
    const getScoreColor = (score) => {
        if (score >= 90) return 'var(--kpi-success)';
        if (score >= 75) return 'var(--kpi-primary)';
        if (score >= 50) return 'var(--kpi-warning)';
        return 'var(--kpi-danger)';
    };
    
    return (
        <div className="kpi-table-container">
            <table className="kpi-table">
                <thead>
                    <tr>
                        <th>Name / Code</th>
                        <th>Type</th>
                        <th>Target Range</th>
                        <th>Owner</th>
                        <th>Current Score</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {kpis.map(kpi => (
                        <tr key={kpi.id} className="kpi-table-row" onClick={() => onView(kpi.id)}>
                            <td className="kpi-name-cell">
                                <div className="kpi-name">{kpi.name}</div>
                                <div className="kpi-code">{kpi.code}</div>
                            </td>
                            <td>{kpi.kpi_type_display || kpi.kpi_type}</td>
                            <td>{kpi.target_min} - {kpi.target_max}</td>
                            <td>{kpi.owner_email?.split('@')[0]}</td>
                            <td className="kpi-score-cell">
                                <div className="kpi-score-wrapper">
                                    <span className="kpi-score-value" style={{ color: getScoreColor(kpi.current_score || 0) }}>
                                        {kpi.current_score || 0}%
                                    </span>
                                    {getTrendIcon(kpi.trend)}
                                </div>
                                <div className="kpi-score-bar">
                                    <div 
                                        className="kpi-score-bar-fill"
                                        style={{ width: `${kpi.current_score || 0}%`, background: getScoreColor(kpi.current_score || 0) }}
                                    />
                                </div>
                            </td>
                            <td>
                                <div className="kpi-status-wrapper">
                                    <KPIStatusBadge status={kpi.is_active ? 'active' : 'inactive'} />
                                    {kpi.traffic_light && <TrafficLightIcon status={kpi.traffic_light} size="sm" />}
                                </div>
                            </td>
                            <td className="kpi-actions-cell">
                                {canManage && (
                                    <button 
                                        className="kpi-edit-btn"
                                        onClick={(e) => { e.stopPropagation(); onEdit(kpi.id); }}
                                    >
                                        <FiEdit size={14} />
                                    </button>
                                )}
                                <button 
                                    className="kpi-view-btn"
                                    onClick={(e) => { e.stopPropagation(); onView(kpi.id); }}
                                >
                                    <FiEye size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default KPITable;