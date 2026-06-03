import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    FiUsers,
    FiSearch,
    FiRefreshCw,
    FiTrash2,
    FiEye,
    FiShield,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiLoader,
    FiChevronLeft,
    FiChevronRight
} from 'react-icons/fi';
import { useAdminMFA } from '../../../hooks/accounts/useAdminMFA';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import Spinner from '../../common/UI/Spinner';
import { ROLE_DISPLAY_NAMES } from '../../../config/constants';
import './mfa-admin.css';

const AdminMfaResetView = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {
        usersPolicy,
        usersPolicyLoading,
        filteredUsers,
        paginatedUsers,
        usersTotal,
        usersPage,
        usersPageSize,
        resettingUserMFA,
        loadAllUsersMFAPolicy,
        resetUserMFA,
        updateUsersFilters,
        updateUsersPage,
    } = useAdminMFA();

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [mfaStatusFilter, setMfaStatusFilter] = useState('');
    const [showResetConfirm, setShowResetConfirm] = useState(null);
    const [resetReason, setResetReason] = useState('');

    useEffect(() => {
        loadAllUsersMFAPolicy();
    }, [loadAllUsersMFAPolicy]);

    useEffect(() => {
        const timer = setTimeout(() => {
            updateUsersFilters({ search: searchTerm });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, updateUsersFilters]);

    useEffect(() => {
        updateUsersFilters({ role: roleFilter || null });
    }, [roleFilter, updateUsersFilters]);

    useEffect(() => {
        if (mfaStatusFilter === 'enabled') {
            updateUsersFilters({ mfa_enabled: true });
        } else if (mfaStatusFilter === 'disabled') {
            updateUsersFilters({ mfa_enabled: false });
        } else if (mfaStatusFilter === 'required') {
            updateUsersFilters({ mfa_required_override: 'required' });
        } else if (mfaStatusFilter === 'exempt') {
            updateUsersFilters({ mfa_required_override: 'exempt' });
        } else {
            updateUsersFilters({ mfa_enabled: null, mfa_required_override: null });
        }
    }, [mfaStatusFilter, updateUsersFilters]);

    const handleResetMFA = async () => {
        if (!showResetConfirm) return;
        try {
            await resetUserMFA(showResetConfirm.id, resetReason);
            setShowResetConfirm(null);
            setResetReason('');
            await loadAllUsersMFAPolicy();
            dispatch(showAlert({ type: 'success', message: `MFA reset for ${showResetConfirm.email}` }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: 'Failed to reset MFA' }));
        }
    };

    const getMFAStatusIcon = (user) => {
        if (user.mfa_enabled) {
            return <FiCheckCircle className="status-icon success" title="MFA Enabled" />;
        }
        if (user.mfa_effective_required && !user.mfa_enabled) {
            return <FiAlertCircle className="status-icon warning" title="MFA Required - Not Enabled" />;
        }
        return <FiXCircle className="status-icon muted" title="MFA Disabled" />;
    };

    const getFullName = (user) => {
        return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
    };

    if (usersPolicyLoading) {
        return (
            <div className="mfa-admin-loading">
                <Spinner size="lg" />
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className="mfa-admin-container">
            {/* Header */}
            <div className="admin-header">
                <div className="header-title">
                    <FiShield className="header-icon" />
                    <div>
                        <h1>MFA Management</h1>
                        <p>Reset MFA for users who have lost access to their authenticator</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-filters">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="">All Roles</option>
                        {Object.entries(ROLE_DISPLAY_NAMES).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <select value={mfaStatusFilter} onChange={(e) => setMfaStatusFilter(e.target.value)}>
                        <option value="">All MFA Status</option>
                        <option value="enabled">MFA Enabled</option>
                        <option value="disabled">MFA Disabled</option>
                        <option value="required">MFA Required (Policy)</option>
                        <option value="exempt">MFA Exempt (Override)</option>
                    </select>
                </div>

                <div className="filter-stats">
                    <span>{usersTotal} user(s) found</span>
                </div>
            </div>

            {/* Users Table */}
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>MFA Status</th>
                            <th>Policy</th>
                            <th>Devices</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map((user) => (
                            <tr key={user.id} className={!user.mfa_enabled && user.mfa_effective_required ? 'warning-row' : ''}>
                                <td>
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            {getFullName(user).charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-details">
                                            <div className="user-name">{getFullName(user)}</div>
                                            <div className="user-email">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="role-badge">{ROLE_DISPLAY_NAMES[user.role] || user.role}</span>
                                </td>
                                <td>
                                    <div className="mfa-status">
                                        {getMFAStatusIcon(user)}
                                        <span>{user.mfa_enabled ? 'Enabled' : 'Disabled'}</span>
                                    </div>
                                </td>
                                <td>
                                    {user.mfa_required_override === true && <span className="badge override">Force On</span>}
                                    {user.mfa_required_override === false && <span className="badge exempt">Force Off</span>}
                                    {user.mfa_required_override === null && user.mfa_required_by_role && <span className="badge role">Role Required</span>}
                                    {user.mfa_required_override === null && !user.mfa_required_by_role && <span className="badge none">Not Required</span>}
                                </td>
                                <td>
                                    <span className="devices-count">
                                        {user.mfa_devices_count || 0} device(s)
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon view"
                                            onClick={() => navigate(`/admin/mfa/status/${user.id}`)}
                                            title="View Details"
                                        >
                                            <FiEye />
                                        </button>
                                        <button
                                            className="btn-icon reset"
                                            onClick={() => setShowResetConfirm(user)}
                                            disabled={resettingUserMFA === user.id}
                                            title="Reset MFA"
                                        >
                                            {resettingUserMFA === user.id ? <Spinner size="sm" /> : <FiRefreshCw />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {usersTotal > usersPageSize && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        onClick={() => updateUsersPage(usersPage - 1)}
                        disabled={usersPage === 1}
                    >
                        <FiChevronLeft />
                    </button>
                    <span className="pagination-info">
                        Page {usersPage} of {Math.ceil(usersTotal / usersPageSize)}
                    </span>
                    <button
                        className="pagination-btn"
                        onClick={() => updateUsersPage(usersPage + 1)}
                        disabled={usersPage >= Math.ceil(usersTotal / usersPageSize)}
                    >
                        <FiChevronRight />
                    </button>
                </div>
            )}

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <FiAlertCircle className="modal-icon warning" />
                            <h3>Reset MFA for User?</h3>
                        </div>
                        <p>You are about to reset MFA for:</p>
                        <div className="user-info-card">
                            <strong>{getFullName(showResetConfirm)}</strong>
                            <span>{showResetConfirm.email}</span>
                        </div>
                        <p>This will:</p>
                        <ul>
                            <li>Remove all MFA devices</li>
                            <li>Invalidate all backup codes</li>
                            <li>Disable MFA for this user</li>
                            <li>Send email notification</li>
                        </ul>
                        <div className="form-group">
                            <label>Reason (optional)</label>
                            <textarea
                                value={resetReason}
                                onChange={(e) => setResetReason(e.target.value)}
                                placeholder="Enter reason for MFA reset..."
                                rows="3"
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowResetConfirm(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleResetMFA}>
                                Yes, Reset MFA
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMfaResetView;