import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiActivity, FiTarget, FiUsers, FiAlertCircle, FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { fetchExecutiveDashboard, selectExecutiveDashboard, selectDashboardLoading } from '../../../../store/kpi';
import OrganizationHealth from './OrganizationHealth';
import DepartmentRankings from './DepartmentRankings';
import RedAlertKPIs from './RedAlertKPIs';
import TrendAnalysis from './TrendAnalysis';
import RiskIndicators from './RiskIndicators';
import KPILoading from '../../common/KPILoading';

const ExecutiveDashboard = () => {
    const dispatch = useDispatch();
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    
    const dashboard = useSelector(selectExecutiveDashboard);
    const loading = useSelector(selectDashboardLoading);
    
    useEffect(() => {
        dispatch(fetchExecutiveDashboard({ year, month }));
    }, [dispatch, year, month]);
    
    if (loading) {
        return <KPILoading text="Loading executive dashboard..." />;
    }
    
    const stats = [
        { 
            label: 'Organization Health', 
            value: dashboard?.overall_health || 0, 
            suffix: '%', 
            icon: <FiActivity size={20} />,
            change: dashboard?.health_change || 0,
            color: '#4f46e5'
        },
        { 
            label: 'Total Employees', 
            value: dashboard?.total_employees || 0, 
            suffix: '', 
            icon: <FiUsers size={20} />,
            change: dashboard?.employees_change || 0,
            color: '#10b981'
        },
        { 
            label: 'Goals Active', 
            value: dashboard?.active_goals || 0, 
            suffix: '', 
            icon: <FiTarget size={20} />,
            change: dashboard?.goals_change || 0,
            color: '#3b82f6'
        },
        { 
            label: 'Red KPIs', 
            value: dashboard?.red_kpi_count || 0, 
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
        <div className="kpi-executive-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Executive Dashboard</h1>
                    <p>Organization-wide performance overview</p>
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
            
            <OrganizationHealth health={dashboard?.organization_health} />
            
            <div className="dashboard-two-col">
                <DepartmentRankings rankings={dashboard?.department_rankings} />
                <RedAlertKPIs alerts={dashboard?.red_alerts} />
            </div>
            
            <div className="dashboard-two-col">
                <TrendAnalysis trendData={dashboard?.trend_data} />
                <RiskIndicators indicators={dashboard?.risk_indicators} />
            </div>
        </div>
    );
};

export default ExecutiveDashboard;