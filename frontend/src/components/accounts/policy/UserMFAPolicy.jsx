import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
    FiUsers, FiSearch, FiFilter, FiShield, FiShieldOff,
    FiCheckCircle, FiXCircle, FiEdit2, FiSave, FiX,
    FiAlertCircle, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { useAdminMFA } from '../../../hooks/accounts/useAdminMFA';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import Spinner from '../../common/UI/Spinner';
import { ROLES, ROLE_DISPLAY_NAMES } from '../../../config/constants';

const UserMFAPolicy = () => {
    const dispatch = useDispatch();
    const {
        usersPolicy,
        usersPolicyLoading,
        filteredUsers,
        paginatedUsers,
        usersTotal,
        usersPage,
        usersPageSize,
        usersFilters,
        updateUserMFAOverride,
        clearUserMFAOverride,
        loadAllUsersMFAPolicy,
        updateUsersFilters,
        updateUsersPage,
    } = useAdminMFA();

    const [editingUserId, setEditingUserId] = useState(null);
    const [editingValue, setEditingValue] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [mfaStatusFilter, setMfaStatusFilter] = useState('');

    useEffect(() => {
        loadAllUsersMFAPolicy();
    }, [loadAllUsersMFAPolicy]);

    // Debounced search
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
        } else {
            updateUsersFilters({ mfa_enabled: null });
        }
    }, [mfaStatusFilter, updateUsersFilters]);

    const handleOverrideChange = (userId, currentValue) => {
        setEditingUserId(userId);
        setEditingValue(currentValue);
    };

    const handleSaveOverride = async (userId) => {
        try {
            await updateUserMFAOverride(userId, editingValue);
            setEditingUserId(null);
            setEditingValue(null);
            dispatch(showAlert({ type: 'success', message: 'User MFA override updated' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error || 'Failed to update user MFA override' }));
        }
    };

    const handleClearOverride = async (userId) => {
        if (window.confirm('Clear MFA override? User will follow role-based policy.')) {
            try {
                await clearUserMFAOverride(userId);
                dispatch(showAlert({ type: 'success', message: 'MFA override cleared' }));
            } catch (error) {
                dispatch(showAlert({ type: 'error', message: error || 'Failed to clear override' }));
            }
        }
    };

    const getMFABadge = (user) => {
        if (user.mfa_required_override === true) {
            return <span className="badge override-required"><FiShield /> Override: Required</span>;
        }
        if (user.mfa_required_override === false) {
            return <span className="badge override-exempt"><FiShieldOff /> Override: Exempt</span>;
        }
        if (user.mfa_required_by_role) {
            return <span className="badge role-required"><FiShield /> Required by Role</span>;
        }
        return <span className="badge not-required">Not Required</span>;
    };

    const getMFAStatusIcon = (user) => {
        if (user.mfa_enabled) {
            return <FiCheckCircle className="status-icon success" />;
        }
        if (user.mfa_effective_required && !user.mfa_enabled) {
            return <FiXCircle className="status-icon warning" />;
        }
        return <FiShieldOff className="status-icon muted" />;
    };

    const getFullName = (user) => {
        return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
    };

    if (usersPolicyLoading) {
        return (
            <div className="policy-loading">
                <Spinner size="lg" />
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className="policy-container user-mfa-policy">
            {/* Header */}
            <div className="policy-header">
                <div className="header-title">
                    <FiUsers className="header-icon" />
                    <div>
                        <h1>User MFA Policy</h1>
                        <p>Manage MFA requirements for individual users</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="policy-filters">
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
                    <FiFilter className="filter-icon" />
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
                            <th>Policy Requirement</th>
                            <th>Override</th>
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
                                    {getMFABadge(user)}
                                </td>
                                <td>
                                    {editingUserId === user.id ? (
                                        <select
                                            value={editingValue === null ? 'none' : editingValue}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === 'none') setEditingValue(null);
                                                else if (val === 'true') setEditingValue(true);
                                                else setEditingValue(false);
                                            }}
                                            className="override-select"
                                        >
                                            <option value="none">Follow Role Policy</option>
                                            <option value="true">Force MFA On</option>
                                            <option value="false">Force MFA Off</option>
                                        </select>
                                    ) : (
                                        <span className="override-value">
                                            {user.mfa_required_override === true && 'Force On'}
                                            {user.mfa_required_override === false && 'Force Off'}
                                            {user.mfa_required_override === null && 'Role Policy'}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        {editingUserId === user.id ? (
                                            <>
                                                <button
                                                    className="btn-icon save"
                                                    onClick={() => handleSaveOverride(user.id)}
                                                    title="Save"
                                                >
                                                    <FiSave />
                                                </button>
                                                <button
                                                    className="btn-icon cancel"
                                                    onClick={() => setEditingUserId(null)}
                                                    title="Cancel"
                                                >
                                                    <FiX />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="btn-icon edit"
                                                    onClick={() => handleOverrideChange(user.id, user.mfa_required_override)}
                                                    title="Edit Override"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                {user.mfa_required_override !== null && (
                                                    <button
                                                        className="btn-icon clear"
                                                        onClick={() => handleClearOverride(user.id)}
                                                        title="Clear Override"
                                                    >
                                                        <FiX />
                                                    </button>
                                                )}
                                            </>
                                        )}
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

            {/* Legend */}
            <div className="policy-legend">
                <div className="legend-item">
                    <FiCheckCircle className="legend-icon success" />
                    <span>MFA Enabled - Compliant</span>
                </div>
                <div className="legend-item">
                    <FiXCircle className="legend-icon warning" />
                    <span>MFA Required but not enabled</span>
                </div>
                <div className="legend-item">
                    <FiShield className="legend-icon info" />
                    <span>Override: Force MFA On</span>
                </div>
                <div className="legend-item">
                    <FiShieldOff className="legend-icon muted" />
                    <span>Override: Force MFA Off</span>
                </div>
            </div>
        </div>
    );
};

export default UserMFAPolicy;