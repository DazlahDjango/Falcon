import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiMail, FiPhone, FiCalendar, FiBriefcase, FiUsers,
    FiEdit, FiArrowLeft, FiActivity, FiShield, FiCheckCircle,
    FiXCircle, FiLock, FiUnlock, FiRefreshCw
} from 'react-icons/fi';
import { useUsers } from '../../../hooks/accounts/useUsers';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { useTeam } from '../../../hooks/accounts/useTeam';
import UserRoleBadge from './components/UserRoleBadge';
import UserStatusBadge from './components/UserStatusBadge';
import Spinner from '../../common/UI/Spinner';

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const {
        selectedUser,
        isLoading,
        loadUserById,
        activateUserAccount,
        deactivateUserAccount,
        unlockUserAccount,
        assignUserRole,
        clearUserSelection,
    } = useUsers();
    const { loadReportingChain, reportingChain } = useTeam();

    const [showRoleMenu, setShowRoleMenu] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadUserById(id);
        loadReportingChain(id);
        return () => {
            clearUserSelection();
        };
    }, [id, loadUserById, loadReportingChain, clearUserSelection]);

    const canEdit = currentUser?.role === 'client_admin' || currentUser?.role === 'super_admin' || currentUser?.id === id;
    const canManage = currentUser?.role === 'client_admin' || currentUser?.role === 'super_admin';
    const canAssignRole = currentUser?.role === 'client_admin' || currentUser?.role === 'super_admin';

    const handleRoleChange = async (role) => {
        if (!window.confirm(`Change ${selectedUser?.full_name || selectedUser?.email}'s role to ${role}?`)) return;

        setIsUpdating(true);
        try {
            await assignUserRole(id, role);
            await loadUserById(id);
        } finally {
            setIsUpdating(false);
            setShowRoleMenu(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!selectedUser) return;

        const action = selectedUser.is_active ? 'deactivate' : 'activate';
        if (window.confirm(`Are you sure you want to ${action} ${selectedUser.full_name || selectedUser.email}?`)) {
            setIsUpdating(true);
            try {
                if (selectedUser.is_active) {
                    await deactivateUserAccount(id);
                } else {
                    await activateUserAccount(id);
                }
                await loadUserById(id);
            } finally {
                setIsUpdating(false);
            }
        }
    };

    const handleUnlock = async () => {
        if (!selectedUser?.locked_until) return;

        if (window.confirm(`Unlock ${selectedUser.full_name || selectedUser.email}'s account?`)) {
            setIsUpdating(true);
            try {
                await unlockUserAccount(id);
                await loadUserById(id);
            } finally {
                setIsUpdating(false);
            }
        }
    };

    const getRoleOptions = () => {
        const roles = [
            { value: 'super_admin', label: 'Super Admin' },
            { value: 'client_admin', label: 'Client Admin' },
            { value: 'executive', label: 'Executive' },
            { value: 'supervisor', label: 'Supervisor' },
            { value: 'dashboard_champion', label: 'Dashboard Champion' },
            { value: 'staff', label: 'Staff' },
            { value: 'read_only', label: 'Read Only' },
        ];

        // Filter based on current user's permissions
        if (currentUser?.role !== 'super_admin') {
            return roles.filter(r => r.value !== 'super_admin');
        }
        return roles;
    };

    if (isLoading && !selectedUser) {
        return (
            <div className="user-detail-page">
                <div className="detail-loading">
                    <Spinner size="lg" />
                    <p>Loading user profile...</p>
                </div>
            </div>
        );
    }

    if (!selectedUser) {
        return (
            <div className="user-detail-page">
                <div className="not-found">
                    <h2>User Not Found</h2>
                    <p>The user you're looking for doesn't exist or has been removed.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/users')}>
                        Back to Users
                    </button>
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
                            disabled={isUpdating}
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
                    <div className="avatar-initials">
                        {selectedUser.full_name?.charAt(0)?.toUpperCase() || selectedUser.email?.charAt(0)?.toUpperCase()}
                    </div>
                </div>
                <div className="profile-info">
                    <div className="profile-name">
                        <h1>{selectedUser.full_name || selectedUser.username}</h1>
                        <UserRoleBadge role={selectedUser.role} />
                        <UserStatusBadge isActive={selectedUser.is_active} />
                        {selectedUser.locked_until && (
                            <span className="badge badge-warning">
                                <FiLock size={12} /> Locked
                            </span>
                        )}
                        {selectedUser.mfa_enabled && (
                            <span className="badge badge-success">
                                <FiShield size={12} /> MFA Enabled
                            </span>
                        )}
                    </div>
                    <p className="profile-title">{selectedUser.title || 'No title specified'}</p>

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
                            <span>Joined {new Date(selectedUser.joined_at || selectedUser.created_at).toLocaleDateString()}</span>
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
                                <span>Reports to: {selectedUser.manager_name || selectedUser.manager?.email}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-value">{selectedUser.mfa_enabled ? 'Enabled' : 'Disabled'}</div>
                    <div className="stat-label">MFA Status</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{selectedUser.is_verified ? 'Verified' : 'Unverified'}</div>
                    <div className="stat-label">Email Status</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{selectedUser.is_onboarded ? 'Complete' : 'Pending'}</div>
                    <div className="stat-label">Onboarding</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{selectedUser.login_attempts || 0}</div>
                    <div className="stat-label">Failed Attempts</div>
                </div>
            </div>

            {/* Admin Actions (for managers) */}
            {canManage && (
                <div className="admin-actions-section">
                    <h3>Administrative Actions</h3>
                    <div className="admin-actions-grid">
                        <div className="role-selector">
                            <label>Role Assignment</label>
                            <div className="role-selector-container">
                                <select
                                    value={selectedUser.role}
                                    onChange={(e) => handleRoleChange(e.target.value)}
                                    disabled={!canAssignRole || isUpdating}
                                    className="role-select"
                                >
                                    {getRoleOptions().map(role => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                                {isUpdating && <Spinner size="sm" />}
                            </div>
                        </div>

                        <button
                            className={`action-btn ${selectedUser.is_active ? 'danger' : 'success'}`}
                            onClick={handleToggleStatus}
                            disabled={isUpdating}
                        >
                            {selectedUser.is_active ? <FiXCircle size={16} /> : <FiCheckCircle size={16} />}
                            {selectedUser.is_active ? 'Deactivate User' : 'Activate User'}
                        </button>

                        {selectedUser.locked_until && (
                            <button
                                className="action-btn warning"
                                onClick={handleUnlock}
                                disabled={isUpdating}
                            >
                                <FiUnlock size={16} />
                                Unlock Account
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Reporting Chain */}
            {reportingChain && reportingChain.length > 0 && (
                <div className="reporting-chain-section">
                    <h3>
                        <FiUsers size={18} />
                        Reporting Chain
                    </h3>
                    <div className="chain-list">
                        {reportingChain.map((chainUser, index) => (
                            <div key={chainUser.id} className="chain-item">
                                <div className="chain-avatar">
                                    {chainUser.first_name?.charAt(0) || chainUser.email?.charAt(0)}
                                </div>
                                <div className="chain-info">
                                    <div className="chain-name">{chainUser.first_name} {chainUser.last_name}</div>
                                    <div className="chain-role">{chainUser.role}</div>
                                </div>
                                {index < reportingChain.length - 1 && <div className="chain-arrow">↓</div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetail;