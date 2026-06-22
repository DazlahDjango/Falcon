// src/components/reviews/final-ratings/list/FinalRatingList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid, List, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { useFinalRating } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar, ReviewStatusBadge } from '../../common';
import FinalRatingTable from './FinalRatingTable';
import FinalRatingFilters from './FinalRatingFilters';

const FinalRatingList = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchAll, pagination, setPagination, filters, setFilters, clearFilters } = useFinalRating();
  const [viewMode, setViewMode] = useState('table');

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

  const handleView = (id) => {
    navigate(`/reviews/final-ratings/${id}`);
  };

  if (loading && !data.length) return <ReviewLoading size="lg" text="Loading final ratings..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchAll()} />;

  return (
    <div className="final-rating-list">
      <div className="final-rating-list-header">
        <div className="final-rating-list-title-section">
          <h1 className="final-rating-list-title">Final Ratings</h1>
          <span className="final-rating-list-count">{pagination.totalItems} ratings</span>
        </div>
        <div className="final-rating-list-actions">
          <div className="final-rating-list-view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              aria-label="Table view"
            >
              <Grid size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="final-rating-list-toolbar">
        <ReviewSearchBar
          placeholder="Search final ratings..."
          onSearch={handleSearch}
          className="final-rating-search"
        />
        <FinalRatingFilters onFilterChange={handleFilterChange} onClearAll={handleClearFilters} />
      </div>

      {data.length === 0 ? (
        <ReviewEmptyState
          title="No Final Ratings Found"
          description="No final ratings are available."
          icon="⭐"
        />
      ) : (
        <>
          <FinalRatingTable data={data} onView={handleView} />
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

export default FinalRatingList;