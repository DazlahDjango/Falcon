import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiActivity, FiTarget, FiCheckCircle, FiClock, FiTrendingUp, FiAward, FiGrid } from 'react-icons/fi';
import { 
    fetchIndividualDashboard, 
    selectIndividualDashboard, 
    selectDashboardLoading,
    fetchActuals,
    fetchUserKPIs,
    fetchTargets,
    selectActuals,
    selectUserKPIs,
    selectTargets
} from '../../../../store/kpi';
import { useAuthContext } from '../../../../contexts/accounts/AuthContext';
import MyKPIScores from './MyKPIScores';
import RecentActivity from './RecentActivity';
import Achievements from './Achievements';
import PerformanceTrend from './PerformanceTrend';
import ActualMatrixGrid from '../../actuals/matrix/ActualMatrixGrid';
import KPILoading from '../../common/KPILoading';

const IndividualDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user: authUser } = useAuthContext();
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    
    const dashboard = useSelector(selectIndividualDashboard);
    const loading = useSelector(selectDashboardLoading);
    const actuals = useSelector(selectActuals) || [];
    const userKpis = useSelector(state => selectUserKPIs(authUser?.id)(state)) || [];
    const targets = useSelector(selectTargets) || [];
    
    useEffect(() => {
        dispatch(fetchIndividualDashboard({ year, month }));
        if (authUser?.id) {
            dispatch(fetchUserKPIs({ userId: authUser.id, params: { for_actuals: true } }));
            dispatch(fetchActuals({ scope: 'my', year, page_size: 100 }));
            dispatch(fetchTargets({ user: authUser.id, year, pageSize: 100 }));
        }
    }, [dispatch, year, month, authUser?.id]);

    const handleCellClick = (actual) => {
        if (actual?.id) {
            navigate(`/kpi/actuals?selected=${actual.id}`);
        } else {
            navigate('/kpi/actuals');
        }
    };

    const handleAddClick = ({ kpi_id, year: y, month: m }) => {
        navigate(`/kpi/actuals?submit=true&kpi=${kpi_id}&year=${y}&month=${m}`);
    };
    
    if (loading && !dashboard) {
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
                    <p>Welcome back! Here's your personal performance overview</p>
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

            {/* Monthly Actuals Matrix Grid */}
            <div style={{ marginTop: '2rem' }}>
                <ActualMatrixGrid 
                    actuals={actuals}
                    kpis={userKpis}
                    targets={targets}
                    selectedYear={year}
                    onYearChange={setYear}
                    onCellClick={handleCellClick}
                    onAddClick={handleAddClick}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default IndividualDashboard;