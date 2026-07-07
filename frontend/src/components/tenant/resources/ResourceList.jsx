// components/tenant/resources/ResourceList.jsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  FiRefreshCw, FiPlus, FiGrid, FiList, FiX, FiTrash2,
  FiZap, FiAlertCircle, FiCheckCircle, FiAlertTriangle,
  FiDatabase, FiActivity
} from 'react-icons/fi';
import { useResources } from '../../../hooks/tenant';
import ResourceCard from './ResourceCard';
import ResourceUsageGauge from './ResourceUsageGauge';
import ResourceStatusBadge from './ResourceStatusBadge';
import ResourceResetModal from './ResourceResetModal';

// Health indicator mapping
const HEALTH_CONFIG = {
  healthy:  { icon: FiCheckCircle,   color: '#22c55e', label: 'Healthy' },
  warning:  { icon: FiAlertTriangle, color: '#f59e0b', label: 'Warning' },
  critical: { icon: FiAlertCircle,   color: '#ef4444', label: 'Critical' },
  no_data:  { icon: FiDatabase,      color: '#94a3b8', label: 'No Data' },
};

const ResourceList = ({ organizationId }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resetTargetResource, setResetTargetResource] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  const {
    resources,
    loading,
    error,
    pagination,
    filters,
    count,
    // Enterprise state
    summary,
    exceededList,
    overallHealth,
    syncResult,
    // Base actions
    fetchList,
    remove,
    resetAllDaily,
    updateFilters,
    resetAllFilters,
    updatePagination,
    clearAllErrors,
    // Enterprise actions
    increment,
    decrement,
    snapshot,
    fetchSummary,
    fetchExceeded,
    syncFromBilling,
  } = useResources({
    autoFetch: true,
    filters: organizationId ? { organization_id: organizationId } : {},
  });

  // Fetch summary + exceeded on mount when organizationId is available
  useEffect(() => {
    if (organizationId) {
      fetchSummary(organizationId).catch(() => {});
      fetchExceeded().catch(() => {});
    }
  }, [organizationId, fetchSummary, fetchExceeded]);

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

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await remove(id);
        fetchList();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  }, [remove, fetchList]);

  const handleResetAll = useCallback(async () => {
    if (window.confirm('Reset all daily limits for this organization?')) {
      try {
        await resetAllDaily();
        fetchList();
      } catch (err) {
        console.error('Reset all failed:', err);
      }
    }
  }, [resetAllDaily, fetchList]);

  const handleRefresh = useCallback(() => {
    fetchList();
    if (organizationId) {
      fetchSummary(organizationId).catch(() => {});
      fetchExceeded().catch(() => {});
    }
  }, [fetchList, fetchSummary, fetchExceeded, organizationId]);

  const handleSyncFromBilling = useCallback(async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      await syncFromBilling(organizationId || null);
      setSyncMessage({ type: 'success', text: 'Resources synced from billing successfully.' });
      fetchList();
    } catch (err) {
      setSyncMessage({ type: 'error', text: err?.message || 'Sync failed.' });
    } finally {
      setSyncing(false);
    }
  }, [syncFromBilling, organizationId, fetchList]);

  const handleIncrement = useCallback(async (id, amount = 1) => {
    try {
      await increment(id, amount);
    } catch (err) {
      console.error('Increment failed:', err);
    }
  }, [increment]);

  const handleDecrement = useCallback(async (id, amount = 1) => {
    try {
      await decrement(id, amount);
    } catch (err) {
      console.error('Decrement failed:', err);
    }
  }, [decrement]);

  const handleSnapshot = useCallback(async (id) => {
    try {
      await snapshot(id, 'manual');
    } catch (err) {
      console.error('Snapshot failed:', err);
    }
  }, [snapshot]);

  // Use summary for richer stats when available, fallback to local resource list
  const stats = summary.length > 0
    ? {
        total: summary.length,
        exceeded: summary.filter(s => s.is_exceeded).length,
        warning: summary.filter(s => s.is_warning && !s.is_exceeded).length,
        healthy: summary.filter(s => !s.is_exceeded && !s.is_warning).length,
      }
    : {
        total: count || 0,
        exceeded: resources.filter(r => r.is_exceeded).length,
        warning: resources.filter(r => r.is_warning && !r.is_exceeded).length,
        healthy: resources.filter(r => !r.is_exceeded && !r.is_warning).length,
      };

  const healthCfg = HEALTH_CONFIG[overallHealth] || HEALTH_CONFIG.no_data;
  const HealthIcon = healthCfg.icon;

  if (error) {
    return (
      <div className="resource-container">
        <div className="resource-card" style={{ textAlign: 'center', padding: '40px', borderColor: '#fecaca' }}>
          <p style={{ color: '#dc2626', fontWeight: 500 }}>Error loading resources</p>
          <p className="resource-text-sm resource-text-muted">{typeof error === 'string' ? error : 'Something went wrong'}</p>
          <button className="resource-btn resource-btn-primary resource-mt-4" onClick={clearAllErrors}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="resource-container">
      {/* Header */}
      <div className="resource-header">
        <div>
          <div className="resource-flex resource-gap-2" style={{ alignItems: 'center' }}>
            <h1 className="resource-title">Resources</h1>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '12px', fontWeight: 600, color: healthCfg.color,
              background: `${healthCfg.color}18`, padding: '2px 8px', borderRadius: '99px'
            }}>
              <HealthIcon size={12} /> {healthCfg.label}
            </span>
          </div>
          <p className="resource-subtitle">{count} resources tracked</p>
        </div>
        <div className="resource-flex resource-gap-3" style={{ flexWrap: 'wrap' }}>
          <button className="resource-btn resource-btn-secondary" onClick={handleRefresh} disabled={loading}>
            <FiRefreshCw size={16} className={loading ? 'resource-loading-spinner' : ''} />
            {!loading && 'Refresh'}
          </button>
          <button
            className="resource-btn resource-btn-secondary resource-btn-sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            disabled={loading}
          >
            {viewMode === 'grid' ? <FiList size={16} /> : <FiGrid size={16} />}
          </button>
          <button
            className="resource-btn resource-btn-secondary"
            onClick={handleSyncFromBilling}
            disabled={loading || syncing}
            title="Sync limits from billing system"
          >
            <FiDatabase size={16} style={{ marginRight: '6px' }} />
            {syncing ? 'Syncing...' : 'Sync Billing'}
          </button>
          <button className="resource-btn resource-btn-warning" onClick={handleResetAll} disabled={loading}>
            <FiRefreshCw size={16} style={{ marginRight: '6px' }} />
            Reset Daily Limits
          </button>
        </div>
      </div>

      {/* Sync feedback */}
      {syncMessage && (
        <div style={{
          padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
          background: syncMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: syncMessage.type === 'success' ? '#166534' : '#991b1b',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {syncMessage.type === 'success' ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
          {syncMessage.text}
          <button onClick={() => setSyncMessage(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* Exceeded resources alert strip */}
      {exceededList.length > 0 && (
        <div style={{
          background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'
        }}>
          <FiAlertCircle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: '#991b1b', fontWeight: 500 }}>
            {exceededList.length} resource{exceededList.length > 1 ? 's have' : ' has'} exceeded limit:
          </span>
          <span style={{ fontSize: '13px', color: '#991b1b' }}>
            {exceededList.map(r => r.resource_type_display || r.resource_type).join(', ')}
          </span>
        </div>
      )}

      {/* Stats row */}
      <div className="resource-grid resource-grid-cols-4 resource-mb-6">
        <div className="resource-stat-card">
          <p className="resource-stat-label">Total Resources</p>
          <p className="resource-stat-value">{stats.total}</p>
        </div>
        <div className="resource-stat-card">
          <p className="resource-stat-label">Exceeded</p>
          <p className="resource-stat-value" style={{ color: '#ef4444' }}>{stats.exceeded}</p>
        </div>
        <div className="resource-stat-card">
          <p className="resource-stat-label">Warning</p>
          <p className="resource-stat-value" style={{ color: '#f59e0b' }}>{stats.warning}</p>
        </div>
        <div className="resource-stat-card">
          <p className="resource-stat-label">Healthy</p>
          <p className="resource-stat-value" style={{ color: '#22c55e' }}>{stats.healthy}</p>
        </div>
      </div>

      {/* Filters */}
      {filters && (
        <div className="resource-flex resource-gap-3 resource-mb-4" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="resource-select"
            value={filters.resource_type || ''}
            onChange={(e) => handleFilterChange({ resource_type: e.target.value || null })}
            disabled={loading}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
          >
            <option value="">All Types</option>
            {['USERS', 'STORAGE_MB', 'API_CALLS_PER_DAY', 'DEPARTMENTS', 'CONCURRENT_SESSIONS', 'KPIS'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            className="resource-select"
            value={filters.is_exceeded === true ? 'true' : filters.is_exceeded === false ? 'false' : ''}
            onChange={(e) => handleFilterChange({ is_exceeded: e.target.value === '' ? null : e.target.value === 'true' })}
            disabled={loading}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
          >
            <option value="">Any Status</option>
            <option value="true">Exceeded Only</option>
            <option value="false">Not Exceeded</option>
          </select>
          {(filters.resource_type || filters.is_exceeded !== null) && (
            <button className="resource-btn resource-btn-secondary resource-btn-sm" onClick={handleResetFilters} disabled={loading}>
              <FiX size={14} style={{ marginRight: '4px' }} /> Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Resource list */}
      {loading && resources.length === 0 ? (
        <div className="resource-loading">
          <div className="resource-loading-spinner"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="resource-grid resource-grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onReset={(id) => setResetTargetResource(resources.find(r => r.id === id))}
              onEdit={(id) => { setEditingResource(id); setShowCreateModal(true); }}
              onDelete={handleDelete}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              loading={loading}
            />
          ))}
        </div>
      ) : (
        <div className="resource-card" style={{ overflowX: 'auto' }}>
          <table className="resource-table">
            <thead className="resource-table-head">
              <tr>
                <th>Resource</th>
                <th>Usage</th>
                <th>Soft Limit</th>
                <th>Hard Limit</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Burst</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="resource-table-body">
              {resources.map((resource) => (
                <tr key={resource.id}>
                  <td>
                    <div className="resource-font-semibold resource-text-sm" style={{ color: '#0f172a' }}>
                      {resource.resource_type_display || resource.resource_type}
                    </div>
                  </td>
                  <td className="resource-text-sm" style={{ color: '#0f172a' }}>{resource.current_value || 0}</td>
                  <td className="resource-text-sm" style={{ color: '#92400e' }}>
                    {resource.soft_limit ?? resource.limit_value ?? 0}
                  </td>
                  <td className="resource-text-sm" style={{ color: '#991b1b' }}>
                    {resource.hard_limit ?? '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(resource.percentage_used || 0, 100)}%`,
                          height: '100%',
                          background: resource.is_exceeded ? '#ef4444' : resource.is_warning ? '#f59e0b' : '#22c55e',
                          borderRadius: '3px', transition: 'width 0.3s ease',
                        }} />
                      </div>
                      <span className="resource-text-sm" style={{ color: '#0f172a', minWidth: '40px' }}>
                        {Math.round(resource.percentage_used || 0)}%
                      </span>
                    </div>
                  </td>
                  <td><ResourceStatusBadge resource={resource} /></td>
                  <td>
                    {resource.burst_allowed && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: '#7c3aed', background: '#ede9fe', padding: '2px 6px', borderRadius: '4px' }}>
                        <FiZap size={10} /> Yes
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="resource-flex resource-gap-2" style={{ justifyContent: 'center' }}>
                      <button
                        className="resource-btn resource-btn-secondary resource-btn-sm"
                        onClick={() => handleDecrement(resource.id, 1)}
                        disabled={loading}
                        title="Decrement -1"
                      >−1</button>
                      <button
                        className="resource-btn resource-btn-secondary resource-btn-sm"
                        onClick={() => handleIncrement(resource.id, 1)}
                        disabled={loading}
                        title="Increment +1"
                      >+1</button>
                      <button
                        className="resource-btn resource-btn-primary resource-btn-sm"
                        onClick={() => setResetTargetResource(resource)}
                        disabled={loading}
                        title="Reset"
                      >
                        <FiRefreshCw size={14} />
                      </button>
                      <button
                        className="resource-btn resource-btn-secondary resource-btn-sm"
                        onClick={() => handleSnapshot(resource.id)}
                        disabled={loading}
                        title="Take snapshot"
                      >
                        <FiActivity size={14} />
                      </button>
                      <button
                        className="resource-btn resource-btn-danger resource-btn-sm"
                        onClick={() => handleDelete(resource.id)}
                        disabled={loading}
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="resource-pagination resource-flex-center">
          <button
            className={`resource-pagination-btn ${pagination.page <= 1 ? 'resource-pagination-btn-disabled' : ''}`}
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
                className={`resource-pagination-btn ${pageNum === pagination.page ? 'resource-pagination-btn-active' : ''}`}
                onClick={() => handlePageChange(pageNum)}
                disabled={loading}
              >
                {pageNum}
              </button>
            );
          })}
          {pagination.totalPages > 5 && (
            <span className="resource-pagination-info">...</span>
          )}
          <button
            className={`resource-pagination-btn ${pagination.page >= pagination.totalPages ? 'resource-pagination-btn-disabled' : ''}`}
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
          >
            Next
          </button>
          <span className="resource-pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>
      )}

      {/* Reset modal */}
      {resetTargetResource && (
        <ResourceResetModal
          resource={resetTargetResource}
          onClose={() => setResetTargetResource(null)}
          onSuccess={() => { fetchList(); setResetTargetResource(null); }}
        />
      )}
    </div>
  );
};

export default ResourceList;