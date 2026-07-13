// components/tenant/connections/ConnectionList.jsx
import React, { useState, useCallback } from 'react';
import { 
  FiRefreshCw, FiGrid, FiList, FiX, FiZap, FiClock, FiAlertCircle, 
  FiPower, FiEye, FiPlay, FiPause, FiCpu, FiActivity, FiAlertTriangle, FiTerminal 
} from 'react-icons/fi';
import { useConnections } from '../../../hooks/tenant';
import ConnectionTable from './ConnectionTable';
import ConnectionMetrics from './ConnectionMetrics';
import ConnectionStatusBadge from './ConnectionStatusBadge';

const ConnectionList = ({ organizationId }) => {
  const [viewMode, setViewMode] = useState('table');
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);

  const {
    connections,
    loading,
    error,
    pagination,
    filters,
    count,
    fetchList,
    remove,
    close,
    fetchStatus,
    executeAction,
    updateFilters,
    resetAllFilters,
    updatePagination,
    clearAllErrors,
    pause,
    resume,
    fetchDebug,
    debugTraces,
    debugLoading,
  } = useConnections({ 
    autoFetch: true, 
    filters: organizationId ? { organization_id: organizationId } : {} 
  });

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
    const conn = connections.find(c => c.id === id);
    setSelectedConnection(conn);
    setShowDetailModal(true);
  }, [connections]);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this connection record?')) {
      try {
        await remove(id);
        fetchList();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  }, [remove, fetchList]);

  const handleClose = useCallback(async (id) => {
    if (window.confirm('Close this connection?')) {
      try {
        await close(id);
        fetchList();
      } catch (err) {
        console.error('Close failed:', err);
      }
    }
  }, [close, fetchList]);

  const handleStatus = useCallback(async (id) => {
    try {
      await fetchStatus(id);
      fetchList();
    } catch (err) {
      console.error('Status check failed:', err);
    }
  }, [fetchStatus, fetchList]);

  const handlePause = useCallback(async (orgId) => {
    if (window.confirm(`Pause database connections for organization/tenant ${orgId}?`)) {
      try {
        await pause(orgId);
        alert('Connections paused for this tenant.');
        fetchList();
      } catch (err) {
        alert(`Pause failed: ${err.message || err}`);
      }
    }
  }, [pause, fetchList]);

  const handleResume = useCallback(async (orgId) => {
    try {
      await resume(orgId);
      alert('Connections resumed for this tenant.');
      fetchList();
    } catch (err) {
      alert(`Resume failed: ${err.message || err}`);
    }
  }, [resume, fetchList]);

  const handleSystemAction = useCallback(async (action) => {
    const actionNames = {
      recycle: 'Recycle all active connections',
      close_all_idle: 'Close all idle connections in the pool',
      prewarm: 'Pre-warm connections for all active tenants',
      drain: 'Gracefully drain all database connections (Enter Maintenance Mode)'
    };
    if (window.confirm(`Are you sure you want to trigger: ${actionNames[action]}?`)) {
      try {
        const res = await executeAction({ action });
        alert(res?.message || 'Action executed successfully!');
        fetchList();
      } catch (err) {
        alert(`System action failed: ${err.message || err}`);
      }
    }
  }, [executeAction, fetchList]);

  const handleViewDebugTraces = useCallback(async () => {
    try {
      await fetchDebug();
      setShowDebugModal(true);
    } catch (err) {
      alert(`Failed to fetch stack traces: ${err.message || err}`);
    }
  }, [fetchDebug]);

  const handleRefresh = useCallback(() => {
    fetchList();
  }, [fetchList]);

  const stats = {
    total: count || 0,
    active: connections.filter(c => c.status === 'ACTIVE').length,
    idle: connections.filter(c => c.status === 'IDLE').length,
    error: connections.filter(c => c.status === 'ERROR').length,
    closed: connections.filter(c => c.status === 'CLOSED').length,
  };

  if (error) {
    return (
      <div className="connection-container">
        <div className="connection-card" style={{ textAlign: 'center', padding: '40px', borderColor: '#fecaca' }}>
          <p style={{ color: '#dc2626', fontWeight: 500 }}>Error loading connections</p>
          <p className="connection-text-sm connection-text-muted">{typeof error === 'string' ? error : 'Something went wrong'}</p>
          <button className="connection-btn connection-btn-primary connection-mt-4" onClick={clearAllErrors}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="connection-container">
      {/* Header */}
      <div className="connection-header">
        <div>
          <h1 className="connection-title">Database Connection Manager</h1>
          <p className="connection-subtitle">Enterprise-grade multi-tenant connection pooling & health monitoring</p>
        </div>
        <div className="connection-flex connection-gap-3">
          <button className="connection-btn connection-btn-secondary" onClick={handleRefresh} disabled={loading}>
            <FiRefreshCw size={16} className={loading ? 'connection-loading-spinner' : ''} style={loading ? { width: '16px', height: '16px', borderWidth: '2px' } : {}} />
            {!loading && 'Refresh'}
          </button>
          <button
            className="connection-btn connection-btn-secondary connection-btn-sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            disabled={loading}
          >
            {viewMode === 'grid' ? <FiList size={16} /> : <FiGrid size={16} />}
          </button>
        </div>
      </div>

      {/* Connection Metrics Dashboard */}
      <ConnectionMetrics organizationId={organizationId} onRefresh={fetchList} />

      {/* System Administrator Actions */}
      <div className="connection-card connection-mb-6" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
        <h4 className="connection-font-semibold connection-text-sm connection-mb-3" style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCpu style={{ color: '#4f46e5' }} />
          System Maintenance & Orchestration Panel
        </h4>
        <div className="connection-flex connection-gap-3" style={{ flexWrap: 'wrap' }}>
          <button className="connection-btn connection-btn-primary connection-btn-sm" onClick={() => handleSystemAction('prewarm')} disabled={loading}>
            <FiZap size={14} style={{ marginRight: '4px' }} /> Pre-Warm Pool
          </button>
          <button className="connection-btn connection-btn-warning connection-btn-sm" onClick={() => handleSystemAction('close_all_idle')} disabled={loading}>
            <FiClock size={14} style={{ marginRight: '4px' }} /> Purge Idle Sessions
          </button>
          <button className="connection-btn connection-btn-secondary connection-btn-sm" onClick={() => handleSystemAction('recycle')} disabled={loading}>
            <FiRefreshCw size={14} style={{ marginRight: '4px' }} /> Recycle Pool
          </button>
          <button className="connection-btn connection-btn-danger connection-btn-sm" onClick={() => handleSystemAction('drain')} disabled={loading}>
            <FiAlertCircle size={14} style={{ marginRight: '4px' }} /> Graceful Drain Pool
          </button>
          <button className="connection-btn connection-btn-secondary connection-btn-sm" onClick={handleViewDebugTraces} disabled={loading || debugLoading} style={{ background: '#0f172a', color: '#38bdf8' }}>
            <FiTerminal size={14} style={{ marginRight: '4px' }} /> View Stack Traces
          </button>
        </div>
      </div>

      <div className="connection-divider"></div>

      {/* Content Table / Grid */}
      {loading && connections.length === 0 ? (
        <div className="connection-loading">
          <div className="connection-loading-spinner"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="connection-grid connection-grid-cols-2">
          {connections.map((conn) => (
            <div key={conn.id} className="connection-card connection-card-hover">
              <div className="connection-flex-between connection-mb-4">
                <div>
                  <h3 className="connection-font-semibold connection-text-xs" style={{ color: '#0f172a', fontFamily: 'monospace' }}>
                    {conn.connection_id || conn.id?.slice(0, 8)}
                  </h3>
                  <p className="connection-text-xs connection-text-muted">{conn.database_name || 'default'}</p>
                </div>
                <ConnectionStatusBadge status={conn.status} />
              </div>
              <div className="connection-space-y-2">
                <div className="connection-flex connection-gap-2">
                  <span className="connection-text-xs connection-text-muted">Organization:</span>
                  <span className="connection-text-sm" style={{ color: '#0f172a', fontWeight: 500 }}>{conn.organization_name || conn.organization || 'N/A'}</span>
                </div>
                <div className="connection-flex connection-gap-2">
                  <span className="connection-text-xs connection-text-muted">Schema:</span>
                  <span className="connection-text-sm" style={{ color: '#0f172a' }}>{conn.schema_name || 'N/A'}</span>
                </div>
                <div className="connection-flex connection-gap-2">
                  <span className="connection-text-xs connection-text-muted">Last Used:</span>
                  <span className="connection-text-sm" style={{ color: '#0f172a' }}>
                    {conn.last_used_at ? new Date(conn.last_used_at).toLocaleString() : 'Never'}
                  </span>
                </div>
                <div className="connection-flex connection-gap-2 connection-mt-4" style={{ flexWrap: 'wrap' }}>
                  {(conn.status === 'ACTIVE' || conn.status === 'IDLE') && (
                    <button className="connection-btn connection-btn-warning connection-btn-sm" onClick={() => handleClose(conn.id)}>
                      <FiPower size={12} style={{ marginRight: '4px' }} /> Close
                    </button>
                  )}
                  <button className="connection-btn connection-btn-secondary connection-btn-sm" onClick={() => handleView(conn.id)}>
                    <FiEye size={12} style={{ marginRight: '4px' }} /> Details
                  </button>
                  <button className="connection-btn connection-btn-secondary connection-btn-sm" onClick={() => handlePause(conn.organization)} style={{ background: '#fee2e2', color: '#991b1b' }}>
                    <FiPause size={12} style={{ marginRight: '4px' }} /> Pause
                  </button>
                  <button className="connection-btn connection-btn-secondary connection-btn-sm" onClick={() => handleResume(conn.organization)} style={{ background: '#dcfce7', color: '#166534' }}>
                    <FiPlay size={12} style={{ marginRight: '4px' }} /> Resume
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ConnectionTable
          connections={connections}
          onView={handleView}
          onEdit={() => {}}
          onDelete={handleDelete}
          onClose={handleClose}
          onStatus={handleStatus}
          onPause={handlePause}
          onResume={handleResume}
          loading={loading}
        />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="connection-pagination connection-flex-center">
          <button
            className={`connection-pagination-btn ${pagination.page <= 1 ? 'connection-pagination-btn-disabled' : ''}`}
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
                className={`connection-pagination-btn ${pageNum === pagination.page ? 'connection-pagination-btn-active' : ''}`}
                onClick={() => handlePageChange(pageNum)}
                disabled={loading}
              >
                {pageNum}
              </button>
            );
          })}
          {pagination.totalPages > 5 && (
            <span className="connection-pagination-info">...</span>
          )}
          <button
            className={`connection-pagination-btn ${pagination.page >= pagination.totalPages ? 'connection-pagination-btn-disabled' : ''}`}
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
          >
            Next
          </button>
          <span className="connection-pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>
      )}

      {/* Details Modal */}
      {showDetailModal && selectedConnection && (
        <div className="connection-modal-overlay" onClick={() => { setShowDetailModal(false); setSelectedConnection(null); }}>
          <div className="connection-modal" onClick={(e) => e.stopPropagation()}>
            <div className="connection-modal-header">
              <h3 className="connection-modal-title">Connection details</h3>
              <button className="connection-modal-close" onClick={() => { setShowDetailModal(false); setSelectedConnection(null); }}>
                <FiX size={20} />
              </button>
            </div>
            <div className="connection-space-y-4">
              <div className="connection-grid connection-grid-cols-2 connection-gap-4">
                <div>
                  <p className="connection-text-xs connection-text-muted">Connection ID</p>
                  <p className="connection-text-sm" style={{ color: '#0f172a', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {selectedConnection.connection_id || selectedConnection.id}
                  </p>
                </div>
                <div>
                  <p className="connection-text-xs connection-text-muted">Status</p>
                  <ConnectionStatusBadge status={selectedConnection.status} />
                </div>
                <div>
                  <p className="connection-text-xs connection-text-muted">Organization ID</p>
                  <p className="connection-text-sm" style={{ color: '#0f172a' }}>{selectedConnection.organization}</p>
                </div>
                <div>
                  <p className="connection-text-xs connection-text-muted">Database Name</p>
                  <p className="connection-text-sm" style={{ color: '#0f172a' }}>{selectedConnection.database_name || 'default'}</p>
                </div>
                <div>
                  <p className="connection-text-xs connection-text-muted">Schema / Search Path</p>
                  <p className="connection-text-sm" style={{ color: '#0f172a' }}>{selectedConnection.schema_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="connection-text-xs connection-text-muted">Connected At</p>
                  <p className="connection-text-sm" style={{ color: '#0f172a' }}>
                    {selectedConnection.connected_at ? new Date(selectedConnection.connected_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="connection-text-xs connection-text-muted">Last Used At</p>
                  <p className="connection-text-sm" style={{ color: '#0f172a' }}>
                    {selectedConnection.last_used_at ? new Date(selectedConnection.last_used_at).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
              {selectedConnection.error_message && (
                <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '8px' }}>
                  <p className="connection-text-xs connection-text-muted">Error Details</p>
                  <p className="connection-text-sm" style={{ color: '#991b1b' }}>{selectedConnection.error_message}</p>
                </div>
              )}
              <div className="connection-divider"></div>
              <div className="connection-flex connection-gap-3" style={{ justifyContent: 'flex-end' }}>
                {(selectedConnection.status === 'ACTIVE' || selectedConnection.status === 'IDLE') && (
                  <button className="connection-btn connection-btn-warning" onClick={() => { handleClose(selectedConnection.id); setShowDetailModal(false); }}>
                    <FiPower size={14} style={{ marginRight: '6px' }} /> Close Connection
                  </button>
                )}
                <button className="connection-btn connection-btn-secondary" onClick={() => { setShowDetailModal(false); setSelectedConnection(null); }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Stack Traces Modal */}
      {showDebugModal && (
        <div className="connection-modal-overlay" onClick={() => setShowDebugModal(false)}>
          <div className="connection-modal" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="connection-modal-header">
              <h3 className="connection-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiTerminal style={{ color: '#0ea5e9' }} />
                Active Database Connections Stack Traces
              </h3>
              <button className="connection-modal-close" onClick={() => setShowDebugModal(false)}>
                <FiX size={20} />
              </button>
            </div>
            <div className="connection-space-y-4">
              <p className="connection-text-xs connection-text-muted">
                Showing call stack traces of active tenant database connections to assist in troubleshooting memory or connection leaks.
              </p>
              <div style={{ maxHeight: '500px', overflowY: 'auto', background: '#0f172a', borderRadius: '12px', padding: '16px' }}>
                {debugTraces && Object.keys(debugTraces).length > 0 ? (
                  Object.entries(debugTraces).map(([connId, trace]) => (
                    <div key={connId} className="connection-mb-6" style={{ borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
                      <p className="connection-font-semibold" style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '12px' }}>
                        ID: {connId}
                      </p>
                      <pre style={{ color: '#cbd5e1', fontSize: '11px', fontFamily: 'Consolas, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginTop: '8px', lineHeight: 1.5 }}>
                        {trace}
                      </pre>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                    No active connections with traces found.
                  </p>
                )}
              </div>
              <div className="connection-divider"></div>
              <div className="connection-flex" style={{ justifyContent: 'flex-end' }}>
                <button className="connection-btn connection-btn-secondary" onClick={() => setShowDebugModal(false)}>
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionList;