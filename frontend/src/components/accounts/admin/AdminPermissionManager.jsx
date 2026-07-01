import React, { useState, useEffect } from 'react';
import {
  FiKey,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiShield,
  FiLock,
  FiUnlock,
  FiX,
} from 'react-icons/fi';
import { useAdmin } from '../../../hooks/accounts/useAdmin';
import { usePagination } from '../../../hooks/accounts/usePagination';
import { PermissionBadge } from '../permissions/PermissionBadge';

export const AdminPermissionManager = () => {
  const {
    getPermissions,
    permissions,
    isLoading,
    error,
    pagination: storePagination,
    filters,
    setFilters,
    setPage,
    setPageSize,
    clearError,
    deletePermission,
    initPermissions,
    createPermission,
    updatePermission,
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [formData, setFormData] = useState({
    codename: '',
    name: '',
    description: '',
    category: '',
    level: 'tenant',
    is_active: true,
  });

  const pagination = usePagination({
    initialPage: storePagination.page || 1,
    initialPageSize: storePagination.pageSize || 20,
    initialTotal: storePagination.total || 0,
  });

  useEffect(() => {
    loadPermissions();
  }, [pagination.page, pagination.pageSize, filters, searchTerm]);

  const loadPermissions = () => {
    getPermissions({
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
    loadPermissions();
  };

  const handlePageChange = (newPage) => {
    pagination.goToPage(newPage);
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    pagination.changePageSize(newSize);
    setPageSize(newSize);
  };

  const handleInitPermissions = async () => {
    setActionLoading(true);
    try {
      await initPermissions();
      loadPermissions();
    } catch (err) {
      console.error('Failed to initialize permissions:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (permId) => {
    if (!confirm('Are you sure you want to delete this permission?')) return;
    setActionLoading(true);
    try {
      await deletePermission(permId);
      loadPermissions();
    } catch (err) {
      console.error('Failed to delete permission:', err);
    } finally {
      setActionLoading(false);
      setActiveMenu(null);
    }
  };

  const handleMenuToggle = (permId, e) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === permId ? null : permId);
  };

  const getLevelIcon = (level) => {
    const icons = {
      global: <FiShield className="level-icon global" />,
      tenant: <FiLock className="level-icon tenant" />,
      department: <FiLock className="level-icon department" />,
      team: <FiLock className="level-icon team" />,
      self: <FiUnlock className="level-icon self" />,
    };
    return icons[level] || <FiKey className="level-icon default" />;
  };

  const getLevelLabel = (level) => {
    const labels = {
      global: 'Global',
      tenant: 'Tenant',
      department: 'Department',
      team: 'Team',
      self: 'Self',
    };
    return labels[level] || level;
  };

  return (
    <div className="admin-permission-manager">
      <div className="admin-permission-header">
        <div className="admin-permission-title">
          <FiKey className="title-icon" />
          <h1>Manage Permissions</h1>
          <span className="permission-count">{pagination.total} permissions</span>
        </div>
        <div className="admin-permission-actions">
          <button className="btn-secondary" onClick={handleInitPermissions} disabled={actionLoading}>
            <FiKey /> {actionLoading ? 'Initializing...' : 'Init Permissions'}
          </button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Create Permission
          </button>
          <button className="btn-icon" onClick={handleRefresh}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div className="admin-permission-toolbar">
        <div className="admin-permission-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="admin-permission-filters">
          <select
            className="filter-select"
            value={filters.category || ''}
            onChange={(e) => handleFilterChange({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="kpi">KPI</option>
            <option value="user">User</option>
            <option value="role">Role</option>
            <option value="audit">Audit</option>
            <option value="security">Security</option>
            <option value="billing">Billing</option>
            <option value="settings">Settings</option>
          </select>
          <select
            className="filter-select"
            value={filters.level || ''}
            onChange={(e) => handleFilterChange({ level: e.target.value })}
          >
            <option value="">All Levels</option>
            <option value="global">Global</option>
            <option value="tenant">Tenant</option>
            <option value="department">Department</option>
            <option value="team">Team</option>
            <option value="self">Self</option>
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
        <div className="admin-permission-error">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {isLoading && permissions.length === 0 ? (
        <div className="admin-permission-loading">
          <div className="spinner" />
          <p>Loading permissions...</p>
        </div>
      ) : permissions.length === 0 ? (
        <div className="admin-permission-empty">
          <FiKey className="empty-icon" />
          <h3>No permissions found</h3>
          <p>Try adjusting your search or filters</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Create your first permission
          </button>
        </div>
      ) : (
        <>
          <div className="admin-permission-table-container">
            <table className="admin-permission-table">
              <thead>
                <tr>
                  <th>Permission</th>
                  <th>Codename</th>
                  <th>Category</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th className="actions-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => (
                  <tr key={perm.id} className="admin-permission-row">
                    <td>
                      <div className="permission-cell">
                        <FiKey className="permission-icon" />
                        <div className="permission-cell-info">
                          <span className="permission-cell-name">{perm.name}</span>
                          {perm.description && (
                            <span className="permission-cell-description">{perm.description}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td><code className="permission-codename">{perm.codename}</code></td>
                    <td><PermissionBadge type="category" value={perm.category} /></td>
                    <td>
                      <span className="permission-level">
                        {getLevelIcon(perm.level)}
                        {getLevelLabel(perm.level)}
                      </span>
                    </td>
                    <td>
                      {perm.is_active !== false ? (
                        <span className="status-badge active"><FiCheckCircle /> Active</span>
                      ) : (
                        <span className="status-badge inactive"><FiXCircle /> Inactive</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <div className="action-menu">
                        <button className="menu-trigger" onClick={(e) => handleMenuToggle(perm.id, e)}>
                          <FiMoreVertical />
                        </button>
                        {activeMenu === perm.id && (
                          <div className="menu-dropdown">
                            <button onClick={() => setSelectedPermission(perm) || setShowEditModal(true)}>
                              <FiEdit /> Edit
                            </button>
                            <button className="danger" onClick={() => handleDelete(perm.id)}>
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

          <div className="admin-permission-pagination">
            <div className="pagination-info">
              Showing {permissions.length} of {pagination.total} permissions
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
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content permission-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Permission</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}><FiX /></button>
            </div>
            <form className="modal-form" onSubmit={async (e) => {
              e.preventDefault();
              setActionLoading(true);
              try {
                await createPermission(formData);
                setShowCreateModal(false);
                setFormData({ codename: '', name: '', description: '', category: '', level: 'tenant', is_active: true });
                loadPermissions();
              } catch (err) { console.error('Failed to create permission:', err); }
              setActionLoading(false);
            }}>
              <div className="form-group">
                <label className="form-label">Codename</label>
                <input type="text" className="form-input" value={formData.codename} onChange={(e) => setFormData({ ...formData, codename: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                    <option value="">Select</option>
                    <option value="kpi">KPI</option>
                    <option value="user">User</option>
                    <option value="role">Role</option>
                    <option value="audit">Audit</option>
                    <option value="security">Security</option>
                    <option value="billing">Billing</option>
                    <option value="settings">Settings</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Level</label>
                  <select className="form-select" value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} required>
                    <option value="global">Global</option>
                    <option value="tenant">Tenant</option>
                    <option value="department">Department</option>
                    <option value="team">Team</option>
                    <option value="self">Self</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                  <span className="checkmark"></span> Active
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>{actionLoading ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedPermission && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content permission-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Permission</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}><FiX /></button>
            </div>
            <form className="modal-form" onSubmit={async (e) => {
              e.preventDefault();
              setActionLoading(true);
              try {
                await updatePermission(selectedPermission.id, formData);
                setShowEditModal(false);
                setSelectedPermission(null);
                loadPermissions();
              } catch (err) { console.error('Failed to update permission:', err); }
              setActionLoading(false);
            }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                    <option value="">Select</option>
                    <option value="kpi">KPI</option>
                    <option value="user">User</option>
                    <option value="role">Role</option>
                    <option value="audit">Audit</option>
                    <option value="security">Security</option>
                    <option value="billing">Billing</option>
                    <option value="settings">Settings</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Level</label>
                  <select className="form-select" value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} required>
                    <option value="global">Global</option>
                    <option value="tenant">Tenant</option>
                    <option value="department">Department</option>
                    <option value="team">Team</option>
                    <option value="self">Self</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                  <span className="checkmark"></span> Active
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>{actionLoading ? 'Updating...' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminPermissionManager;