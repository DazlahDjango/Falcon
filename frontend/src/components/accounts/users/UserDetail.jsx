import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    FiMail, FiPhone, FiCalendar, FiBriefcase, FiUsers, 
    FiEdit, FiArrowLeft, FiMoreVertical, FiActivity 
} from 'react-icons/fi';
import { fetchUserById } from '../../../store/accounts/slice/userSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import UserRoleBadge from './components/UserRoleBadge';
import UserStatusBadge from './components/UserStatusBadge';
import ActivityTimeline from '../dashboard/components/ActivityTimeline';
import KPIProgress from '../dashboard/components/KPIProgress';

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedUser, isLoading } = useSelector((state) => state.user);
    const { user: currentUser } = useSelector((state) => state.auth);
    const [showActions, setShowActions] = useState();
    useEffect(() => {
        dispatch(fetchUserById(id));
    }, [dispatch, id]);
    const canEdit = currentUser?.role === 'client_admin' || currentUser?.role === 'super_admin' || currentUser?.id === id;
    if (isLoading && !selectedUser) {
        return (
            <div className="user-detail-page">
                <SkeletonLoader type="card" />
            </div>
        );
    }
    if (!selectedUser) {
        return (
            <div className="user-detail-page">
                <div className="not-found">
                    <h2>User not found</h2>
                    <button className="btn btn-primary" onClick={() => navigate('/users')}>Back to users</button>
                </div>
            </div>
        );
    }
    return (
        <div className="user-detail-page">
            {/* Header */}
            <div className="detail-header">
                <button className="back-btn" onClick={() => navigate('/users')}>
                    <FiArrowLeft size={20} />
                    Back to Users
                </button>
                {canEdit && (
                    <div className="header-actions">
                        <button 
                            className="btn btn-secondary"
                            onClick={() => navigate(`/users/${id}/edit`)}
                        >
                            <FiEdit size={16} />
                            Edit User
                        </button>
                    </div>
                )}
            </div>
            
            {/* Profile Section */}
            <div className="profile-section">
                <div className="profile-avatar">
                    <img 
                        src={selectedUser.avatar_url || '/static/accounts/img/default-avatar.png'} 
                        alt={selectedUser.full_name}
                    />
                </div>
                <div className="profile-info">
                    <div className="profile-name">
                        <h1>{selectedUser.full_name}</h1>
                        <UserRoleBadge role={selectedUser.role} />
                        <UserStatusBadge isActive={selectedUser.is_active} />
                    </div>
                    <p className="profile-title">{selectedUser.title || 'No title'}</p>
                    <div className="profile-details">
                        <div className="detail-item">
                            <FiMail />
                            <span>{selectedUser.email}</span>
                        </div>
                        {selectedUser.phone && (
                            <div className="detail-item">
                                <FiPhone />
                                <span>{selectedUser.phone}</span>
                            </div>
                        )}
                        <div className="detail-item">
                            <FiCalendar />
                            <span>Joined {new Date(selectedUser.joined_at).toLocaleDateString()}</span>
                        </div>
                        {selectedUser.department && (
                            <div className="detail-item">
                                <FiBriefcase />
                                <span>{selectedUser.department}</span>
                            </div>
                        )}
                        {selectedUser.manager && (
                            <div className="detail-item">
                                <FiUsers />
                                <span>Reports to: {selectedUser.manager.full_name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Stats Row */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-value">{selectedUser.stats?.kpi_count || 0}</div>
                    <div className="stat-label">KPIs</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{selectedUser.stats?.avg_score || 0}%</div>
                    <div className="stat-label">Avg Score</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{selectedUser.stats?.review_count || 0}</div>
                    <div className="stat-label">Reviews</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{selectedUser.stats?.achievement_rate || 0}%</div>
                    <div className="stat-label">Achievement</div>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="detail-grid">
                <div className="grid-left">
                    <KPIProgress kpis={selectedUser.kpis} title="Performance KPIs" />
                </div>
                <div className="grid-right">
                    <ActivityTimeline activities={selectedUser.activities} title="Recent Activity" />
                </div>
            </div>
        </div>
    );
};
export default UserDetail;