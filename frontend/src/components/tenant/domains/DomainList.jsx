// components/tenant/domains/DomainList.jsx
import React, { useState, useCallback } from 'react';
import { FiPlus, FiRefreshCw, FiGrid, FiList, FiX } from 'react-icons/fi';
import { useDomains } from '../../../hooks/tenant';
import DomainTable from './DomainTable';
import DomainForm from './DomainForm';
import DomainVerifyModal from './DomainVerifyModal';
import DomainStatusBadge from './DomainStatusBadge';

const DomainList = ({ organizationId, onViewDomain }) => {
  const [viewMode, setViewMode] = useState('table');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState(null);
  const [editingDomain, setEditingDomain] = useState(null);

  const {
    domains,
    loading,
    error,
    pagination,
    filters,
    count,
    fetchList,
    remove,
    verify,
    setPrimary,
    renew,
    updateFilters,
    resetAllFilters,
    updatePagination,
    clearAllErrors,
  } = useDomains({ autoFetch: true, filters: organizationId ? { organization_id: organizationId } : {} });

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
    if (onViewDomain) {
      onViewDomain(id);
    } else {
      setSelectedDomainId(id);
    }
  }, [onViewDomain]);

  const handleEdit = useCallback((id) => {
    setEditingDomain(id);
    setShowCreateModal(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this domain?')) {
      try {
        await remove(id);
        fetchList();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  }, [remove, fetchList]);

  const handleVerify = useCallback((id) => {
    setSelectedDomainId(id);
    setShowVerifyModal(true);
  }, []);

  const handleSetPrimary = useCallback(async (id) => {
    if (window.confirm('Set this as the primary domain?')) {
      try {
        await setPrimary(id);
        fetchList();
      } catch (err) {
        console.error('Set primary failed:', err);
      }
    }
  }, [setPrimary, fetchList]);

  const handleRenewSSL = useCallback(async (id) => {
    if (window.confirm('Renew SSL certificate for this domain?')) {
      try {
        await renew(id);
        fetchList();
      } catch (err) {
        console.error('SSL renewal failed:', err);
      }
    }
  }, [renew, fetchList]);

  const handleCreateSuccess = useCallback(() => {
    setShowCreateModal(false);
    setEditingDomain(null);
    fetchList();
  }, [fetchList]);

  const handleVerifySuccess = useCallback(() => {
    setShowVerifyModal(false);
    setSelectedDomainId(null);
    fetchList();
  }, [fetchList]);

  const handleRefresh = useCallback(() => {
    fetchList();
  }, [fetchList]);

  const stats = {
    total: count || 0,
    active: domains.filter(d => d.status === 'ACTIVE').length,
    pending: domains.filter(d => d.status === 'PENDING' || d.status === 'VERIFYING').length,
    failed: domains.filter(d => d.status === 'FAILED').length,
    expiring: domains.filter(d => {
      if (!d.ssl_expires_at) return false;
      const days = (new Date(d.ssl_expires_at) - new Date()) / (1000 * 60 * 60 * 24);
      return days <= 30 && days > 0;
    }).length,
  };

  const expiringDomains = domains.filter(d => {
    if (!d.ssl_expires_at) return false;
    const days = (new Date(d.ssl_expires_at) - new Date()) / (1000 * 60 * 60 * 24);
    return days <= 30 && days > 0;
  });

  if (error) {
    return (
      <div className="domain-container">
        <div className="domain-card" style={{ textAlign: 'center', padding: '40px', borderColor: '#fecaca' }}>
          <p style={{ color: '#dc2626', fontWeight: 500 }}>Error loading domains</p>
          <p className="domain-text-sm domain-text-muted">{typeof error === 'string' ? error : 'Something went wrong'}</p>
          <button className="domain-btn domain-btn-primary domain-mt-4" onClick={clearAllErrors}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="domain-container">
      <div className="domain-header">
        <div>
          <h1 className="domain-title">Domains</h1>
          <p className="domain-subtitle">{count} domains total</p>
        </div>
        <div className="domain-flex domain-gap-3">
          <button className="domain-btn domain-btn-secondary" onClick={handleRefresh} disabled={loading}>
            <FiRefreshCw size={16} className={loading ? 'domain-loading-spinner' : ''} style={loading ? { width: '16px', height: '16px', borderWidth: '2px' } : {}} />
            {!loading && 'Refresh'}
          </button>
          <button
            className="domain-btn domain-btn-secondary domain-btn-sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            disabled={loading}
          >
            {viewMode === 'grid' ? <FiList size={16} /> : <FiGrid size={16} />}
          </button>
          <button className="domain-btn domain-btn-primary" onClick={() => { setShowCreateModal(true); setEditingDomain(null); }} disabled={loading}>
            <FiPlus size={16} style={{ marginRight: '6px' }} /> Add Domain
          </button>
        </div>
      </div>

      <div className="domain-grid domain-grid-cols-4 domain-mb-6">
        <div className="domain-stat-card">
          <p className="domain-stat-label">Total</p>
          <p className="domain-stat-value">{stats.total}</p>
        </div>
        <div className="domain-stat-card">
          <p className="domain-stat-label">Active</p>
          <p className="domain-stat-value" style={{ color: '#22c55e' }}>{stats.active}</p>
        </div>
        <div className="domain-stat-card">
          <p className="domain-stat-label">Pending</p>
          <p className="domain-stat-value" style={{ color: '#f59e0b' }}>{stats.pending}</p>
        </div>
        <div className="domain-stat-card">
          <p className="domain-stat-label">Failed</p>
          <p className="domain-stat-value" style={{ color: '#ef4444' }}>{stats.failed}</p>
        </div>
      </div>

      {expiringDomains.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
          <p className="domain-text-sm" style={{ color: '#92400e' }}>
            <FiAlertTriangle size={16} style={{ display: 'inline', marginRight: '8px' }} />
            SSL Expiring Soon: {expiringDomains.length} domain{expiringDomains.length > 1 ? 's' : ''} ({expiringDomains.map(d => d.domain).join(', ')})
          </p>
        </div>
      )}

      {loading && domains.length === 0 ? (
        <div className="domain-loading">
          <div className="domain-loading-spinner"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="domain-grid domain-grid-cols-3">
          {domains.map((domain) => (
            <div key={domain.id} className="domain-card domain-card-hover">
              <div className="domain-flex-between domain-mb-4">
                <div>
                  <h3 className="domain-font-semibold domain-text-sm" style={{ color: '#0f172a' }}>{domain.domain}</h3>
                </div>
                <DomainStatusBadge status={domain.status} />
              </div>
              <div className="domain-space-y-2">
                <div className="domain-flex domain-gap-2">
                  <span className="domain-text-xs domain-text-muted">SSL:</span>
                  {domain.ssl_issued_at ? (
                    <span className={`domain-badge ${new Date(domain.ssl_expires_at) > new Date() ? 'domain-badge-green' : 'domain-badge-orange'}`}>
                      {new Date(domain.ssl_expires_at) > new Date() ? 'Valid' : 'Expired'}
                    </span>
                  ) : (
                    <span className="domain-badge domain-badge-gray">Not issued</span>
                  )}
                </div>
                {domain.is_primary && (
                  <div><span className="domain-badge domain-badge-yellow">Primary</span></div>
                )}
                <div className="domain-flex domain-gap-2 domain-mt-2">
                  {domain.status === 'PENDING' && (
                    <button className="domain-btn domain-btn-warning domain-btn-sm" onClick={() => handleVerify(domain.id)}>
                      <FiRefreshCw size={12} style={{ marginRight: '4px' }} /> Verify
                    </button>
                  )}
                  {domain.status === 'ACTIVE' && !domain.is_primary && (
                    <button className="domain-btn domain-btn-primary domain-btn-sm" onClick={() => handleSetPrimary(domain.id)}>
                      <FiStar size={12} style={{ marginRight: '4px' }} /> Set Primary
                    </button>
                  )}
                  <button className="domain-btn domain-btn-secondary domain-btn-sm" onClick={() => handleEdit(domain.id)}>
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DomainTable
          domains={domains}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onVerify={handleVerify}
          onSetPrimary={handleSetPrimary}
          onRenewSSL={handleRenewSSL}
          loading={loading}
        />
      )}

      {pagination.totalPages > 1 && (
        <div className="domain-pagination domain-flex-center">
          <button
            className={`domain-pagination-btn ${pagination.page <= 1 ? 'domain-pagination-btn-disabled' : ''}`}
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
                className={`domain-pagination-btn ${pageNum === pagination.page ? 'domain-pagination-btn-active' : ''}`}
                onClick={() => handlePageChange(pageNum)}
                disabled={loading}
              >
                {pageNum}
              </button>
            );
          })}
          {pagination.totalPages > 5 && (
            <span className="domain-pagination-info">...</span>
          )}
          <button
            className={`domain-pagination-btn ${pagination.page >= pagination.totalPages ? 'domain-pagination-btn-disabled' : ''}`}
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
          >
            Next
          </button>
          <span className="domain-pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>
      )}

      {showCreateModal && (
        <div className="domain-modal-overlay" onClick={() => { setShowCreateModal(false); setEditingDomain(null); }}>
          <div className="domain-modal" onClick={(e) => e.stopPropagation()}>
            <div className="domain-modal-header">
              <h3 className="domain-modal-title">{editingDomain ? 'Edit Domain' : 'Add Domain'}</h3>
              <button className="domain-modal-close" onClick={() => { setShowCreateModal(false); setEditingDomain(null); }}>
                <FiX size={20} />
              </button>
            </div>
            <DomainForm
              domainId={editingDomain}
              organizationId={organizationId}
              onSuccess={handleCreateSuccess}
              onCancel={() => { setShowCreateModal(false); setEditingDomain(null); }}
            />
          </div>
        </div>
      )}

      {showVerifyModal && selectedDomainId && (
        <DomainVerifyModal
          domain={domains.find(d => d.id === selectedDomainId)}
          onClose={() => { setShowVerifyModal(false); setSelectedDomainId(null); }}
          onSuccess={handleVerifySuccess}
        />
      )}
    </div>
  );
};

export default DomainList;