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

  useEffect(() => {
    fetchAll({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      ...filters,
    });
  }, [pagination.currentPage, pagination.pageSize, filters]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setFilters({ search: term });
  }, [setFilters]);

  const handlePageChange = useCallback((page) => {
    setPagination({ currentPage: page });
  }, [setPagination]);

  const handlePageSizeChange = useCallback((size) => {
    setPagination({ pageSize: size, currentPage: 1 });
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
          <span className="supervisor-review-list-count">{pagination.totalItems} reviews</span>
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

export default SupervisorReviewList;