import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiShield, FiCheckCircle, FiAlertCircle, FiClock, FiUsers, FiTarget, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
import { fetchChampionDashboard, selectChampionDashboard, selectDashboardLoading } from '../../../../store/kpi';
import DepartmentCompliance from './DepartmentCompliance';
import RedAlertKPIs from './RedAlertKPIs';
import SubmissionRateCard from './SubmissionRateCard';
import PendingEscalationsCard from './PendingEscalationsCard';
import KPILoading from '../../common/KPILoading';

const ChampionDashboard = () => {
    const dispatch = useDispatch();
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    
    const dashboard = useSelector(selectChampionDashboard);
    const loading = useSelector(selectDashboardLoading);
    
    useEffect(() => {
        dispatch(fetchChampionDashboard({ year, month }));
    }, [dispatch, year, month]);
    
    if (loading) {
        return <KPILoading text="Loading champion dashboard..." />;
    }
    
    const stats = [
        { 
            label: 'Organization Submission', 
            value: dashboard?.organization_submission_rate || 0, 
            suffix: '%', 
            icon: <FiTrendingUp size={20} />,
            change: dashboard?.submission_change || 0,
            color: '#4f46e5'
        },
        { 
            label: 'Pending Escalations', 
            value: dashboard?.pending_escalations || 0, 
            suffix: '', 
            icon: <FiAlertCircle size={20} />,
            change: 0,
            color: '#ef4444'
        },
        { 
            label: 'Active Departments', 
            value: dashboard?.active_departments || 0, 
            suffix: '', 
            icon: <FiUsers size={20} />,
            change: 0,
            color: '#10b981'
        },
        { 
            label: 'Compliance Rate', 
            value: dashboard?.compliance_rate || 0, 
            suffix: '%', 
            icon: <FiShield size={20} />,
            change: dashboard?.compliance_change || 0,
            color: '#3b82f6'
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
        <div className="kpi-champion-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Champion Dashboard</h1>
                    <p>Monitor organization-wide compliance and performance</p>
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
                <SubmissionRateCard 
                    submissionRate={dashboard?.organization_submission_rate}
                    totalSubmissions={dashboard?.total_submissions}
                    expectedSubmissions={dashboard?.expected_submissions}
                />
                <PendingEscalationsCard 
                    escalations={dashboard?.pending_escalations}
                    escalationsList={dashboard?.escalations_list}
                />
            </div>
            
            <div className="dashboard-two-col">
                <DepartmentCompliance departments={dashboard?.department_compliance} />
                <RedAlertKPIs alerts={dashboard?.red_kpi_alerts} />
            </div>
        </div>
    );
};

export default ChampionDashboard;