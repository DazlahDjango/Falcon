import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiCalendar, FiTrendingUp, FiTrendingDown, FiEdit } from 'react-icons/fi';
import { fetchUserTargets, selectUserTargets, selectTargetLoading } from '../../../store/kpi';
import KPILoading from '../common/KPILoading';
import KPIEmptyState from '../common/KPIEmptyState';

const UserTargets = ({ userId, onEditTarget }) => {
    const dispatch = useDispatch();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    
    const targets = useSelector(state => selectUserTargets(userId)(state));
    const loading = useSelector(selectTargetLoading);
    
    useEffect(() => {
        if (userId) {
            dispatch(fetchUserTargets({ userId, params: { year: selectedYear } }));
        }
    }, [dispatch, userId, selectedYear]);
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);
    
    const getProgressColor = (target) => {
        if (!target.current_value) return 'var(--kpi-gray-400)';
        const progress = (target.current_value / target.target_value) * 100;
        if (progress >= 100) return 'var(--kpi-success)';
        if (progress >= 85) return 'var(--kpi-warning)';
        return 'var(--kpi-danger)';
    };
    
    const getProgress = (target) => {
        if (!target.current_value) return 0;
        return Math.min(100, (target.current_value / target.target_value) * 100);
    };
    
    if (loading) {
        return <KPILoading size="sm" text="Loading user targets..." />;
    }
    
    if (!targets || targets.length === 0) {
        return (
            <KPIEmptyState 
                icon="🎯"
                title="No Targets"
                description="No annual targets have been set for this user"
            />
        );
    }
    
    return (
        <div className="kpi-user-targets">
            <div className="user-targets-header">
                <h3>Annual Targets</h3>
                <div className="year-selector">
                    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="user-targets-table">
                <table>
                    <thead>
                        <tr>
                            <th>KPI</th>
                            <th>Target Value</th>
                            <th>Current Progress</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {targets.map(target => {
                            const progress = getProgress(target);
                            return (
                                <tr key={target.id}>
                                    <td className="target-kpi-name">{target.kpi_name}</td>
                                    <td className="target-value">{target.target_value}</td>
                                    <td className="target-progress">
                                        <div className="progress-bar-container">
                                            <div 
                                                className="progress-bar-fill"
                                                style={{ width: `${progress}%`, background: getProgressColor(target) }}
                                            />
                                        </div>
                                        <span className="progress-percentage">{Number(progress || 0).toFixed(1)}%</span>
                                    </td>
                                    <td>
                                        <span className={`target-status ${target.is_approved ? 'approved' : 'pending'}`}>
                                            {target.is_approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="edit-target-btn"
                                            onClick={() => onEditTarget?.(target)}
                                        >
                                            <FiEdit size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserTargets;