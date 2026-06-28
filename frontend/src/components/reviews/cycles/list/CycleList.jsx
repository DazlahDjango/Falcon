// src/components/reviews/cycles/list/CycleList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Grid, List, Calendar, Filter } from 'lucide-react';
import { useCycles } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar, ReviewFilterBar } from '../../common';
import CycleCard from './CycleCard';
import CycleTable from './CycleTable';
import CycleFilters from './CycleFilters';

const CycleList = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchAll, pagination, setPagination, filters, setFilters, clearFilters, canManage } = useCycles();
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
    navigate('/reviews/cycles/create');
  };

  if (loading && !data.length) return <ReviewLoading size="lg" text="Loading review cycles..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchAll()} />;

  return (
    <div className="cycle-list">
      <div className="cycle-list-header">
        <div className="cycle-list-title-section">
          <h1 className="cycle-list-title">Review Cycles</h1>
          <span className="cycle-list-count">{pagination.totalItems} cycles</span>
        </div>
        <div className="cycle-list-actions">
          <div className="cycle-list-view-toggle">
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
              New Cycle
            </button>
          )}
        </div>
      </div>

      <div className="cycle-list-toolbar">
        <ReviewSearchBar
          placeholder="Search cycles..."
          onSearch={handleSearch}
          className="cycle-search"
        />
        <ReviewFilterBar
          filters={CycleFilters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearFilters}
        />
      </div>

      {data.length === 0 ? (
        <ReviewEmptyState
          title="No Review Cycles Found"
          description="Create your first review cycle to start the performance review process."
          icon="🔄"
          actionLabel="Create Cycle"
          onAction={handleCreate}
        />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="cycle-grid">
              {data.map((cycle) => (
                <CycleCard key={cycle.id} cycle={cycle} />
              ))}
            </div>
          ) : (
            <CycleTable data={data} />
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

export default CycleList;