import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiTarget, FiTrendingUp, FiTrendingDown, FiMinus, FiEye } from 'react-icons/fi';
import { fetchUserKPIs, selectUserKPIs, selectKPILoading } from '../../../store/kpi';
import KPILoading from '../common/KPILoading';
import KPIEmptyState from '../common/KPIEmptyState';
import KPIStatusBadge from '../common/KPIStatusBadge';
import TrafficLightIcon from '../scores/TrafficLightIcon';

const UserKPIs = ({ userId, onViewKPI }) => {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    
    const kpis = useSelector(state => selectUserKPIs(userId)(state));
    const loading = useSelector(selectKPILoading);
    
    useEffect(() => {
        if (userId) {
            dispatch(fetchUserKPIs({ userId }));
        }
    }, [dispatch, userId]);
    
    const filteredKPIs = kpis?.filter(kpi =>
        kpi.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kpi.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const getTrendIcon = (trend) => {
        if (trend === 'up') return <FiTrendingUp size={14} color="var(--kpi-success)" />;
        if (trend === 'down') return <FiTrendingDown size={14} color="var(--kpi-danger)" />;
        return <FiMinus size={14} color="var(--kpi-warning)" />;
    };
    
    const getScoreColor = (score) => {
        if (score >= 90) return 'var(--kpi-success)';
        if (score >= 75) return 'var(--kpi-primary)';
        if (score >= 50) return 'var(--kpi-warning)';
        return 'var(--kpi-danger)';
    };
    
    if (loading) {
        return <KPILoading size="sm" text="Loading user KPIs..." />;
    }
    
    if (!filteredKPIs || filteredKPIs.length === 0) {
        return (
            <KPIEmptyState 
                icon="📊"
                title="No KPIs Assigned"
                description="This user has no KPIs assigned yet"
            />
        );
    }
    
    return (
        <div className="kpi-user-kpis">
            <div className="user-kpis-header">
                <h3>Assigned KPIs</h3>
                <div className="kpi-search">
                    <input 
                        type="text"
                        placeholder="Search KPIs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="user-kpis-grid">
                {filteredKPIs.map(kpi => (
                    <div key={kpi.id} className="user-kpi-card" onClick={() => onViewKPI?.(kpi.id)}>
                        <div className="user-kpi-header">
                            <div className="user-kpi-title">
                                <h4>{kpi.name}</h4>
                                {getTrendIcon(kpi.trend)}
                            </div>
                            <KPIStatusBadge status={kpi.is_active ? 'active' : 'inactive'} />
                        </div>
                        
                        <div className="user-kpi-code">{kpi.code}</div>
                        
                        {kpi.description && (
                            <div className="user-kpi-description">{kpi.description}</div>
                        )}
                        
                        {kpi.current_score !== undefined && (
                            <div className="user-kpi-score-section">
                                <div className="user-kpi-score-header">
                                    <span>Current Score</span>
                                    <TrafficLightIcon status={kpi.traffic_light} />
                                </div>
                                <div className="user-kpi-score" style={{ color: getScoreColor(kpi.current_score) }}>
                                    {kpi.current_score}%
                                </div>
                                <div className="user-kpi-progress">
                                    <div 
                                        className="user-kpi-progress-bar"
                                        style={{ width: `${kpi.current_score}%`, background: getScoreColor(kpi.current_score) }}
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div className="user-kpi-meta">
                            <div className="meta-item">
                                <FiTarget size={12} />
                                <span>Target: {kpi.target_min} - {kpi.target_max}</span>
                            </div>
                        </div>
                        
                        <button className="view-kpi-btn" onClick={(e) => {
                            e.stopPropagation();
                            onViewKPI?.(kpi.id);
                        }}>
                            <FiEye size={14} />
                            View Details
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserKPIs;