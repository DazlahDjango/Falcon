// components/tenant/migrations/MigrationList.jsx
import React, { useState, useCallback } from 'react';
import { FiRefreshCw, FiGrid, FiList, FiX, FiPlay, FiEye, FiRotateCcw, FiCode } from 'react-icons/fi';
import { useMigrations } from '../../../hooks/tenant';
import MigrationTable from './MigrationTable';
import MigrationStatusBadge from './MigrationStatusBadge';

const MigrationList = ({ organizationId }) => {
  const [viewMode, setViewMode] = useState('table');
  const [selectedMigration, setSelectedMigration] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const {
    migrations,
    loading,
    syncing,
    previewing,
    rollingBack,
    sqlPreview,
    error,
    pagination,
    filters,
    count,
    stats,
    fetchList,
    remove,
    apply,
    sync,
    preview,
    rollback,
    clearSql,
    fetchStats,
    updateFilters,
    resetAllFilters,
    updatePagination,
    clearAllErrors,
  } = useMigrations({ autoFetch: true, filters: organizationId ? { organization_id: organizationId } : {} });

  const handleFilterChange = useCallback((newFilters) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  const handleResetFilters = useCallback(() => {
    resetAllFilters();
  }, [resetAllFilters]);

  const handlePageChange = useCallback((page) => {
    updatePagination({ page });
    fetchList({ page, page_size: pagination.pageSize || 20 });
  }, [fetchList, updatePagination, pagination.pageSize]);

  const handlePageSizeChange = useCallback((pageSize) => {
    updatePagination({ pageSize, page: 1 });
    fetchList({ page: 1, pageSize, page_size: pageSize });
  }, [fetchList, updatePagination]);

  const handleView = useCallback((id) => {
    const migration = migrations.find(m => m.id === id);
    setSelectedMigration(migration);
    setShowDetailModal(true);
    clearSql();
  }, [migrations, clearSql]);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this migration record?')) {
      try {
        await remove(id);
        fetchList();
        fetchStats();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  }, [remove, fetchList, fetchStats]);

  const handleApply = useCallback(async (id) => {
    if (window.confirm('Apply this migration?')) {
      try {
        await apply(id);
        fetchList();
        fetchStats();
      } catch (err) {
        console.error('Apply failed:', err);
      }
    }
  }, [apply, fetchList, fetchStats]);

  const handleRollback = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to rollback this migration? WARNING: This will revert database changes!')) {
      try {
        await rollback(id);
        fetchList();
        fetchStats();
      } catch (err) {
        console.error('Rollback failed:', err);
      }
    }
  }, [rollback, fetchList, fetchStats]);

  const handlePreviewSql = useCallback(async (id) => {
    const migration = migrations.find(m => m.id === id);
    setSelectedMigration(migration);
    setShowDetailModal(true);
    try {
      await preview(id);
    } catch (err) {
      console.error('Preview SQL failed:', err);
    }
  }, [migrations, preview]);

  const handleRefresh = useCallback(() => {
    fetchList();
    fetchStats();
  }, [fetchList, fetchStats]);

  const statsData = stats || {
    total: 0,
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
    rolled_back: 0,
  };

  const statCards = [
    { label: 'Total', value: statsData.total || 0, color: '#3b82f6' },
    { label: 'Pending', value: statsData.pending || 0, color: '#f59e0b' },
    { label: 'Running', value: statsData.running || 0, color: '#8b5cf6' },
    { label: 'Completed', value: statsData.completed || 0, color: '#22c55e' },
    { label: 'Failed', value: statsData.failed || 0, color: '#ef4444' },
    { label: 'Rolled Back', value: statsData.rolled_back || 0, color: '#f97316' },
  ];

  if (error) {
    return (
      <div className="migration-container">
        <div className="migration-card" style={{ textAlign: 'center', padding: '40px', borderColor: '#fecaca' }}>
          <p style={{ color: '#dc2626', fontWeight: 500 }}>Error loading migrations</p>
          <p className="migration-text-sm migration-text-muted">{typeof error === 'string' ? error : 'Something went wrong'}</p>
          <button className="migration-btn migration-btn-primary migration-mt-4" onClick={clearAllErrors}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="migration-container">
      <div className="migration-header">
        <div>
          <h1 className="migration-title">Database Migrations</h1>
          <p className="migration-subtitle">{count} migration records</p>
        </div>
        <div className="migration-flex migration-gap-3">
          <button 
            className="migration-btn migration-btn-primary" 
            onClick={async () => {
              try {
                await sync(organizationId);
                handleRefresh();
              } catch (err) {
                console.error(err);
              }
            }} 
            disabled={syncing || loading}
          >
            <FiRefreshCw size={16} className={syncing ? 'migration-loading-spinner' : ''} style={{ marginRight: '6px' }} />
            {syncing ? 'Syncing...' : 'Sync Migrations'}
          </button>
          <button className="migration-btn migration-btn-secondary" onClick={handleRefresh} disabled={loading}>
            <FiRefreshCw size={16} className={loading && !syncing ? 'migration-loading-spinner' : ''} style={loading && !syncing ? { width: '16px', height: '16px', borderWidth: '2px' } : {}} />
            {!loading && 'Refresh'}
          </button>
          <button
            className="migration-btn migration-btn-secondary migration-btn-sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            disabled={loading}
          >
            {viewMode === 'grid' ? <FiList size={16} /> : <FiGrid size={16} />}
          </button>
        </div>
      </div>

      <div className="migration-grid migration-grid-cols-6 migration-mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="migration-stat-card" style={{ textAlign: 'center' }}>
            <p className="migration-stat-value" style={{ color: card.color }}>{card.value}</p>
            <p className="migration-stat-label">{card.label}</p>
          </div>
        ))}
      </div>

      {statsData.avg_execution_time_ms && (
        <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
          <p className="migration-text-sm migration-text-muted">
            Average Execution Time: <span className="migration-font-semibold" style={{ color: '#0f172a' }}>{statsData.avg_execution_time_ms}ms</span>
            {statsData.last_migration_at && (
              <span style={{ marginLeft: '16px' }}>
                Last Migration: <span className="migration-font-semibold" style={{ color: '#0f172a' }}>
                  {new Date(statsData.last_migration_at).toLocaleString()}
                </span>
              </span>
            )}
          </p>
        </div>
      )}

      {loading && migrations.length === 0 ? (
        <div className="migration-loading">
          <div className="migration-loading-spinner"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="migration-grid migration-grid-cols-2">
          {migrations.map((migration) => (
            <div key={migration.id} className="migration-card migration-card-hover">
              <div className="migration-flex-between migration-mb-4">
                <div>
                  <h3 className="migration-font-semibold migration-text-sm" style={{ color: '#0f172a' }}>
                    {migration.migration_name}
                  </h3>
                  <p className="migration-text-xs migration-text-muted">{migration.app_name}</p>
                </div>
                <MigrationStatusBadge status={migration.status} />
              </div>
              <div className="migration-space-y-2">
                <div className="migration-flex migration-gap-2">
                  <span className="migration-text-xs migration-text-muted">Started:</span>
                  <span className="migration-text-sm" style={{ color: '#0f172a' }}>
                    {migration.started_at ? new Date(migration.started_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="migration-flex migration-gap-2">
                  <span className="migration-text-xs migration-text-muted">Duration:</span>
                  <span className="migration-text-sm" style={{ color: '#0f172a' }}>
                    {migration.execution_time_ms ? `${migration.execution_time_ms}ms` : 'N/A'}
                  </span>
                </div>
                {migration.is_rollback && (
                  <div className="migration-flex migration-gap-2">
                    <span className="migration-badge migration-badge-orange">Rollback</span>
                    {migration.rolled_back_from && (
                      <span className="migration-text-xs migration-text-muted">from {migration.rolled_back_from}</span>
                    )}
                  </div>
                )}
                {migration.error_message && (
                  <div style={{ background: '#fee2e2', padding: '8px', borderRadius: '6px' }}>
                    <p className="migration-text-xs" style={{ color: '#991b1b' }}>{migration.error_message}</p>
                  </div>
                )}
                <div className="migration-flex migration-gap-2 migration-mt-2">
                  {migration.status === 'PENDING' && (
                    <button className="migration-btn migration-btn-success migration-btn-sm" onClick={() => handleApply(migration.id)}>
                      <FiPlay size={12} style={{ marginRight: '4px' }} /> Apply
                    </button>
                  )}
                  {migration.status === 'COMPLETED' && (
                    <button className="migration-btn migration-btn-sm" style={{ background: '#f97316', borderColor: '#ea580c', color: 'white' }} onClick={() => handleRollback(migration.id)}>
                      <FiRotateCcw size={12} style={{ marginRight: '4px' }} /> Rollback
                    </button>
                  )}
                  <button className="migration-btn migration-btn-secondary migration-btn-sm" onClick={() => handlePreviewSql(migration.id)}>
                    <FiCode size={12} style={{ marginRight: '4px' }} /> SQL
                  </button>
                  <button className="migration-btn migration-btn-secondary migration-btn-sm" onClick={() => handleView(migration.id)}>
                    <FiEye size={12} style={{ marginRight: '4px' }} /> View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <MigrationTable
          migrations={migrations}
          onView={handleView}
          onDelete={handleDelete}
          onApply={handleApply}
          onRollback={handleRollback}
          onPreviewSql={handlePreviewSql}
          onRefresh={() => { fetchList(); fetchStats(); }}
          loading={loading}
        />
      )}

      {migrations.length > 0 && (
        <div className="migration-pagination">
          <div className="migration-pagination-info">
            Showing {migrations.length} of {pagination.total || count || migrations.length} migrations
          </div>
          <div className="migration-pagination-controls">
            <select
              value={pagination.pageSize || 20}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="migration-pagination-select"
              disabled={loading}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <button
              className={`migration-pagination-btn ${pagination.page <= 1 ? 'migration-pagination-btn-disabled' : ''}`}
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
            >
              Previous
            </button>
            {[...Array(Math.min(pagination.totalPages || 1, 5))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  className={`migration-pagination-btn ${pageNum === pagination.page ? 'migration-pagination-btn-active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading}
                >
                  {pageNum}
                </button>
              );
            })}
            {(pagination.totalPages || 1) > 5 && (
              <span className="migration-pagination-info">...</span>
            )}
            <button
              className={`migration-pagination-btn ${pagination.page >= (pagination.totalPages || 1) ? 'migration-pagination-btn-disabled' : ''}`}
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= (pagination.totalPages || 1) || loading}
            >
              Next
            </button>
            <span className="migration-pagination-info">
              Page {pagination.page || 1} of {pagination.totalPages || 1}
            </span>
          </div>
        </div>
      )}

      {showDetailModal && selectedMigration && (
        <div className="migration-modal-overlay" onClick={() => { setShowDetailModal(false); setSelectedMigration(null); clearSql(); }}>
          <div className="migration-modal" onClick={(e) => e.stopPropagation()}>
            <div className="migration-modal-header">
              <h3 className="migration-modal-title">Migration Details</h3>
              <button className="migration-modal-close" onClick={() => { setShowDetailModal(false); setSelectedMigration(null); clearSql(); }}>
                <FiX size={20} />
              </button>
            </div>
            <div className="migration-space-y-4">
              <div className="migration-grid migration-grid-cols-2 migration-gap-4">
                <div>
                  <p className="migration-text-xs migration-text-muted">Migration Name</p>
                  <p className="migration-text-sm" style={{ color: '#0f172a', fontWeight: 500 }}>{selectedMigration.migration_name}</p>
                </div>
                <div>
                  <p className="migration-text-xs migration-text-muted">App</p>
                  <p className="migration-text-sm" style={{ color: '#0f172a' }}>{selectedMigration.app_name}</p>
                </div>
                <div>
                  <p className="migration-text-xs migration-text-muted">Status</p>
                  <MigrationStatusBadge status={selectedMigration.status} />
                </div>
                <div>
                  <p className="migration-text-xs migration-text-muted">Execution Time</p>
                  <p className="migration-text-sm" style={{ color: '#0f172a' }}>
                    {selectedMigration.execution_time_ms ? `${selectedMigration.execution_time_ms}ms` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="migration-text-xs migration-text-muted">Started At</p>
                  <p className="migration-text-sm" style={{ color: '#0f172a' }}>
                    {selectedMigration.started_at ? new Date(selectedMigration.started_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="migration-text-xs migration-text-muted">Completed At</p>
                  <p className="migration-text-sm" style={{ color: '#0f172a' }}>
                    {selectedMigration.completed_at ? new Date(selectedMigration.completed_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              {selectedMigration.is_rollback && (
                <div style={{ background: '#ffedd5', padding: '12px', borderRadius: '8px' }}>
                  <p className="migration-text-sm" style={{ color: '#9a3412' }}>
                    <FiRotateCcw size={14} style={{ display: 'inline', marginRight: '8px' }} />
                    This is a rollback migration
                    {selectedMigration.rolled_back_from && ` (from ${selectedMigration.rolled_back_from})`}
                  </p>
                </div>
              )}
              
              {selectedMigration.error_message && (
                <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '8px' }}>
                  <p className="migration-text-xs migration-text-muted">Error</p>
                  <p className="migration-text-sm" style={{ color: '#991b1b' }}>{selectedMigration.error_message}</p>
                  {selectedMigration.error_traceback && (
                    <details style={{ marginTop: '8px' }}>
                      <summary className="migration-text-xs" style={{ color: '#991b1b', cursor: 'pointer' }}>View Traceback</summary>
                      <pre style={{ background: '#f1f5f9', padding: '8px', borderRadius: '4px', fontSize: '11px', overflow: 'auto', maxHeight: '150px' }}>
                        {selectedMigration.error_traceback}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {sqlPreview && (
                <div style={{ background: '#0f172a', color: '#f8fafc', padding: '16px', borderRadius: '8px', marginTop: '12px' }}>
                  <div className="migration-flex-between" style={{ marginBottom: '8px' }}>
                    <p className="migration-text-xs" style={{ color: '#94a3b8' }}>SQL Preview (Dry-Run)</p>
                    <button 
                      className="migration-btn migration-btn-secondary migration-btn-sm" 
                      style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      onClick={clearSql}
                    >
                      Clear
                    </button>
                  </div>
                  <pre style={{ fontSize: '11px', overflowX: 'auto', maxHeight: '200px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {sqlPreview}
                  </pre>
                </div>
              )}

              <div className="migration-divider"></div>
              <div className="migration-flex migration-gap-3" style={{ justifyContent: 'flex-end' }}>
                <button 
                  className="migration-btn migration-btn-secondary" 
                  onClick={async () => {
                    try {
                      await preview(selectedMigration.id);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  disabled={previewing}
                >
                  {previewing ? 'Generating SQL...' : 'Preview SQL'}
                </button>
                {selectedMigration.status === 'PENDING' && (
                  <button className="migration-btn migration-btn-success" onClick={() => { handleApply(selectedMigration.id); setShowDetailModal(false); }}>
                    <FiPlay size={14} style={{ marginRight: '6px' }} /> Apply Migration
                  </button>
                )}
                {selectedMigration.status === 'COMPLETED' && (
                  <button className="migration-btn" style={{ background: '#f97316', borderColor: '#ea580c', color: 'white' }} onClick={() => { handleRollback(selectedMigration.id); setShowDetailModal(false); }}>
                    <FiRotateCcw size={14} style={{ marginRight: '6px' }} /> Rollback
                  </button>
                )}
                <button className="migration-btn migration-btn-secondary" onClick={() => { setShowDetailModal(false); setSelectedMigration(null); clearSql(); }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MigrationList;