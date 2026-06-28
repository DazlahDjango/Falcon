// src/components/reviews/rating-scales/list/RatingScaleList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Grid, List } from 'lucide-react';
import { useRatingScales } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar } from '../../common';
import RatingScaleCard from './RatingScaleCard';
import RatingScaleTable from './RatingScaleTable';
import RatingScaleFilters from './RatingScaleFilters';

const RatingScaleList = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchAll, pagination, setPagination, filters, setFilters, clearFilters, canManage } = useRatingScales();
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
    navigate('/reviews/rating-scales/create');
  };

  if (loading && !data.length) return <ReviewLoading size="lg" text="Loading rating scales..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchAll()} />;

  return (
    <div className="rating-scale-list">
      <div className="rating-scale-list-header">
        <div className="rating-scale-list-title-section">
          <h1 className="rating-scale-list-title">Rating Scales</h1>
          <span className="rating-scale-list-count">{pagination.totalItems} scales</span>
        </div>
        <div className="rating-scale-list-actions">
          <div className="rating-scale-list-view-toggle">
            <button className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
              <Grid size={18} />
            </button>
            <button className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>
              <List size={18} />
            </button>
          </div>
          {canManage && (
            <button className="btn btn-primary" onClick={handleCreate}>
              <Plus size={18} />
              New Rating Scale
            </button>
          )}
        </div>
      </div>

      <div className="rating-scale-list-toolbar">
        <ReviewSearchBar placeholder="Search rating scales..." onSearch={handleSearch} className="rating-scale-search" />
        <RatingScaleFilters onFilterChange={handleFilterChange} onClearAll={handleClearFilters} />
      </div>

      {data.length === 0 ? (
        <ReviewEmptyState
          title="No Rating Scales Found"
          description="Create your first rating scale to start defining performance levels."
          icon="📊"
          actionLabel="Create Rating Scale"
          onAction={handleCreate}
        />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="rating-scale-grid">
              {data.map((scale) => <RatingScaleCard key={scale.id} scale={scale} />)}
            </div>
          ) : (
            <RatingScaleTable data={data} />
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

export default RatingScaleList;