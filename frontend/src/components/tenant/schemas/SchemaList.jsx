// components/tenant/schemas/SchemaList.jsx
import React, { useState, useCallback } from 'react';
import { FiPlus, FiRefreshCw, FiGrid, FiList, FiX } from 'react-icons/fi';
import { useSchemas } from '../../../hooks/tenant';
import SchemaTable from './SchemaTable';
import SchemaForm from './SchemaForm';
import SchemaStatusBadge from './SchemaStatusBadge';

const SchemaList = ({ organizationId, onViewSchema }) => {
  const [viewMode, setViewMode] = useState('table');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSchemaId, setSelectedSchemaId] = useState(null);
  const [editingSchema, setEditingSchema] = useState(null);

  const {
    schemas,
    loading,
    error,
    pagination,
    filters,
    count,
    fetchList,
    remove,
    provision,
    drop,
    updateStats,
    updateFilters,
    resetAllFilters,
    updatePagination,
    clearAllErrors,
  } = useSchemas({ autoFetch: true, filters: organizationId ? { organization_id: organizationId } : {} });

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
    if (onViewSchema) {
      onViewSchema(id);
    } else {
      setSelectedSchemaId(id);
    }
  }, [onViewSchema]);

  const handleEdit = useCallback((id) => {
    setEditingSchema(id);
    setShowCreateModal(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this schema?')) {
      try {
        await remove(id);
        fetchList();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  }, [remove, fetchList]);

  const handleProvision = useCallback(async (id) => {
    if (window.confirm('Provision this schema? This will create it in the database.')) {
      try {
        await provision(id);
        fetchList();
      } catch (err) {
        console.error('Provision failed:', err);
      }
    }
  }, [provision, fetchList]);

  const handleDrop = useCallback(async (id) => {
    if (window.confirm('Drop this schema? This will permanently delete it from the database.')) {
      try {
        await drop(id);
        fetchList();
      } catch (err) {
        console.error('Drop failed:', err);
      }
    }
  }, [drop, fetchList]);

  const handleUpdateStats = useCallback(async (id) => {
    try {
      await updateStats(id);
      fetchList();
    } catch (err) {
      console.error('Update stats failed:', err);
    }
  }, [updateStats, fetchList]);

  const handleCreateSuccess = useCallback(() => {
    setShowCreateModal(false);
    setEditingSchema(null);
    fetchList();
  }, [fetchList]);

  const handleRefresh = useCallback(() => {
    fetchList();
  }, [fetchList]);

  const stats = {
    total: count || 0,
    active: schemas.filter(s => s.status === 'ACTIVE').length,
    pending: schemas.filter(s => s.status === 'PENDING').length,
    failed: schemas.filter(s => s.status === 'FAILED').length,
    ready: schemas.filter(s => s.is_ready).length,
  };

  if (error) {
    return (
      <div className="schema-container">
        <div className="schema-card" style={{ textAlign: 'center', padding: '40px', borderColor: '#fecaca' }}>
          <p style={{ color: '#dc2626', fontWeight: 500 }}>Error loading schemas</p>
          <p className="schema-text-sm schema-text-muted">{typeof error === 'string' ? error : 'Something went wrong'}</p>
          <button className="schema-btn schema-btn-primary schema-mt-4" onClick={clearAllErrors}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="schema-container">
      <div className="schema-header">
        <div>
          <h1 className="schema-title">Database Schemas</h1>
          <p className="schema-subtitle">{count} schemas total</p>
        </div>
        <div className="schema-flex schema-gap-3">
          <button className="schema-btn schema-btn-secondary" onClick={handleRefresh} disabled={loading}>
            <FiRefreshCw size={16} className={loading ? 'schema-loading-spinner' : ''} style={loading ? { width: '16px', height: '16px', borderWidth: '2px' } : {}} />
            {!loading && 'Refresh'}
          </button>
          <button
            className="schema-btn schema-btn-secondary schema-btn-sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            disabled={loading}
          >
            {viewMode === 'grid' ? <FiList size={16} /> : <FiGrid size={16} />}
          </button>
          <button className="schema-btn schema-btn-primary" onClick={() => { setShowCreateModal(true); setEditingSchema(null); }} disabled={loading}>
            <FiPlus size={16} style={{ marginRight: '6px' }} /> Create Schema
          </button>
        </div>
      </div>

      <div className="schema-grid schema-grid-cols-4 schema-mb-6">
        <div className="schema-stat-card">
          <p className="schema-stat-label">Total</p>
          <p className="schema-stat-value">{stats.total}</p>
        </div>
        <div className="schema-stat-card">
          <p className="schema-stat-label">Active</p>
          <p className="schema-stat-value" style={{ color: '#22c55e' }}>{stats.active}</p>
        </div>
        <div className="schema-stat-card">
          <p className="schema-stat-label">Pending</p>
          <p className="schema-stat-value" style={{ color: '#f59e0b' }}>{stats.pending}</p>
        </div>
        <div className="schema-stat-card">
          <p className="schema-stat-label">Ready</p>
          <p className="schema-stat-value" style={{ color: '#3b82f6' }}>{stats.ready}</p>
        </div>
      </div>

      {loading && schemas.length === 0 ? (
        <div className="schema-loading">
          <div className="schema-loading-spinner"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="schema-grid schema-grid-cols-3">
          {schemas.map((schema) => (
            <div key={schema.id} className="schema-card schema-card-hover">
              <div className="schema-flex-between schema-mb-4">
                <div>
                  <h3 className="schema-font-semibold schema-text-sm" style={{ color: '#0f172a' }}>{schema.schema_name}</h3>
                  <p className="schema-text-xs schema-text-muted">{schema.organization_name || schema.organization?.name}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <SchemaStatusBadge status={schema.status} />
                  <span className="schema-badge" style={{
                    background: schema.schema_type === 'shared_schema' ? '#fecaca' :
                                schema.schema_type === 'separate_schema' ? '#bfdbfe' : '#d1d5db',
                    color: schema.schema_type === 'shared_schema' ? '#991b1b' :
                           schema.schema_type === 'separate_schema' ? '#1e40af' : '#374151',
                    fontSize: '11px',
                    padding: '2px 8px'
                  }}>
                    {schema.schema_type === 'shared_schema' ? 'Shared' :
                     schema.schema_type === 'separate_schema' ? 'Separate Schema' : 'Separate DB'}
                  </span>
                </div>
              </div>
              <div className="schema-space-y-2">
                <div className="schema-flex schema-gap-2">
                  <span className="schema-text-xs schema-text-muted">Ready:</span>
                  {schema.is_ready ? (
                    <span className="schema-badge schema-badge-green">Yes</span>
                  ) : (
                    <span className="schema-badge schema-badge-gray">No</span>
                  )}
                </div>
                <div className="schema-flex schema-gap-2">
                  <span className="schema-text-xs schema-text-muted">Tables:</span>
                  <span className="schema-text-sm" style={{ color: '#0f172a' }}>{schema.table_count || 0}</span>
                </div>
                <div className="schema-flex schema-gap-2">
                  <span className="schema-text-xs schema-text-muted">Size:</span>
                  <span className="schema-text-sm" style={{ color: '#0f172a' }}>{schema.size_mb ? `${schema.size_mb.toFixed(1)} MB` : 'N/A'}</span>
                </div>
                <div className="schema-flex schema-gap-2 schema-mt-2">
                  {schema.status === 'PENDING' && (
                    <button className="schema-btn schema-btn-success schema-btn-sm" onClick={() => handleProvision(schema.id)}>
                      <FiPlay size={12} style={{ marginRight: '4px' }} /> Provision
                    </button>
                  )}
                  {schema.status === 'ACTIVE' && (
                    <button className="schema-btn schema-btn-primary schema-btn-sm" onClick={() => handleUpdateStats(schema.id)}>
                      <FiRefreshCw size={12} style={{ marginRight: '4px' }} /> Stats
                    </button>
                  )}
                  <button className="schema-btn schema-btn-secondary schema-btn-sm" onClick={() => handleEdit(schema.id)}>
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <SchemaTable
          schemas={schemas}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onProvision={handleProvision}
          onDrop={handleDrop}
          onUpdateStats={handleUpdateStats}
          loading={loading}
        />
      )}

      {pagination.totalPages > 1 && (
        <div className="schema-pagination schema-flex-center">
          <button
            className={`schema-pagination-btn ${pagination.page <= 1 ? 'schema-pagination-btn-disabled' : ''}`}
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
                className={`schema-pagination-btn ${pageNum === pagination.page ? 'schema-pagination-btn-active' : ''}`}
                onClick={() => handlePageChange(pageNum)}
                disabled={loading}
              >
                {pageNum}
              </button>
            );
          })}
          {pagination.totalPages > 5 && (
            <span className="schema-pagination-info">...</span>
          )}
          <button
            className={`schema-pagination-btn ${pagination.page >= pagination.totalPages ? 'schema-pagination-btn-disabled' : ''}`}
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
          >
            Next
          </button>
          <span className="schema-pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>
      )}

      {showCreateModal && (
        <div className="schema-modal-overlay" onClick={() => { setShowCreateModal(false); setEditingSchema(null); }}>
          <div className="schema-modal" onClick={(e) => e.stopPropagation()}>
            <div className="schema-modal-header">
              <h3 className="schema-modal-title">{editingSchema ? 'Edit Schema' : 'Create Schema'}</h3>
              <button className="schema-modal-close" onClick={() => { setShowCreateModal(false); setEditingSchema(null); }}>
                <FiX size={20} />
              </button>
            </div>
            <SchemaForm
              schemaId={editingSchema}
              organizationId={organizationId}
              onSuccess={handleCreateSuccess}
              onCancel={() => { setShowCreateModal(false); setEditingSchema(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemaList;