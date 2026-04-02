import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiTarget, FiCheckCircle, FiClock, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import StatsWidget from './components/StatsWidget';
import ActivityTimeline from './components/ActivityTimeline';
import QuickActions from './components/QuickActions';
import KPIProgress from './components/KPIProgress';
import NotificationList from './components/NotificationList';
import { fetchUserStats, fetchUserKPIs, fetchUserActivities } from '../../store/slices/dashboardSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';

const UserDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { stats, kpis, activities, isLoading } = useSelector((state) => state.dashboard);
    const [period, setPeriod] = useState('month');
    
    useEffect(() => {
        dispatch(fetchUserStats());
        dispatch(fetchUserKPIs({ period }));
        dispatch(fetchUserActivities());
    }, [dispatch, period]);
    
    if (isLoading && !stats) {
        return (
            <div className="dashboard-container">
                <SkeletonLoader type="card" count={4} />
            </div>
        );
    }
    
    return (
        <div className="dashboard-container user-dashboard">
            {/* Welcome Section */}
            <div className="welcome-section">
                <h1>Welcome back, {user?.first_name || user?.username}!</h1>
                <p>Here's your performance overview for {period === 'month' ? 'this month' : 'this quarter'}</p>
                <div className="period-selector">
                    <button 
                        className={`period-btn ${period === 'month' ? 'active' : ''}`}
                        onClick={() => setPeriod('month')}
                    >
                        Monthly
                    </button>
                    <button 
                        className={`period-btn ${period === 'quarter' ? 'active' : ''}`}
                        onClick={() => setPeriod('quarter')}
                    >
                        Quarterly
                    </button>
                    <button 
                        className={`period-btn ${period === 'year' ? 'active' : ''}`}
                        onClick={() => setPeriod('year')}
                    >
                        Yearly
                    </button>
                </div>
            </div>
            
            {/* Stats Grid */}
            <div className="stats-grid">
                <StatsWidget 
                    title="Overall Performance"
                    value={`${stats?.overall_score || 0}%`}
                    icon={<FiTrendingUp />}
                    trend={stats?.score_trend}
                    color="primary"
                />
                <StatsWidget 
                    title="KPIs Completed"
                    value={`${stats?.completed_kpis || 0}/${stats?.total_kpis || 0}`}
                    icon={<FiCheckCircle />}
                    progress={(stats?.completed_kpis / stats?.total_kpis) * 100 || 0}
                    color="success"
                />
                <StatsWidget 
                    title="Pending Tasks"
                    value={stats?.pending_tasks || 0}
                    icon={<FiClock />}
                    subtitle={`${stats?.overdue_tasks || 0} overdue`}
                    color="warning"
                />
                <StatsWidget 
                    title="Upcoming Reviews"
                    value={stats?.upcoming_reviews || 0}
                    icon={<FiCalendar />}
                    subtitle={`Next: ${stats?.next_review_date || 'Not scheduled'}`}
                    color="info"
                />
            </div>
            
            {/* Main Content Grid */}
            <div className="dashboard-grid">
                <div className="grid-left">
                    <KPIProgress kpis={kpis} />
                    <QuickActions userRole="staff" />
                </div>
                <div className="grid-right">
                    <NotificationList limit={5} />
                    <ActivityTimeline activities={activities} />
                </div>
            </div>
        </div>
    );
};
export default UserDashboard;