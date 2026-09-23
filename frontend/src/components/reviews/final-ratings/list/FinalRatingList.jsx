import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid, List, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { useFinalRating, useReviewsPermissions } from '../../../../hooks/reviews';
import { useAuthContext } from '../../../../contexts/accounts/AuthContext';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar, ReviewStatusBadge } from '../../common';
import FinalRatingTable from './FinalRatingTable';
import FinalRatingFilters from './FinalRatingFilters';

const FinalRatingList = ({ isTeamView = false }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { isAdmin, isHrAdmin, isSupervisor, isExecutive } = useReviewsPermissions();
  const { data = [], loading, error, clearErrors, fetchAll, pagination, setPagination, filters, setFilters, clearFilters } = useFinalRating();
  const [viewMode, setViewMode] = useState('table');

  const isStaffOnly = !isAdmin && !isHrAdmin && !isExecutive && !isTeamView && !isSupervisor;

  useEffect(() => {
    if (clearErrors) clearErrors();
    fetchAll({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      ...(isStaffOnly ? { scope: 'my' } : {}),
      ...(isTeamView ? { is_team: true } : {}),
      ...filters,
    });
  }, [pagination.currentPage, pagination.pageSize, filters, isStaffOnly, isTeamView, fetchAll, clearErrors]);

  const displayData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (isStaffOnly && (user?.id || user?.email)) {
      return data.filter((item) => {
        const empId = typeof item.employee === 'object' && item.employee !== null
          ? (item.employee.id || item.employee.uuid)
          : (item.employee_id || item.employee);
        const idMatch = Boolean(empId && user?.id && String(empId).toLowerCase() === String(user.id).toLowerCase());
        const emailMatch = Boolean(item.employee_email && user?.email && item.employee_email.toLowerCase() === user.email.toLowerCase());
        return idMatch || emailMatch;
      });
    }
    return data;
  }, [data, isStaffOnly, user?.id, user?.email]);

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

  if (loading && !displayData.length) return <ReviewLoading size="lg" text="Loading final ratings..." />;
  if (error && !displayData.length) return (
    <ReviewError
      error={error}
      onRetry={() => {
        if (clearErrors) clearErrors();
        fetchAll({
          page: pagination.currentPage,
          page_size: pagination.pageSize,
          ...(isStaffOnly ? { scope: 'my' } : {}),
          ...(isTeamView ? { is_team: true } : {}),
          ...filters,
        });
      }}
    />
  );

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

      {displayData.length === 0 ? (
        <ReviewEmptyState
          title={isTeamView ? "No Team Final Ratings Found" : isStaffOnly ? "No Final Ratings Yet" : "No Final Ratings Found"}
          description={isTeamView ? "No team members have locked final ratings for this cycle yet." : isStaffOnly ? "Your final rating has not been published or locked yet for this cycle." : "No final rating records match the current criteria."}
          icon="⭐"
        />
      ) : (
        <>
          <FinalRatingTable data={displayData} onView={handleView} />
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