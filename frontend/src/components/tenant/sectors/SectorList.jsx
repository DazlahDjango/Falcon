// components/tenant/sectors/SectorList.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { FiPlus, FiRefreshCw, FiGrid, FiList, FiX } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { useSectors } from '../../../hooks/tenant';
import { selectSectorState, selectSectors } from '../../../store/tenant/selectors/sector.selectors';
import SectorCard from './SectorCard';
import SectorTable from './SectorTable';
import SectorForm from './SectorForm';
import SectorStatusBadge from './SectorStatusBadge';

const SectorList = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSector, setEditingSector] = useState(null);
  const debugSectorState = useSelector(selectSectorState);
  const debugSectors = useSelector(selectSectors);
  const debugDirectState = useSelector((state) => state);

  const {
    sectors,
    loading,
    error,
    pagination,
    filters,
    count,
    fetchList,
    remove,
    toggleActive,
    updateFilters,
    resetAllFilters,
    updatePagination,
    clearAllErrors,
  } = useSectors({ autoFetch: true });
  console.log('🔴 SectorList rendering');
  console.log('🔴 sectors:', sectors);
  console.log('🔴 loading:', loading);
  console.log('🔴 count:', count);
  console.log('🔴 error:', error);

  useEffect(() => {
    console.log('🔍 DEBUG - Full Redux state:', debugDirectState);
    console.log('🔍 DEBUG - sector state from selector:', debugSectorState);
    console.log('🔍 DEBUG - sectors from selector:', debugSectors);
    console.log('🔍 DEBUG - sectors from hook:', sectors);
    console.log('🔍 DEBUG - Are they the same?', debugSectors === sectors);
  }, [debugDirectState, debugSectorState, debugSectors, sectors]);

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

  const handleEdit = useCallback((id) => {
    setEditingSector(id);
    setShowCreateModal(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this sector?')) {
      try {
        await remove(id);
        fetchList();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  }, [remove, fetchList]);

  const handleToggle = useCallback(async (id) => {
    try {
      await toggleActive(id);
      fetchList();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  }, [toggleActive, fetchList]);

  const handleCreateSuccess = useCallback(() => {
    setShowCreateModal(false);
    setEditingSector(null);
    fetchList();
  }, [fetchList]);

  const handleRefresh = useCallback(() => {
    fetchList();
  }, [fetchList]);

  const stats = {
    total: count || 0,
    active: sectors.filter(s => s.is_active).length,
    inactive: sectors.filter(s => !s.is_active).length,
  };
  console.log('🔴 stats:', stats);
  

  const typeStats = {};
  sectors.forEach(s => {
    typeStats[s.sector_type] = (typeStats[s.sector_type] || 0) + 1;
  });

  if (error) {
    return (
      <div className="sector-container">
        <div className="sector-card" style={{ textAlign: 'center', padding: '40px', borderColor: '#fecaca' }}>
          <p style={{ color: '#dc2626', fontWeight: 500 }}>Error loading sectors</p>
          <p className="sector-text-sm sector-text-muted">{typeof error === 'string' ? error : 'Something went wrong'}</p>
          <button className="sector-btn sector-btn-primary sector-mt-4" onClick={clearAllErrors}>Try Again</button>
        </div>
      </div>
    );
  }

  const typeLabels = {
    COMMERCIAL: 'Commercial',
    NGO: 'Non-Profit',
    PUBLIC: 'Public Sector',
    CONSULTING: 'Consulting',
  };

  return (
    <div className="sector-container">
      <div className="sector-header">
        <div>
          <h1 className="sector-title">Sectors</h1>
          <p className="sector-subtitle">{count} sectors configured</p>
        </div>
        <div className="sector-flex sector-gap-3">
          <button className="sector-btn sector-btn-secondary" onClick={handleRefresh} disabled={loading}>
            <FiRefreshCw size={16} className={loading ? 'sector-loading-spinner' : ''} style={loading ? { width: '16px', height: '16px', borderWidth: '2px' } : {}} />
            {!loading && 'Refresh'}
          </button>
          <button
            className="sector-btn sector-btn-secondary sector-btn-sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            disabled={loading}
          >
            {viewMode === 'grid' ? <FiList size={16} /> : <FiGrid size={16} />}
          </button>
          <button className="sector-btn sector-btn-primary" onClick={() => { setShowCreateModal(true); setEditingSector(null); }} disabled={loading}>
            <FiPlus size={16} style={{ marginRight: '6px' }} /> Create Sector
          </button>
        </div>
      </div>

      <div className="sector-grid sector-grid-cols-4 sector-mb-6">
        <div className="sector-stat-card">
          <p className="sector-stat-label">Total Sectors</p>
          <p className="sector-stat-value">{stats.total}</p>
        </div>
        <div className="sector-stat-card">
          <p className="sector-stat-label">Active</p>
          <p className="sector-stat-value" style={{ color: '#22c55e' }}>{stats.active}</p>
        </div>
        <div className="sector-stat-card">
          <p className="sector-stat-label">Inactive</p>
          <p className="sector-stat-value" style={{ color: '#94a3b8' }}>{stats.inactive}</p>
        </div>
        <div className="sector-stat-card">
          <p className="sector-stat-label">Types</p>
          <p className="sector-stat-value" style={{ color: '#3b82f6' }}>{Object.keys(typeStats).length}</p>
        </div>
      </div>

      {Object.keys(typeStats).length > 0 && (
        <div className="sector-flex sector-gap-3 sector-mb-6" style={{ flexWrap: 'wrap' }}>
          {Object.entries(typeStats).map(([type, count]) => (
            <span key={type} className="sector-badge" style={{ background: '#f1f5f9', color: '#475569' }}>
              {typeLabels[type] || type}: {count}
            </span>
          ))}
        </div>
      )}

      {loading && sectors.length === 0 ? (
        <div className="sector-loading">
          <div className="sector-loading-spinner"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="sector-grid sector-grid-cols-3">
          {sectors.map((sector) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
              loading={loading}
            />
          ))}
        </div>
      ) : (
        <SectorTable
          sectors={sectors}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
          loading={loading}
        />
      )}

      {pagination.totalPages > 1 && (
        <div className="sector-pagination sector-flex-center">
          <button
            className={`sector-pagination-btn ${pagination.page <= 1 ? 'sector-pagination-btn-disabled' : ''}`}
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
                className={`sector-pagination-btn ${pageNum === pagination.page ? 'sector-pagination-btn-active' : ''}`}
                onClick={() => handlePageChange(pageNum)}
                disabled={loading}
              >
                {pageNum}
              </button>
            );
          })}
          {pagination.totalPages > 5 && (
            <span className="sector-pagination-info">...</span>
          )}
          <button
            className={`sector-pagination-btn ${pagination.page >= pagination.totalPages ? 'sector-pagination-btn-disabled' : ''}`}
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
          >
            Next
          </button>
          <span className="sector-pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>
      )}

      {showCreateModal && (
        <div className="sector-modal-overlay" onClick={() => { setShowCreateModal(false); setEditingSector(null); }}>
          <div className="sector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sector-modal-header">
              <h3 className="sector-modal-title">{editingSector ? 'Edit Sector' : 'Create Sector'}</h3>
              <button className="sector-modal-close" onClick={() => { setShowCreateModal(false); setEditingSector(null); }}>
                <FiX size={20} />
              </button>
            </div>
            <SectorForm
              sectorId={editingSector}
              onSuccess={handleCreateSuccess}
              onCancel={() => { setShowCreateModal(false); setEditingSector(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorList;