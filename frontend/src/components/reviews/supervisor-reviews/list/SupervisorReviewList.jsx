// src/components/reviews/supervisor-reviews/list/SupervisorReviewList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, User, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useSupervisorReview } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar, ReviewStatusBadge } from '../../common';

const SupervisorReviewList = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchAll, pagination, setPagination, filters, setFilters } = useSupervisorReview();
  const [searchTerm, setSearchTerm] = useState('');

  const paginationSafe = pagination || {
    currentPage: 1,
    pageSize: 20,
    totalItems: data?.length || 0,
    totalPages: Math.ceil((data?.length || 0) / 20) || 1,
  };

  useEffect(() => {
    fetchAll({
      page: paginationSafe.currentPage,
      page_size: paginationSafe.pageSize,
      ...filters,
    });
  }, [paginationSafe.currentPage, paginationSafe.pageSize, filters, fetchAll]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    if (setFilters) setFilters({ search: term });
  }, [setFilters]);

  const handlePageChange = useCallback((page) => {
    if (setPagination) setPagination({ currentPage: page });
  }, [setPagination]);

  const handlePageSizeChange = useCallback((size) => {
    if (setPagination) setPagination({ pageSize: size, currentPage: 1 });
  }, [setPagination]);

  const handleView = (id) => {
    navigate(`/reviews/supervisor-reviews/${id}`);
  };

  if (loading && !data.length) return <ReviewLoading size="lg" text="Loading supervisor reviews..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchAll()} />;

  return (
    <div className="supervisor-review-list">
      <div className="supervisor-review-list-header">
        <div className="supervisor-review-list-title-section">
          <h1 className="supervisor-review-list-title">Supervisor Reviews</h1>
          <span className="supervisor-review-list-count">{paginationSafe.totalItems || data?.length || 0} reviews</span>
        </div>
      </div>

      <div className="supervisor-review-list-toolbar">
        <ReviewSearchBar
          placeholder="Search reviews..."
          onSearch={handleSearch}
          className="supervisor-review-search"
        />
      </div>

      {data.length === 0 ? (
        <ReviewEmptyState
          title="No Supervisor Reviews Found"
          description="No supervisor reviews are available."
          icon="📋"
        />
      ) : (
        <>
          <div className="supervisor-review-list-grid">
            {data.map((review) => (
              <div key={review.id} className="supervisor-review-list-card" onClick={() => handleView(review.id)}>
                <div className="supervisor-review-list-card-header">
                  <div className="supervisor-review-list-card-user">
                    <div className="supervisor-review-list-card-avatar">
                      {review.employee_name?.charAt(0) || 'U'}
                    </div>
                    <div className="supervisor-review-list-card-user-info">
                      <span className="supervisor-review-list-card-name">{review.employee_name}</span>
                      <span className="supervisor-review-list-card-email">{review.employee_email}</span>
                    </div>
                  </div>
                  <ReviewStatusBadge status={review.status} />
                </div>

                <div className="supervisor-review-list-card-info">
                  <span className="supervisor-review-list-card-cycle">
                    <Calendar size={12} />
                    {review.review_cycle_name}
                  </span>
                  <span className="supervisor-review-list-card-supervisor">
                    <User size={12} />
                    {review.supervisor_name}
                  </span>
                </div>

                {review.self_assessment && (
                  <div className="supervisor-review-list-card-self">
                    <CheckCircle size={14} color="#22c55e" />
                    Self Assessment Submitted
                  </div>
                )}

                <div className="supervisor-review-list-card-footer">
                  <button
                    className="supervisor-review-list-card-btn"
                    onClick={(e) => { e.stopPropagation(); handleView(review.id); }}
                  >
                    <Eye size={16} />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>

          <ReviewPagination
            currentPage={paginationSafe.currentPage}
            totalPages={paginationSafe.totalPages}
            pageSize={paginationSafe.pageSize}
            totalItems={paginationSafe.totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
};

export default SupervisorReviewList;