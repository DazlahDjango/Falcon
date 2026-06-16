// src/components/reviews/promotions/list/PromotionList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Grid, List, TrendingUp } from 'lucide-react';
import { usePromotions } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar, ReviewStatusBadge } from '../../common';
import PromotionCard from './PromotionCard';
import PromotionTable from './PromotionTable';
import PromotionFilters from './PromotionFilters';

const PromotionList = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchAll, pagination, setPagination, filters, setFilters, clearFilters, canManage } = usePromotions();
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
    navigate('/reviews/promotions/create');
  };

  if (loading && !data.length) return <ReviewLoading size="lg" text="Loading promotions..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchAll()} />;

  return (
    <div className="promotion-list">
      <div className="promotion-list-header">
        <div className="promotion-list-title-section">
          <h1 className="promotion-list-title">Promotions</h1>
          <span className="promotion-list-count">{pagination.totalItems} promotions</span>
        </div>
        <div className="promotion-list-actions">
          <div className="promotion-list-view-toggle">
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
              New Promotion
            </button>
          )}
        </div>
      </div>

      <div className="promotion-list-toolbar">
        <ReviewSearchBar
          placeholder="Search promotions..."
          onSearch={handleSearch}
          className="promotion-search"
        />
        <PromotionFilters
          onFilterChange={handleFilterChange}
          onClearAll={handleClearFilters}
        />
      </div>

      {data.length === 0 ? (
        <ReviewEmptyState
          title="No Promotions Found"
          description="Create a promotion recommendation to recognize and advance employees."
          icon="🎯"
          actionLabel="Create Promotion"
          onAction={handleCreate}
        />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="promotion-grid">
              {data.map((promotion) => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
            </div>
          ) : (
            <PromotionTable data={data} />
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

export default PromotionList;