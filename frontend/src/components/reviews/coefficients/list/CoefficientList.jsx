// src/components/reviews/coefficients/list/CoefficientList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Calculator, RefreshCw } from 'lucide-react';
import { useCoefficients } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar, ReviewStatusBadge } from '../../common';
import CoefficientTable from './CoefficientTable';
import CoefficientFilters from './CoefficientFilters';

const CoefficientList = () => {
  const navigate = useNavigate();
  const { data, activeCoefficients, loading, error, fetchAll, getActive, pagination, setPagination, filters, setFilters, clearFilters, canManage } = useCoefficients();
  const [showActive, setShowActive] = useState(false);

  console.log('[CoefficientList] rendering:', { 
    data, 
    dataLength: data.length,
    loading, 
    error, 
    pagination, 
    filters, 
    canManage 
  });

  useEffect(() => {
    console.log('[CoefficientList] useEffect triggered:', { showActive, pagination, filters });
    if (showActive) {
      console.log('[CoefficientList] calling getActive()');
      getActive();
    } else {
      console.log('[CoefficientList] calling fetchAll()');
      fetchAll({
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        ...filters,
      });
    }
  }, [pagination.currentPage, pagination.pageSize, filters, showActive, fetchAll, getActive]);

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
    navigate('/reviews/coefficients/create');
  };

  const toggleActive = () => {
    setShowActive(!showActive);
    setPagination({ currentPage: 1 });
  };

  if (loading && !data.length) return <ReviewLoading size="lg" text="Loading coefficients..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchAll()} />;

  const displayData = showActive ? (activeCoefficients || []) : data;

  return (
    <div className="coefficient-list">
      <div className="coefficient-list-header">
        <div className="coefficient-list-title-section">
          <h1 className="coefficient-list-title">Coefficients</h1>
          <span className="coefficient-list-count">{pagination.totalItems || displayData.length} coefficients</span>
        </div>
        <div className="coefficient-list-actions">
          <button
            className={`btn ${showActive ? 'btn-primary' : 'btn-outline'}`}
            onClick={toggleActive}
          >
            <Filter size={18} />
            {showActive ? 'Showing Active' : 'Show Active'}
          </button>
          {canManage && (
            <button className="btn btn-primary" onClick={handleCreate}>
              <Plus size={18} />
              New Coefficient
            </button>
          )}
        </div>
      </div>

      <div className="coefficient-list-toolbar">
        <ReviewSearchBar
          placeholder="Search coefficients..."
          onSearch={handleSearch}
          className="coefficient-search"
        />
        <CoefficientFilters
          onFilterChange={handleFilterChange}
          onClearAll={handleClearFilters}
        />
      </div>

      {displayData.length === 0 ? (
        <ReviewEmptyState
          title={showActive ? "No Active Coefficients Found" : "No Coefficients Found"}
          description={showActive 
            ? "No active coefficients are available." 
            : "Create a coefficient to start applying multipliers to scores."}
          icon="📊"
          actionLabel={canManage ? "Create Coefficient" : undefined}
          onAction={canManage ? handleCreate : undefined}
        />
      ) : (
        <>
          <CoefficientTable data={displayData} />
          {!showActive && (
            <ReviewPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CoefficientList;