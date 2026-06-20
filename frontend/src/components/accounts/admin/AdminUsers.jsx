import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiPlus, FiSearch, FiEdit, FiTrash2, FiLock, FiUnlock,
    FiShield, FiRefreshCw, FiFilter,FiUserCheck, FiUserX, FiUsers, FiAlertCircle
} from 'react-icons/fi';
import { useAdmin } from '../../../hooks/accounts/useAdmin';
import { ROUTES } from '../../../config/constants';
import ConfirmationDialog from '../../common/Feedback/ConfirmationDialog';
import Spinner from '../../common/UI/Spinner';

const AdminUsers = () => {
    const navigate = useNavigate();
    const {
        users,
        isLoading,
        error,
        pagination,
        loadAllUsersAdmin,
        deleteUserAdminAction,
        suspendUserAction,
        activateUserAdminAction,
        clearAdminError,
    } = useAdmin();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const loadUsers = useCallback(() => {
        const params = {
            search: searchTerm,
            role: roleFilter || undefined,
            is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
            page: pagination.current_page,
            page_size: pagination.page_size,
        };
        loadAllUsersAdmin(params);
    }, [loadAllUsersAdmin, searchTerm, roleFilter, statusFilter, pagination.current_page, pagination.page_size]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleSearch = (e) => {
        e.preventDefault();
        loadUsers();
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setRoleFilter('');
        setStatusFilter('');
    };

    const handleDelete = async () => {
        if (selectedUser) {
            await deleteUserAdminAction(selectedUser.id);
            setSelectedUser(null);
            setActionType(null);
            loadUsers();
        }
    };

    const handleSuspend = async () => {
        if (selectedUser) {
            await suspendUserAction(selectedUser.id);
            setSelectedUser(null);
            setActionType(null);
            loadUsers();
        }
    };

    const handleActivate = async () => {
        if (selectedUser) {
            await activateUserAdminAction(selectedUser.id);
            setSelectedUser(null);
            setActionType(null);
            loadUsers();
        }
    };

    const getRoleBadgeClass = (role) => {
        const classes = {
            super_admin: 'role-super-admin',
            client_admin: 'role-client-admin',
            executive: 'role-executive',
            supervisor: 'role-supervisor',
            dashboard_champion: 'role-dashboard-champion',
            staff: 'role-staff',
            read_only: 'role-read-only',
        };
        return classes[role] || 'role-staff';
    };

    const getRoleDisplay = (role) => {
        const displays = {
            super_admin: 'Super Admin',
            client_admin: 'Client Admin',
            executive: 'Executive',
            supervisor: 'Supervisor',
            dashboard_champion: 'Dashboard Champion',
            staff: 'Staff',
            read_only: 'Read Only',
        };
        return displays[role] || role;
    };

    if (isLoading && !users.length) {
        return (
            <div className="admin-loading">
                <Spinner size="lg" />
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className="admin-users-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>User Management</h1>
                    <p>Manage all users across the platform</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate(ROUTES.ADMIN_USER_CREATE)}>
                    <FiPlus size={16} />
                    Create User
                </button>
            </div>

            {/* Stats Summary */}
            <div className="admin-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon"><FiUsers size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{pagination.total_items}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon"><FiUserCheck size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{users.filter(u => u.is_active).length}</div>
                        <div className="stat-label">Active Users</div>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon"><FiUserX size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{users.filter(u => !u.is_active).length}</div>
                        <div className="stat-label">Inactive Users</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FiShield size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{users.filter(u => u.mfa_enabled).length}</div>
                        <div className="stat-label">MFA Enabled</div>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="admin-error-banner">
                    <FiAlertCircle size={18} />
                    <span>{error}</span>
                    <button onClick={() => { clearAdminError(); loadUsers(); }}>Retry</button>
                </div>
            )}

            {/* Search and Filters Bar */}
            <div className="admin-search-bar">
                <form onSubmit={handleSearch} className="search-form">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-btn">Search</button>
                </form>
                <div className="filter-actions">
                    <button
                        className={`filter-btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter size={16} />
                        Filters
                    </button>
                    <button className="refresh-btn" onClick={() => loadUsers()}>
                        <FiRefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="admin-filters-panel">
                    <div className="filters-grid">
                        <div className="filter-group">
                            <label>Role</label>
                            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                <option value="">All Roles</option>
                                <option value="super_admin">Super Admin</option>
                                <option value="client_admin">Client Admin</option>
                                <option value="executive">Executive</option>
                                <option value="supervisor">Supervisor</option>
                                <option value="dashboard_champion">Dashboard Champion</option>
                                <option value="staff">Staff</option>
                                <option value="read_only">Read Only</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Status</label>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>MFA Status</label>
                            <select>
                                <option value="">All</option>
                                <option value="enabled">MFA Enabled</option>
                                <option value="disabled">MFA Disabled</option>
                            </select>
                        </div>
                    </div>
                    <div className="filters-footer">
                        <button className="reset-btn" onClick={handleResetFilters}>Reset Filters</button>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Tenant</th>
                            <th>Status</th>
                            <th>MFA</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-info">
                                        <div className="user-avatar-sm">
                                            {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <span className="user-name">{user.full_name || user.username}</span>
                                    </div>
                                </td>
                                <td className="user-email">{user.email}</td>
                                <td>
                                    <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                                        {getRoleDisplay(user.role)}
                                    </span>
                                </td>
                                <td>{user.tenant_name || '—'}</td>
                                <td>
                                    <span className={`status-badge ${user.is_active ? 'active' : 'suspended'}`}>
                                        {user.is_active ? 'Active' : 'Suspended'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`mfa-badge ${user.mfa_enabled ? 'enabled' : 'disabled'}`}>
                                        {user.mfa_enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </td>
                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                <td className="actions-cell">
                                    <button
                                        className="action-icon edit"
                                        onClick={() => navigate(ROUTES.ADMIN_USER_EDIT.replace(':id', user.id))}
                                        title="Edit User"
                                    >
                                        <FiEdit size={16} />
                                    </button>
                                    {user.is_active ? (
                                        <button
                                            className="action-icon suspend"
                                            onClick={() => { setSelectedUser(user); setActionType('suspend'); }}
                                            title="Suspend User"
                                        >
                                            <FiLock size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            className="action-icon activate"
                                            onClick={() => { setSelectedUser(user); setActionType('activate'); }}
                                            title="Activate User"
                                        >
                                            <FiUnlock size={16} />
                                        </button>
                                    )}
                                    <button
                                        className="action-icon delete"
                                        onClick={() => { setSelectedUser(user); setActionType('delete'); }}
                                        title="Delete User"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
                <div className="admin-pagination">
                    <button
                        className="pagination-btn"
                        disabled={pagination.current_page === 1}
                        onClick={() => loadAllUsersAdmin({ page: pagination.current_page - 1 })}
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {pagination.current_page} of {pagination.total_pages}
                    </span>
                    <button
                        className="pagination-btn"
                        disabled={pagination.current_page === pagination.total_pages}
                        onClick={() => loadAllUsersAdmin({ page: pagination.current_page + 1 })}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                isOpen={!!selectedUser && actionType === 'delete'}
                onClose={() => { setSelectedUser(null); setActionType(null); }}
                onConfirm={handleDelete}
                type="danger"
                title="Delete User"
                message={`Are you sure you want to delete ${selectedUser?.email}? This action cannot be undone.`}
                confirmText="Delete"
            />

            <ConfirmationDialog
                isOpen={!!selectedUser && actionType === 'suspend'}
                onClose={() => { setSelectedUser(null); setActionType(null); }}
                onConfirm={handleSuspend}
                type="warning"
                title="Suspend User"
                message={`Are you sure you want to suspend ${selectedUser?.email}? They will not be able to log in.`}
                confirmText="Suspend"
            />

            <ConfirmationDialog
                isOpen={!!selectedUser && actionType === 'activate'}
                onClose={() => { setSelectedUser(null); setActionType(null); }}
                onConfirm={handleActivate}
                type="success"
                title="Activate User"
                message={`Are you sure you want to activate ${selectedUser?.email}? They will be able to log in again.`}
                confirmText="Activate"
            />
        </div>
    );
};

export default AdminUsers;