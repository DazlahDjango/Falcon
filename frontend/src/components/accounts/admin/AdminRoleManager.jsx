import React, { useState, useEffect } from 'react';
import {
  FiShield,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiKey,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import { useAdmin } from '../../../hooks/accounts/useAdmin';
import { usePagination } from '../../../hooks/accounts/usePagination';
import { RoleForm } from '../roles/RoleForm';
import { RolePermissionManager } from '../roles/RolePermissionManager';

export const AdminRoleManager = () => {
  const {
    getRoles,
    roles,
    isLoading,
    error,
    pagination: storePagination,
    filters,
    setFilters,
    setPage,
    setPageSize,
    clearError,
    deleteRole,
    initSystemRoles,
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const pagination = usePagination({
    initialPage: storePagination.page || 1,
    initialPageSize: storePagination.pageSize || 20,
    initialTotal: storePagination.total || 0,
  });

  useEffect(() => {
    loadRoles();
  }, [pagination.page, pagination.pageSize, filters, searchTerm]);

  const loadRoles = () => {
    getRoles({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters,
      search: searchTerm || filters.search,
    });
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    pagination.goToPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    pagination.goToPage(1);
  };

  const handleRefresh = () => {
    loadRoles();
  };

  const handlePageChange = (newPage) => {
    pagination.goToPage(newPage);
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    pagination.changePageSize(newSize);
    setPageSize(newSize);
  };

  const handleDelete = async (roleId) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    setActionLoading(true);
    try {
      await deleteRole(roleId);
      loadRoles();
    } catch (err) {
      console.error('Failed to delete role:', err);
    } finally {
      setActionLoading(false);
      setActiveMenu(null);
    }
  };

  const handleInitSystemRoles = async () => {
    setActionLoading(true);
    try {
      await initSystemRoles();
      loadRoles();
    } catch (err) {
      console.error('Failed to initialize system roles:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMenuToggle = (roleId, e) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === roleId ? null : roleId);
  };

  return (
    <div className="admin-role-manager">
      <div className="admin-role-header">
        <div className="admin-role-title">
          <FiShield className="title-icon" />
          <h1>Manage Roles</h1>
          <span className="role-count">{pagination.total} roles</span>
        </div>
        <div className="admin-role-actions">
          <button className="btn-secondary" onClick={handleInitSystemRoles} disabled={actionLoading}>
            <FiShield /> {actionLoading ? 'Initializing...' : 'Init System Roles'}
          </button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Create Role
          </button>
          <button className="btn-icon" onClick={handleRefresh}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div className="admin-role-toolbar">
        <div className="admin-role-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="admin-role-filters">
          <select
            className="filter-select"
            value={filters.role_type || ''}
            onChange={(e) => handleFilterChange({ role_type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="system">System</option>
            <option value="custom">Custom</option>
          </select>
          <select
            className="filter-select"
            value={filters.is_assignable == null ? '' : filters.is_assignable.toString()}
            onChange={(e) => {
              const val = e.target.value;
              handleFilterChange({ is_assignable: val === '' ? null : val === 'true' });
            }}
          >
            <option value="">All Assignable</option>
            <option value="true">Assignable</option>
            <option value="false">Not Assignable</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="admin-role-error">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {isLoading && roles.length === 0 ? (
        <div className="admin-role-loading">
          <div className="spinner" />
          <p>Loading roles...</p>
        </div>
      ) : roles.length === 0 ? (
        <div className="admin-role-empty">
          <FiShield className="empty-icon" />
          <h3>No roles found</h3>
          <p>Try adjusting your search or filters</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Create your first role
          </button>
        </div>
      ) : (
        <>
          <div className="admin-role-table-container">
            <table className="admin-role-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Permissions</th>
                  <th>Assignable</th>
                  <th>Users</th>
                  <th className="actions-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="admin-role-row">
                    <td>
                      <div className="role-cell">
                        <FiShield className="role-icon" />
                        <div className="role-cell-info">
                          <span className="role-cell-name">{role.name}</span>
                          <span className="role-cell-description">{role.description || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td><code className="role-code">{role.code}</code></td>
                    <td>
                      <span className={`role-type-badge ${role.role_type}`}>
                        {role.role_type || 'Custom'}
                      </span>
                    </td>
                    <td><span className="permission-count"><FiKey /> {role.permission_count || 0}</span></td>
                    <td>
                      {role.is_assignable ? (
                        <FiCheckCircle className="status-icon success" />
                      ) : (
                        <FiXCircle className="status-icon error" />
                      )}
                    </td>
                    <td><span className="user-count"><FiUsers /> {role.user_count || 0}</span></td>
                    <td className="actions-cell">
                      <div className="action-menu">
                        <button className="menu-trigger" onClick={(e) => handleMenuToggle(role.id, e)}>
                          <FiMoreVertical />
                        </button>
                        {activeMenu === role.id && (
                          <div className="menu-dropdown">
                            <button onClick={() => setSelectedRole(role) || setShowEditModal(true)}>
                              <FiEdit /> Edit
                            </button>
                            <button onClick={() => setSelectedRole(role) || setShowPermissionsModal(true)}>
                              <FiKey /> Manage Permissions
                            </button>
                            {!role.is_system && (
                              <button className="danger" onClick={() => handleDelete(role.id)}>
                                <FiTrash2 /> Delete
                              </button>
                            )}
                            {role.is_system && (
                              <button disabled className="menu-disabled">System roles cannot be deleted</button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-role-pagination">
            <div className="pagination-info">
              Showing {roles.length} of {pagination.total} roles
            </div>
            <div className="pagination-controls">
              <select
                value={pagination.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="pagination-select"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
              >
                <FiChevronLeft />
              </button>
              <span className="pagination-current">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </>
      )}

      {showCreateModal && (
        <RoleForm
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadRoles();
          }}
        />
      )}

      {showEditModal && selectedRole && (
        <RoleForm
          role={selectedRole}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRole(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedRole(null);
            loadRoles();
          }}
        />
      )}

      {showPermissionsModal && selectedRole && (
        <div className="modal-overlay" onClick={() => setShowPermissionsModal(false)}>
          <div className="modal-content permissions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Permissions - {selectedRole.name}</h2>
              <button className="modal-close" onClick={() => setShowPermissionsModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <RolePermissionManager roleId={selectedRole.id} isEditable={!selectedRole.is_system} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminRoleManager;