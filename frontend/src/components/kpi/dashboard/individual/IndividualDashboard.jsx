import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiActivity, FiTarget, FiCheckCircle, FiClock, FiTrendingUp, FiAward } from 'react-icons/fi';
import { fetchIndividualDashboard, selectIndividualDashboard, selectDashboardLoading } from '../../../../store/kpi';
import MyKPIScores from './MyKPIScores';
import RecentActivity from './RecentActivity';
import Achievements from './Achievements';
import PerformanceTrend from './PerformanceTrend';
import KPILoading from '../../common/KPILoading';

const IndividualDashboard = () => {
    const dispatch = useDispatch();
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    
    const dashboard = useSelector(selectIndividualDashboard);
    const loading = useSelector(selectDashboardLoading);
    
    useEffect(() => {
        dispatch(fetchIndividualDashboard({ year, month }));
    }, [dispatch, year, month]);
    
    if (loading) {
        return <KPILoading text="Loading your dashboard..." />;
    }
    
    const stats = [
        { 
            label: 'Overall Score', 
            value: dashboard?.overall_score || 0, 
            suffix: '%', 
            icon: <FiActivity size={20} />,
            change: dashboard?.score_change || 0,
            color: '#4f46e5'
        },
        { 
            label: 'KPIs Tracked', 
            value: dashboard?.kpi_count || 0, 
            suffix: '', 
            icon: <FiTarget size={20} />,
            change: 0,
            color: '#10b981'
        },
        { 
            label: 'Achievements', 
            value: dashboard?.achievements_count || 0, 
            suffix: '', 
            icon: <FiAward size={20} />,
            change: dashboard?.achievements_change || 0,
            color: '#f59e0b'
        },
        { 
            label: 'Pending Tasks', 
            value: dashboard?.pending_tasks || 0, 
            suffix: '', 
            icon: <FiClock size={20} />,
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
        <div className="kpi-individual-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's your performance overview</p>
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
                                {Number(stat.value || 0).toFixed(1)}{stat.suffix}
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
                <MyKPIScores scores={dashboard?.kpis} />
                <PerformanceTrend data={dashboard?.trend_data} />
            </div>
            
            <div className="dashboard-two-col">
                <RecentActivity activities={dashboard?.recent_activity} />
                <Achievements achievements={dashboard?.achievements} />
            </div>
        </div>
    );
};

export default IndividualDashboard;