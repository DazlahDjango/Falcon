import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiUserCheck,
  FiUserX,
  FiShield,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
} from 'react-icons/fi';
import { useAdmin } from '../../../hooks/accounts/useAdmin';
import { UserForm } from '../users/UserForm';
import { UserStatusBadge } from '../users/UserStatusBadge';
import { UserRoleBadge } from '../users/UserRoleBadge';
import { UserAvatar } from '../common/UserAvatar';

export const AdminUserManager = () => {
  const {
    getUsers,
    users,
    isLoading,
    error,
    pagination: storePagination,
    filters,
    setFilters,
    setPage,
    setPageSize,
    clearError,
    deleteUser,
    activateUser,
    deactivateUser,
    impersonateUser,
    forcePasswordReset,
    createUser,
    updateUser,
    verifyUser,
    isCreating,
    isUpdating,
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Memoized pagination values
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((storePagination.total || 0) / (storePagination.pageSize || 1))),
    [storePagination.total, storePagination.pageSize]
  );
  
  const hasPrev = storePagination.page > 1;
  const hasNext = storePagination.page < totalPages;

  // Load users function - memoized to prevent unnecessary re-renders
  const loadUsers = useCallback(() => {
    console.log('[AdminUserManager] loadUsers called');
    getUsers({
      page: storePagination.page,
      pageSize: storePagination.pageSize,
      ...filters,
      search: searchTerm || filters.search,
    });
  }, [getUsers, storePagination.page, storePagination.pageSize, filters, searchTerm]);

  // Initial load only on mount
  useEffect(() => {
    if (isInitialLoad && !isLoading && users.length === 0) {
      console.log('[AdminUserManager] Initial load');
      loadUsers();
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, isLoading, users.length, loadUsers]);

  // Handle pagination, filter, and search changes
  useEffect(() => {
    if (!isInitialLoad) {
      console.log('[AdminUserManager] Loading due to filter/pagination change');
      loadUsers();
    }
  }, [storePagination.page, storePagination.pageSize, filters, searchTerm, isInitialLoad, loadUsers]);

  // 🔍 Monitor users changes
  useEffect(() => {
    console.log('🔄 users changed in component:', users);
    console.log('🔄 users length changed to:', users?.length);
    if (users?.length > 0) {
      console.log('✅ Users found! First user:', users[0]);
    }
  }, [users]);

  // Reset initial load flag when refresh is needed
  const handleRefresh = useCallback(() => {
    setIsInitialLoad(false);
    loadUsers();
  }, [loadUsers]);

  // Search handler
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setPage(1);
  }, [setPage]);

  // Filter handler
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, [setFilters, setPage]);

  // Page change handler
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, [setPage]);

  // Page size change handler
  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
  }, [setPageSize]);

  // User action handlers
  const handleActivate = useCallback(async (userId) => {
    setActionLoading(true);
    try {
      await activateUser(userId);
      loadUsers();
    } catch (err) {
      console.error('Failed to activate user:', err);
    } finally {
      setActionLoading(false);
      setActiveMenu(null);
    }
  }, [activateUser, loadUsers]);

  const handleDeactivate = useCallback(async (userId) => {
    setActionLoading(true);
    try {
      await deactivateUser(userId);
      loadUsers();
    } catch (err) {
      console.error('Failed to deactivate user:', err);
    } finally {
      setActionLoading(false);
      setActiveMenu(null);
    }
  }, [deactivateUser, loadUsers]);

  const handleDelete = useCallback(async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setActionLoading(true);
    try {
      await deleteUser(userId);
      loadUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setActionLoading(false);
      setActiveMenu(null);
    }
  }, [deleteUser, loadUsers]);

  const handleImpersonate = useCallback(async (userId) => {
    setActionLoading(true);
    try {
      await impersonateUser(userId);
    } catch (err) {
      console.error('Failed to impersonate user:', err);
    } finally {
      setActionLoading(false);
      setActiveMenu(null);
    }
  }, [impersonateUser]);

  const handleForceReset = useCallback(async (userId) => {
    setActionLoading(true);
    try {
      await forcePasswordReset(userId);
      setActiveMenu(null);
    } catch (err) {
      console.error('Failed to force password reset:', err);
    } finally {
      setActionLoading(false);
      setActiveMenu(null);
    }
  }, [forcePasswordReset]);

  const handleVerify = useCallback(async (userId) => {
    setActionLoading(true);
    try {
      await verifyUser(userId);
      loadUsers();
    } catch (err) {
      console.error('Failed to verify user:', err);
    } finally {
      setActionLoading(false);
      setActiveMenu(null);
    }
  }, [verifyUser, loadUsers]);

  const handleMenuToggle = useCallback((userId, e) => {
    e.stopPropagation();
    setActiveMenu(prev => prev === userId ? null : userId);
  }, []);

  // Render loading state
  if (isLoading && users.length === 0) {
    return (
      <div className="admin-user-manager">
        <div className="admin-user-loading">
          <div className="spinner" />
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!isLoading && users.length === 0 && !isInitialLoad) {
    return (
      <div className="admin-user-manager">
        <div className="admin-user-header">
          <div className="admin-user-title">
            <FiUsers className="title-icon" />
            <h1>Manage Users</h1>
            <span className="user-count">0 users</span>
          </div>
          <div className="admin-user-actions">
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <FiPlus /> Create User
            </button>
            <button className="btn-icon" onClick={handleRefresh}>
              <FiRefreshCw className={isLoading ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        <div className="admin-user-toolbar">
          <div className="admin-user-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="admin-user-filters">
            <select
              className="filter-select"
              value={filters.role || ''}
              onChange={(e) => handleFilterChange({ role: e.target.value })}
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="client_admin">Client Admin</option>
              <option value="executive">Executive</option>
              <option value="supervisor">Supervisor</option>
              <option value="staff">Staff</option>
              <option value="read_only">Read Only</option>
            </select>
            <select
              className="filter-select"
              value={filters.is_active == null ? '' : filters.is_active.toString()}
              onChange={(e) => {
                const val = e.target.value;
                handleFilterChange({ is_active: val === '' ? null : val === 'true' });
              }}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="admin-user-error">
            <span>{error}</span>
            <button onClick={clearError}>×</button>
          </div>
        )}

        <div className="admin-user-empty">
          <FiUsers className="empty-icon" />
          <h3>No users found</h3>
          <p>Try adjusting your search or filters</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Create your first user
          </button>
        </div>

        {/* Modals */}
        {showCreateModal && (
          <UserForm
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadUsers();
            }}
            createUser={createUser}
            isLoading={isCreating}
          />
        )}

        {showEditModal && selectedUser && (
          <UserForm
            user={selectedUser}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedUser(null);
              loadUsers();
            }}
            updateUser={updateUser}
            isLoading={isUpdating}
          />
        )}
      </div>
    );
  }

  // Main render with users
  return (
    <div className="admin-user-manager">
      {/* Header */}
      <div className="admin-user-header">
        <div className="admin-user-title">
          <FiUsers className="title-icon" />
          <h1>Manage Users</h1>
          <span className="user-count">{storePagination.total} users</span>
        </div>
        <div className="admin-user-actions">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Create User
          </button>
          <button className="btn-icon" onClick={handleRefresh}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-user-toolbar">
        <div className="admin-user-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="admin-user-filters">
          <select
            className="filter-select"
            value={filters.role || ''}
            onChange={(e) => handleFilterChange({ role: e.target.value })}
          >
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="client_admin">Client Admin</option>
            <option value="executive">Executive</option>
            <option value="supervisor">Supervisor</option>
            <option value="staff">Staff</option>
            <option value="read_only">Read Only</option>
          </select>
          <select
            className="filter-select"
            value={filters.is_active == null ? '' : filters.is_active.toString()}
            onChange={(e) => {
              const val = e.target.value;
              handleFilterChange({ is_active: val === '' ? null : val === 'true' });
            }}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="admin-user-error">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {/* Users table */}
      <div className="admin-user-table-container">
        <table className="admin-user-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>MFA</th>
              <th>Last Login</th>
              <th>Created</th>
              <th className="actions-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="admin-user-row">
                <td>
                  <div className="user-cell">
                    <UserAvatar user={user} size="sm" />
                    <div className="user-cell-info">
                      <span className="user-cell-name">
                        {user.full_name || user.first_name || user.email}
                      </span>
                      <span className="user-cell-email">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td><UserRoleBadge role={user.role} /></td>
                <td>
                  <UserStatusBadge
                    isActive={user.is_active !== false}
                    isVerified={user.is_verified === true}
                  />
                </td>
                <td>{user.mfa_enabled ? '✅' : '❌'}</td>
                <td>{user.last_login ? new Date(user.last_login).toLocaleDateString() : '-'}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <div className="action-menu">
                    <button 
                      className="menu-trigger" 
                      onClick={(e) => handleMenuToggle(user.id, e)}
                      disabled={actionLoading}
                    >
                      <FiMoreVertical />
                    </button>
                    {activeMenu === user.id && (
                      <div className="menu-dropdown">
                        <button onClick={() => setSelectedUser(user) || setShowEditModal(true)}>
                          <FiEdit /> Edit
                        </button>
                        {user.is_active !== false ? (
                          <button onClick={() => handleDeactivate(user.id)}>
                            <FiUserX /> Deactivate
                          </button>
                        ) : (
                          <button onClick={() => handleActivate(user.id)}>
                            <FiUserCheck /> Activate
                          </button>
                        )}
                        <button onClick={() => handleImpersonate(user.id)}>
                          <FiShield /> Impersonate
                        </button>
                        <button onClick={() => handleForceReset(user.id)}>
                          <FiShield /> Force Password Reset
                        </button>
                        {!user.is_verified && (
                          <button onClick={() => handleVerify(user.id)}>
                            <FiUserCheck /> Verify Account
                          </button>
                        )}
                        <hr />
                        <button className="danger" onClick={() => handleDelete(user.id)}>
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="admin-user-pagination">
        <div className="pagination-info">
          Showing {users.length} of {storePagination.total} users
        </div>
        <div className="pagination-controls">
          <select
            value={storePagination.pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="pagination-select"
            disabled={isLoading}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(storePagination.page - 1)}
            disabled={!hasPrev || isLoading}
          >
            <FiChevronLeft />
          </button>
          <span className="pagination-current">
            Page {storePagination.page} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(storePagination.page + 1)}
            disabled={!hasNext || isLoading}
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <UserForm
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadUsers();
          }}
          createUser={createUser}
          isLoading={isCreating}
        />
      )}

      {showEditModal && selectedUser && (
        <UserForm
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            loadUsers();
          }}
          updateUser={updateUser}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
};

export default AdminUserManager;