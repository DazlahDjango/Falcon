import React, { useState, useEffect } from 'react';
import {
  FiBriefcase,
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
  FiUsers,
  FiCalendar,
  FiShield,
} from 'react-icons/fi';
import { useAdmin } from '../../../hooks/accounts/useAdmin';
import { usePagination } from '../../../hooks/accounts/usePagination';

export const AdminTenantManager = () => {
  const {
    getTenants,
    tenants,
    isLoading,
    error,
    pagination: storePagination,
    filters,
    setFilters,
    setPage,
    setPageSize,
    clearError,
    deleteTenant,
    suspendTenant,
    activateTenant,
    createTenantWithAdmin,
    getUsers,
    users,
    mapTenantUser,
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  // Load users on mount
  useEffect(() => {
    getUsers({ limit: 100 });
  }, [getUsers]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    subscription_plan: 'trial',
    admin_email: '',
    admin_username: '',
    admin_password: '',
    admin_first_name: '',
    admin_last_name: '',
  });

  const pagination = usePagination({
    initialPage: storePagination.page || 1,
    initialPageSize: storePagination.pageSize || 20,
    initialTotal: storePagination.total || 0,
  });

  useEffect(() => {
    loadTenants();
  }, [pagination.page, pagination.pageSize, filters, searchTerm]);

  const loadTenants = () => {
    getTenants({
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
    loadTenants();
  };

  const handlePageChange = (newPage) => {
    pagination.goToPage(newPage);
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    pagination.changePageSize(newSize);
    setPageSize(newSize);
  };

  const handleSuspend = async (tenantId) => {
    setActionLoading(true);
    try {
      await suspendTenant(tenantId);
      loadTenants();
    } catch (err) {
      console.error('Failed to suspend tenant:', err);
    } finally {
      setActionLoading(false);
      setActiveMenu(null);
    }
  };

  const handleActivate = async (tenantId) => {
    setActionLoading(true);
    try {
      await activateTenant(tenantId);
      loadTenants();
    } catch (err) {
      console.error('Failed to activate tenant:', err);
    } finally {
      setActionLoading(false);
      setActiveMenu(null);
    }
  };

  const handleDelete = async (tenantId) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return;
    setActionLoading(true);
    try {
      await deleteTenant(tenantId);
      loadTenants();
    } catch (err) {
      console.error('Failed to delete tenant:', err);
    } finally {
      setActionLoading(false);
      setActiveMenu(null);
    }
  };

  const handleMenuToggle = (tenantId, e) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === tenantId ? null : tenantId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="admin-tenant-manager">
      <div className="admin-tenant-header">
        <div className="admin-tenant-title">
          <FiBriefcase className="title-icon" />
          <h1>Manage Tenants</h1>
          <span className="tenant-count">{pagination.total} tenants</span>
        </div>
        <div className="admin-tenant-actions">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Create Tenant
          </button>
          <button className="btn-icon" onClick={handleRefresh}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div className="admin-tenant-toolbar">
        <div className="admin-tenant-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="admin-tenant-filters">
          <select
            className="filter-select"
            value={filters.plan || ''}
            onChange={(e) => handleFilterChange({ plan: e.target.value })}
          >
            <option value="">All Plans</option>
            <option value="trial">Trial</option>
            <option value="basic">Basic</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
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
        <div className="admin-tenant-error">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {isLoading && tenants.length === 0 ? (
        <div className="admin-tenant-loading">
          <div className="spinner" />
          <p>Loading tenants...</p>
        </div>
      ) : tenants.length === 0 ? (
        <div className="admin-tenant-empty">
          <FiBriefcase className="empty-icon" />
          <h3>No tenants found</h3>
          <p>Try adjusting your search or filters</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Create your first tenant
          </button>
        </div>
      ) : (
        <>
          <div className="admin-tenant-table-container">
            <table className="admin-tenant-table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Slug</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Users</th>
                  <th>Created</th>
                  <th className="actions-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="admin-tenant-row">
                    <td>
                      <div className="tenant-cell">
                        <FiBriefcase className="tenant-icon" />
                        <div className="tenant-cell-info">
                          <span className="tenant-cell-name">{tenant.name}</span>
                          <span className="tenant-cell-domain">{tenant.domain || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td><code className="tenant-slug">{tenant.slug}</code></td>
                    <td>
                      <span className={`plan-badge ${tenant.subscription_plan}`}>
                        {tenant.subscription_plan || 'trial'}
                      </span>
                    </td>
                    <td>
                      {tenant.is_active !== false ? (
                        <span className="status-badge active"><FiCheckCircle /> Active</span>
                      ) : (
                        <span className="status-badge inactive"><FiXCircle /> Inactive</span>
                      )}
                    </td>
                    <td><span className="user-count"><FiUsers /> {tenant.user_count || 0}</span></td>
                    <td>
                      <div className="date-cell">
                        <FiCalendar className="date-icon" />
                        {formatDate(tenant.created_at)}
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="action-menu">
                        <button className="menu-trigger" onClick={(e) => handleMenuToggle(tenant.id, e)}>
                          <FiMoreVertical />
                        </button>
                        {activeMenu === tenant.id && (
                          <div className="menu-dropdown">
                            <button onClick={() => setSelectedTenant(tenant) || setShowEditModal(true)}>
                              <FiEdit /> Edit
                            </button>
                            {tenant.is_active !== false ? (
                              <button onClick={() => handleSuspend(tenant.id)}>
                                <FiXCircle /> Suspend
                              </button>
                            ) : (
                              <button onClick={() => handleActivate(tenant.id)}>
                                <FiCheckCircle /> Activate
                              </button>
                            )}
                            <button onClick={() => setSelectedTenant(tenant) || setShowMapModal(true)}>
                              <FiShield /> Map User
                            </button>
                            <button className="danger" onClick={() => handleDelete(tenant.id)}>
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

          <div className="admin-tenant-pagination">
            <div className="pagination-info">
              Showing {tenants.length} of {pagination.total} tenants
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
          <div className="modal-content tenant-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Tenant</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}><FiX /></button>
            </div>
            <form className="modal-form" onSubmit={async (e) => {
              e.preventDefault();
              setActionLoading(true);
              try {
                await createTenantWithAdmin(formData);
                setShowCreateModal(false);
                setFormData({ name: '', slug: '', domain: '', subscription_plan: 'trial', admin_email: '', admin_username: '', admin_password: '', admin_first_name: '', admin_last_name: '' });
                loadTenants();
              } catch (err) { console.error('Failed to create tenant:', err); }
              setActionLoading(false);
            }}>
              <div className="form-group">
                <label className="form-label">Tenant Name</label>
                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Slug</label>
                  <input type="text" className="form-input" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Domain</label>
                  <input type="text" className="form-input" value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Subscription Plan</label>
                <select className="form-select" value={formData.subscription_plan} onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}>
                  <option value="trial">Trial</option>
                  <option value="basic">Basic</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <hr />
              <h4>Admin Account</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" className="form-input" value={formData.admin_first_name} onChange={(e) => setFormData({ ...formData, admin_first_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" className="form-input" value={formData.admin_last_name} onChange={(e) => setFormData({ ...formData, admin_last_name: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Admin Email</label>
                <input type="email" className="form-input" value={formData.admin_email} onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Admin Username</label>
                <input type="text" className="form-input" value={formData.admin_username} onChange={(e) => setFormData({ ...formData, admin_username: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Admin Password</label>
                <input type="password" className="form-input" value={formData.admin_password} onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>{actionLoading ? 'Creating...' : 'Create Tenant'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMapModal && selectedTenant && (
        <div className="modal-overlay" onClick={() => { setShowMapModal(false); setSelectedUserId(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '400px' }}>
            <div className="modal-header" style={{ marginBottom: '15px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Map User to {selectedTenant.name}</h2>
            </div>
            <p style={{ color: '#4B5563', marginBottom: '15px' }}>
              Select the user to map to this organization:
            </p>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <select 
                className="filter-select"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">-- Select User --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.email} ({u.full_name || 'No Name'})</option>
                ))}
              </select>
            </div>
            <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '6px' }} onClick={() => { setShowMapModal(false); setSelectedUserId(''); }}>Cancel</button>
              <button 
                className="btn-primary" 
                style={{ padding: '8px 16px', borderRadius: '6px' }}
                disabled={actionLoading}
                onClick={async () => {
                  if (!selectedUserId) {
                    alert('Please select a user');
                    return;
                  }
                  setActionLoading(true);
                  try {
                    await mapTenantUser(selectedTenant.id, selectedUserId);
                    loadTenants();
                    setShowMapModal(false);
                    setSelectedUserId('');
                  } catch (err) {
                    alert(err || 'Failed to map user');
                  } finally {
                    setActionLoading(false);
                  }
                }}
              >
                {actionLoading ? 'Saving...' : 'Save Mapping'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminTenantManager;