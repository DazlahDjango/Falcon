// src/components/reviews/pips/list/PIPList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Grid, List, AlertTriangle } from 'lucide-react';
import { usePIP } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar, ReviewFilterBar } from '../../common';
import PIPCard from './PIPCard';
import PIPTable from './PIPTable';
import PIPFilters from './PIPFilters';

const PIPList = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchAll, pagination, setPagination, filters, setFilters, clearFilters, canManage } = usePIP();
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchAll({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      ...filters,
    });
  }, [pagination.currentPage, pagination.pageSize, filters]);

  const handleSearch = useCallback((searchTerm) => {
    setFilters({ search: searchTerm });
  }, [setFilters]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters({ [key]: value });
  }, [setFilters]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const handlePageChange = useCallback((page) => {
    setPagination({ currentPage: page });
  }, [setPagination]);

  const handlePageSizeChange = useCallback((size) => {
    setPagination({ pageSize: size, currentPage: 1 });
  }, [setPagination]);

  const handleCreate = () => {
    navigate('/reviews/pips/create');
  };

  if (loading && !data.length) return <ReviewLoading size="lg" text="Loading PIPs..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchAll()} />;

  return (
    <div className="pip-list">
      <div className="pip-list-header">
        <div className="pip-list-title-section">
          <h1 className="pip-list-title">Performance Improvement Plans</h1>
          <span className="pip-list-count">{pagination.totalItems} PIPs</span>
        </div>
        <div className="pip-list-actions">
          <div className="pip-list-view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <Grid size={18} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              aria-label="Table view"
            >
              <List size={18} />
            </button>
          </div>
          {canManage && (
            <button className="btn btn-primary" onClick={handleCreate}>
              <Plus size={18} />
              New PIP
            </button>
          )}
        </div>
      </div>

      <div className="pip-list-toolbar">
        <ReviewSearchBar
          placeholder="Search PIPs..."
          onSearch={handleSearch}
          className="pip-search"
        />
        <ReviewFilterBar
          filters={PIPFilters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearFilters}
        />
      </div>

      {data.length === 0 ? (
        <ReviewEmptyState
          title="No PIPs Found"
          description="Create a Performance Improvement Plan to help employees improve performance."
          icon="📋"
          actionLabel="Create PIP"
          onAction={handleCreate}
        />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="pip-grid">
              {data.map((pip) => (
                <PIPCard key={pip.id} pip={pip} />
              ))}
            </div>
          ) : (
            <PIPTable data={data} />
          )}
          <ReviewPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
};

export default PIPList;