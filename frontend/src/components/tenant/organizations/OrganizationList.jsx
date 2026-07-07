import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiRefreshCw, FiGrid, FiList, FiX } from 'react-icons/fi';
import { useOrganizations } from '../../../hooks/tenant';
import OrganizationCard from './OrganizationCard';
import OrganizationTable from './OrganizationTable';
import OrganizationFilters from './OrganizationFilters';
import OrganizationForm from './OrganizationForm';
import OrganizationOnboardWizard from './OrganizationOnboardWizard';
import './organization.css';

const OrganizationList = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [editingOrg, setEditingOrg] = useState(null);
  const {
    organizations,
    loading,
    error,
    pagination,
    filters,
    count,
    fetchList,
    remove,
    suspend,
    activate,
    updateFilters,
    resetAllFilters,
    updatePagination,
    clearAllErrors,
  } = useOrganizations({ autoFetch: true });

  const handleFilterChange = useCallback((newFilters) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  const handleResetFilters = useCallback(() => {
    resetAllFilters();
  }, [resetAllFilters]);

  const handlePageChange = useCallback((page) => {
    updatePagination({ page });
    fetchList({ page });
  }, [fetchList, updatePagination]);

  const handleView = useCallback((id) => {
    navigate(`/tenant/organizations/${id}`);
  }, [navigate]);

  const handleEdit = useCallback((id) => {
    setEditingOrg(id);
    setShowCreateModal(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    const org = organizations.find((o) => o.id === id);
    if (!window.confirm(`Delete "${org?.name || 'this organization'}"? This performs a soft delete.`)) return;
    try {
      await remove(id);
      fetchList();
    } catch (err) {
      alert(typeof err === 'string' ? err : err?.message || 'Delete failed');
    }
  }, [organizations, remove, fetchList]);

  const handleToggle = useCallback(async (id) => {
    const org = organizations.find((o) => o.id === id);
    if (!org) return;

    try {
      if (org.is_active) {
        if (!window.confirm(`Suspend "${org.name}"? Users will lose access until reactivated.`)) return;
        await suspend(id);
      } else {
        if (!window.confirm(`Activate "${org.name}"?`)) return;
        await activate(id);
      }
      fetchList();
    } catch (err) {
      alert(typeof err === 'string' ? err : err?.message || 'Action failed');
    }
  }, [organizations, suspend, activate, fetchList]);

  const handleCreateSuccess = useCallback(() => {
    setShowCreateModal(false);
    setEditingOrg(null);
    fetchList();
  }, [fetchList]);

  const handleOnboard = useCallback((id) => {
    setSelectedOrgId(id);
    setShowOnboardModal(true);
    setShowCreateModal(false);
  }, []);

  const handleOnboardSuccess = useCallback(() => {
    setShowOnboardModal(false);
    setSelectedOrgId(null);
    fetchList();
  }, [fetchList]);

  const handleRefresh = useCallback(() => {
    fetchList();
  }, [fetchList]);

  if (error) {
    return (
      <div className="org-container">
        <div className="org-card" style={{ textAlign: 'center', padding: '40px', borderColor: '#fecaca' }}>
          <p style={{ color: '#dc2626', fontWeight: 500 }}>Error loading organizations</p>
          <p className="org-text-sm org-text-muted">
            {typeof error === 'string' ? error : error?.error || error?.detail || 'Something went wrong'}
          </p>
          <button className="org-btn org-btn-primary org-mt-4" onClick={() => { clearAllErrors(); fetchList(); }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="org-container">
      <div className="org-header">
        <div>
          <h1 className="org-title">Organizations</h1>
          <p className="org-subtitle">{count} organizations total</p>
        </div>
        <div className="org-flex org-gap-3">
          <button className="org-btn org-btn-secondary" onClick={handleRefresh} disabled={loading}>
            <FiRefreshCw size={16} className={loading ? 'org-loading-spinner' : ''} style={loading ? { width: '16px', height: '16px', borderWidth: '2px' } : {}} />
            {!loading && 'Refresh'}
          </button>
          <button
            className="org-btn org-btn-secondary org-btn-sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            disabled={loading}
          >
            {viewMode === 'grid' ? <FiList size={16} /> : <FiGrid size={16} />}
          </button>
          <button className="org-btn org-btn-primary" onClick={() => { setShowCreateModal(true); setEditingOrg(null); }} disabled={loading}>
            <FiPlus size={16} /> New Organization
          </button>
        </div>
      </div>

      <OrganizationFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        loading={loading}
      />

      {loading && organizations.length === 0 ? (
        <div className="org-loading">
          <div className="org-loading-spinner"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="org-grid org-grid-cols-3">
          {organizations.map((org) => (
            <OrganizationCard
              key={org.id}
              organization={org}
              onClick={() => handleView(org.id)}
            />
          ))}
        </div>
      ) : (
        <OrganizationTable
          organizations={organizations}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
          loading={loading}
        />
      )}

      {pagination.totalPages > 1 && (
        <div className="org-pagination org-flex-center">
          <button
            className={`org-pagination-btn ${pagination.page <= 1 ? 'org-pagination-btn-disabled' : ''}`}
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || loading}
          >
            Previous
          </button>
          {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                className={`org-pagination-btn ${pageNum === pagination.page ? 'org-pagination-btn-active' : ''}`}
                onClick={() => handlePageChange(pageNum)}
                disabled={loading}
              >
                {pageNum}
              </button>
            );
          })}
          {pagination.totalPages > 5 && (
            <span className="org-pagination-info">...</span>
          )}
          <button
            className={`org-pagination-btn ${pagination.page >= pagination.totalPages ? 'org-pagination-btn-disabled' : ''}`}
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
          >
            Next
          </button>
          <span className="org-pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>
      )}

      {showCreateModal && (
        <div className="org-modal-overlay" onClick={() => { setShowCreateModal(false); setEditingOrg(null); }}>
          <div className="org-modal" onClick={(e) => e.stopPropagation()}>
            <div className="org-modal-header">
              <h3 className="org-modal-title">{editingOrg ? 'Edit Organization' : 'Create Organization'}</h3>
              <button className="org-modal-close" onClick={() => { setShowCreateModal(false); setEditingOrg(null); }}>
                <FiX size={20} />
              </button>
            </div>
            <OrganizationForm
              organizationId={editingOrg}
              onSuccess={handleCreateSuccess}
              onCancel={() => { setShowCreateModal(false); setEditingOrg(null); }}
            />
          </div>
        </div>
      )}

      {showOnboardModal && selectedOrgId && (
        <div className="org-modal-overlay" onClick={() => { setShowOnboardModal(false); setSelectedOrgId(null); }}>
          <div className="org-modal" onClick={(e) => e.stopPropagation()}>
            <div className="org-modal-header">
              <h3 className="org-modal-title">Onboard Organization</h3>
              <button className="org-modal-close" onClick={() => { setShowOnboardModal(false); setSelectedOrgId(null); }}>
                <FiX size={20} />
              </button>
            </div>
            <OrganizationOnboardWizard
              organizationId={selectedOrgId}
              onSuccess={handleOnboardSuccess}
              onCancel={() => { setShowOnboardModal(false); setSelectedOrgId(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationList;