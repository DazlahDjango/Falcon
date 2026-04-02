import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    FiTrendingUp, FiTrendingDown, FiUsers, FiBriefcase, 
    FiAward, FiBarChart2, FiDownload, FiRefreshCw 
} from 'react-icons/fi';
import StatsWidget from './components/StatsWidget';
import ActivityTimeline from './components/ActivityTimeline';
import { 
    fetchOrgStats, fetchDepartmentPerformance, 
    fetchExecutiveKPIs, fetchOrgActivities 
} from '../../store/slices/executiveSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

const ExecutiveDashboard = () => {
    const dispatch = useDispatch();
    const { stats, departments, kpis, activities, isLoading } = useSelector((state) => state.executive);
    const [dateRange, setDateRange] = useState('month');
    
    useEffect(() => {
        dispatch(fetchOrgStats({ range: dateRange }));
        dispatch(fetchDepartmentPerformance());
        dispatch(fetchExecutiveKPIs());
        dispatch(fetchOrgActivities());
    }, [dispatch, dateRange]);
    
    // Chart data for performance trend
    const performanceData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Overall Performance',
                data: stats?.monthly_scores || [],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };
    
    // Department performance chart
    const deptChartData = {
        labels: departments?.map(d => d.name) || [],
        datasets: [
            {
                label: 'Performance Score',
                data: departments?.map(d => d.score) || [],
                backgroundColor: '#3b82f6',
                borderRadius: 8
            }
        ]
    };
    
    // KPI distribution chart
    const kpiDistribution = {
        labels: ['On Track', 'At Risk', 'Off Track'],
        datasets: [
            {
                data: [kpis?.on_track || 0, kpis?.at_risk || 0, kpis?.off_track || 0],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0
            }
        ]
    };
    
    if (isLoading && !stats) {
        return (
            <div className="dashboard-container">
                <SkeletonLoader type="card" count={6} />
            </div>
        );
    }
    
    return (
        <div className="dashboard-container executive-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>Executive Dashboard</h1>
                    <p>Organization-wide performance insights</p>
                </div>
                <div className="header-actions">
                    <select 
                        className="date-range-select" 
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="month">Last 30 Days</option>
                        <option value="quarter">Last Quarter</option>
                        <option value="year">Year to Date</option>
                        <option value="all">All Time</option>
                    </select>
                    <button className="btn btn-secondary btn-sm">
                        <FiDownload size={16} />
                        Export Report
                    </button>
                    <button className="btn btn-secondary btn-sm">
                        <FiRefreshCw size={16} />
                    </button>
                </div>
            </div>
            
            {/* Key Metrics */}
            <div className="stats-grid">
                <StatsWidget 
                    title="Organization Score"
                    value={`${stats?.org_score || 0}%`}
                    icon={<FiBarChart2 />}
                    trend={stats?.score_trend}
                    color="primary"
                />
                <StatsWidget 
                    title="Active Employees"
                    value={stats?.active_employees || 0}
                    icon={<FiUsers />}
                    trend={stats?.employee_trend}
                    color="info"
                />
                <StatsWidget 
                    title="Departments"
                    value={stats?.total_departments || 0}
                    icon={<FiBriefcase />}
                    subtitle={`${stats?.departments_on_track || 0} on track`}
                    color="success"
                />
                <StatsWidget 
                    title="Top Performer"
                    value={stats?.top_performer?.name || 'N/A'}
                    icon={<FiAward />}
                    subtitle={`Score: ${stats?.top_performer?.score || 0}%`}
                    color="warning"
                />
            </div>
            
            {/* Charts Row */}
            <div className="charts-row">
                <div className="chart-card">
                    <h3>Performance Trend</h3>
                    <Line 
                        data={performanceData} 
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'top' } }
                        }}
                    />
                </div>
                <div className="chart-card">
                    <h3>Department Performance</h3>
                    <Bar 
                        data={deptChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } }
                        }}
                    />
                </div>
                <div className="chart-card">
                    <h3>KPI Distribution</h3>
                    <Doughnut 
                        data={kpiDistribution}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom' } }
                        }}
                    />
                </div>
            </div>
            
            {/* Department Performance Table */}
            <div className="department-table-container">
                <h2>Department Performance</h2>
                <table className="department-table">
                    <thead>
                        <tr>
                            <th>Department</th>
                            <th>Head</th>
                            <th>Members</th>
                            <th>Avg Score</th>
                            <th>Status</th>
                            <th>Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments?.map((dept) => (
                            <tr key={dept.id}>
                                <td className="dept-name">{dept.name}</td>
                                <td>{dept.head_name || '—'}</td>
                                <td>{dept.member_count}</td>
                                <td className="score-cell">{dept.score}%</td>
                                <td>
                                    <span className={`status-badge status-${dept.status}`}>
                                        {dept.status === 'on_track' ? 'On Track' : 
                                         dept.status === 'at_risk' ? 'At Risk' : 'Off Track'}
                                    </span>
                                </td>
                                <td>
                                    {dept.trend > 0 ? (
                                        <span className="trend-up"><FiTrendingUp /> +{dept.trend}%</span>
                                    ) : (
                                        <span className="trend-down"><FiTrendingDown /> {dept.trend}%</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Recent Activity */}
            <div className="activity-section">
                <ActivityTimeline activities={activities} title="Recent Organization Activity" />
            </div>
        </div>
    );
};
export default ExecutiveDashboard;