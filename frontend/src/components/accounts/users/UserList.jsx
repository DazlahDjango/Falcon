import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter, FiDownload, FiRefreshCw, FiUpload } from 'react-icons/fi';
import { useUsers } from '../../../hooks/accounts/useUsers';
import { useAuth } from '../../../hooks/accounts/useAuth';
import UserCard from './components/UserCard';
import UserFilters from './components/UserFilters';
import InviteUserModal from './components/InviteUserModal';
import UserExport from './components/UserExport';
import BulkInviteModal from './components/BulkInviteModal';
import Spinner from '../../common/UI/Spinner';

const UserList = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const {
        users,
        pagination,
        filters,
        isLoading,
        loadUsers,
        deleteUser,
        clearUserError,
        updateFilters,
        clearAllFilters,
        goToPage,
    } = useUsers();

    const [showFilters, setShowFilters] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showBulkInviteModal, setShowBulkInviteModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const canManageUsers = currentUser?.role === 'client_admin' || currentUser?.role === 'super_admin';

    const loadUserList = useCallback(() => {
        const params = {
            ...filters,
            search: searchTerm,
            page: pagination.current_page,
            page_size: pagination.page_size,
        };
        loadUsers(params);
    }, [filters, searchTerm, pagination.current_page, pagination.page_size, loadUsers]);

    useEffect(() => {
        loadUserList();
    }, [loadUserList]);

    const handleSearch = (e) => {
        e.preventDefault();
        loadUserList();
    };

    const handleFilterChange = (newFilters) => {
        updateFilters(newFilters);
    };

    const handleResetFilters = () => {
        clearAllFilters();
        setSearchTerm('');
    };

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
            await deleteUser(userId);
            loadUserList();
        }
    };

    const handleRefresh = () => {
        loadUserList();
    };

    if (isLoading && !users.length) {
        return (
            <div className="users-page">
                <div className="page-header">
                    <h1>Team Members</h1>
                    <p>Loading team members...</p>
                </div>
                <div className="users-loading">
                    <Spinner size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="users-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-title-section">
                    <h1>Team Members</h1>
                    <p>Manage and invite team members to your organization</p>
                </div>
                <div className="header-actions">
                    <button className="btn-icon" onClick={handleRefresh} title="Refresh">
                        <FiRefreshCw size={18} />
                    </button>
                    {canManageUsers && (
                        <>
                            <button className="btn btn-secondary" onClick={() => setShowExportModal(true)}>
                                <FiDownload size={16} />
                                Export
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowBulkInviteModal(true)}>
                                <FiUpload size={16} />
                                Bulk Invite
                            </button>
                            <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
                                <FiPlus size={16} />
                                Invite User
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="users-stats">
                <div className="stat-card">
                    <div className="stat-value">{pagination.total_items}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{users.filter(u => u.is_active).length}</div>
                    <div className="stat-label">Active</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{users.filter(u => u.mfa_enabled).length}</div>
                    <div className="stat-label">MFA Enabled</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{users.filter(u => u.is_verified).length}</div>
                    <div className="stat-label">Verified</div>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="search-filters-bar">
                <form onSubmit={handleSearch} className="search-form">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
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
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <UserFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                />
            )}

            {/* Users Grid */}
            {users.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>No users found</h3>
                    <p>Try adjusting your search or filters to find what you're looking for.</p>
                    {canManageUsers && (
                        <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
                            <FiPlus size={16} />
                            Invite your first team member
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="users-grid">
                        {users.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onEdit={() => navigate(`/users/${user.id}/edit`)}
                                onDelete={() => handleDeleteUser(user.id, user.full_name || user.email)}
                                showActions={canManageUsers}
                                currentUserId={currentUser?.id}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.total_pages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                disabled={pagination.current_page === 1}
                                onClick={() => goToPage(pagination.current_page - 1)}
                            >
                                Previous
                            </button>
                            <span className="pagination-info">
                                Page {pagination.current_page} of {pagination.total_pages}
                            </span>
                            <button
                                className="pagination-btn"
                                disabled={pagination.current_page === pagination.total_pages}
                                onClick={() => goToPage(pagination.current_page + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            <InviteUserModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                onSuccess={() => loadUserList()}
            />

            <UserExport
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                users={users}
                totalCount={pagination.total_items}
            />

            <BulkInviteModal
                isOpen={showBulkInviteModal}
                onClose={() => setShowBulkInviteModal(false)}
                onSuccess={() => loadUserList()}
            />
        </div>
    );
};

export default UserList;