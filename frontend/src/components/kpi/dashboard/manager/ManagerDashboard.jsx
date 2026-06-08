import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiUsers, FiTarget, FiCheckCircle, FiClock, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import { fetchManagerDashboard, selectManagerDashboard, selectDashboardLoading } from '../../../../store/kpi';
import TeamPerformance from './TeamPerformance';
import TeamMembersTable from './TeamMembersTable';
import StatusDistribution from './StatusDistribution';
import PendingValidationsCard from './PendingValidationsCard';
import MissingSubmissionsCard from './MissingSubmissionsCard';
import KPILoading from '../../common/KPILoading';

const ManagerDashboard = () => {
    const dispatch = useDispatch();
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    
    const dashboard = useSelector(selectManagerDashboard);
    const loading = useSelector(selectDashboardLoading);
    
    useEffect(() => {
        dispatch(fetchManagerDashboard({ year, month }));
    }, [dispatch, year, month]);
    
    if (loading) {
        return <KPILoading text="Loading team dashboard..." />;
    }
    
    const stats = [
        { 
            label: 'Team Score', 
            value: dashboard?.team_avg_score || 0, 
            suffix: '%', 
            icon: <FiTrendingUp size={20} />,
            change: dashboard?.score_change || 0,
            color: '#4f46e5'
        },
        { 
            label: 'Team Members', 
            value: dashboard?.team_size || 0, 
            suffix: '', 
            icon: <FiUsers size={20} />,
            change: 0,
            color: '#10b981'
        },
        { 
            label: 'Pending Validations', 
            value: dashboard?.pending_validations || 0, 
            suffix: '', 
            icon: <FiClock size={20} />,
            change: 0,
            color: '#f59e0b'
        },
        { 
            label: 'Missing Submissions', 
            value: dashboard?.missing_submissions || 0, 
            suffix: '', 
            icon: <FiAlertCircle size={20} />,
            change: 0,
            color: '#ef4444'
        }
    ];
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' },
        { value: 3, label: 'March' }, { value: 4, label: 'April' },
        { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' },
        { value: 9, label: 'September' }, { value: 10, label: 'October' },
        { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];
    
    return (
        <div className="kpi-manager-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Team Dashboard</h1>
                    <p>Monitor your team's performance and pending tasks</p>
                </div>
                <div className="period-selector">
                    <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                        <div className="stat-icon" style={{ background: `${stat.color}10`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {stat.value.toFixed(1)}{stat.suffix}
                                {stat.change !== 0 && (
                                    <span className={`stat-change ${stat.change > 0 ? 'positive' : 'negative'}`}>
                                        {stat.change > 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                                    </span>
                                )}
                            </div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="dashboard-two-col">
                <TeamPerformance teamData={dashboard} />
                <StatusDistribution distribution={dashboard?.status_distribution} />
            </div>
            
            <div className="dashboard-two-col">
                <PendingValidationsCard validations={dashboard?.pending_validations_list} />
                <MissingSubmissionsCard missing={dashboard?.missing_submissions_list} />
            </div>
            
            <TeamMembersTable members={dashboard?.team_members} />
        </div>
    );
};

export default ManagerDashboard;