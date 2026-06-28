// src/components/reviews/competencies/list/CompetencyList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Grid, List, Filter } from 'lucide-react';
import { useCompetencies } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar, ReviewStatusBadge } from '../../common';
import CompetencyCard from './CompetencyCard';
import CompetencyTable from './CompetencyTable';
import CompetencyFilters from './CompetencyFilters';

const CompetencyList = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchAll, pagination, setPagination, filters, setFilters, clearFilters, canManage } = useCompetencies();
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
    navigate('/reviews/competencies/create');
  };

  if (loading && !data.length) return <ReviewLoading size="lg" text="Loading competencies..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchAll()} />;

  return (
    <div className="competency-list">
      <div className="competency-list-header">
        <div className="competency-list-title-section">
          <h1 className="competency-list-title">Competencies</h1>
          <span className="competency-list-count">{pagination.totalItems} competencies</span>
        </div>
        <div className="competency-list-actions">
          <div className="competency-list-view-toggle">
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
              New Competency
            </button>
          )}
        </div>
      </div>

      <div className="competency-list-toolbar">
        <ReviewSearchBar
          placeholder="Search competencies..."
          onSearch={handleSearch}
          className="competency-search"
        />
        <CompetencyFilters
          onFilterChange={handleFilterChange}
          onClearAll={handleClearFilters}
        />
      </div>

      {data.length === 0 ? (
        <ReviewEmptyState
          title="No Competencies Found"
          description="Create a competency to define skills and behaviors for evaluation."
          icon="🎯"
          actionLabel="Create Competency"
          onAction={handleCreate}
        />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="competency-grid">
              {data.map((competency) => (
                <CompetencyCard key={competency.id} competency={competency} />
              ))}
            </div>
          ) : (
            <CompetencyTable data={data} />
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

export default CompetencyList;