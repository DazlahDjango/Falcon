import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiUsers, FiUserCheck, FiAward, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import StatsWidget from './components/StatsWidget';
import ActivityTimeline from './components/ActivityTimeline';
import QuickActions from './components/QuickActions';
import KPIProgress from './components/KPIProgress';
import { fetchTeamStats, fetchTeamMembers, fetchTeamActivities } from '../../store/slices/teamSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import UserCard from '../users/components/UserCard';

const TeamDashboard = () => {
    const dispatch = useDispatch();
    const { stats, teamMembers, activities, isLoading } = useSelector((state) => state.team);
    const [selectedMember, setSelectedMember] = useState(null);
    
    useEffect(() => {
        dispatch(fetchTeamStats());
        dispatch(fetchTeamMembers());
        dispatch(fetchTeamActivities());
    }, [dispatch]);
    
    if (isLoading && !stats) {
        return (
            <div className="dashboard-container">
                <SkeletonLoader type="card" count={4} />
            </div>
        );
    }
    
    return (
        <div className="dashboard-container team-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>Team Dashboard</h1>
                    <p>Manage and monitor your team's performance</p>
                </div>
                <div className="team-summary">
                    <span className="team-count">{teamMembers?.length || 0} team members</span>
                </div>
            </div>
            
            {/* Team Stats */}
            <div className="stats-grid">
                <StatsWidget 
                    title="Team Performance"
                    value={`${stats?.team_avg_score || 0}%`}
                    icon={<FiTrendingUp />}
                    trend={stats?.score_trend}
                    color="primary"
                />
                <StatsWidget 
                    title="Active Members"
                    value={stats?.active_members || 0}
                    icon={<FiUsers />}
                    subtitle={`out of ${stats?.total_members || 0} total`}
                    color="success"
                />
                <StatsWidget 
                    title="On Track"
                    value={stats?.on_track_members || 0}
                    icon={<FiUserCheck />}
                    subtitle={`${stats?.at_risk_members || 0} at risk`}
                    color="info"
                />
                <StatsWidget 
                    title="Pending Approvals"
                    value={stats?.pending_approvals || 0}
                    icon={<FiAlertCircle />}
                    subtitle="awaiting validation"
                    color="warning"
                />
            </div>
            
            {/* Team Members Grid */}
            <div className="team-members-section">
                <h2>Team Members</h2>
                <div className="team-members-grid">
                    {teamMembers?.map((member) => (
                        <UserCard 
                            key={member.id}
                            user={member}
                            onClick={() => setSelectedMember(member)}
                            showKpiSummary
                        />
                    ))}
                </div>
            </div>
            
            {/* Member Detail Modal */}
            {selectedMember && (
                <div className="member-detail-modal" onClick={() => setSelectedMember(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedMember(null)}>×</button>
                        <h3>{selectedMember.full_name}</h3>
                        <KPIProgress kpis={selectedMember.kpis} />
                        <div className="member-actions">
                            <button className="btn btn-sm btn-primary">View Full Profile</button>
                            <button className="btn btn-sm btn-secondary">Submit Feedback</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Recent Activity */}
            <div className="dashboard-grid">
                <div className="grid-left">
                    <QuickActions userRole="supervisor" />
                </div>
                <div className="grid-right">
                    <ActivityTimeline activities={activities} title="Team Activity" />
                </div>
            </div>
        </div>
    );
};

export default TeamDashboard;