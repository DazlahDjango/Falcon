// src/components/reviews/self-assessments/list/SelfAssessmentList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useSelfAssessment } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar, ReviewStatusBadge } from '../../common';
import SelfAssessmentFilters from './SelfAssessmentFilters';

const SelfAssessmentList = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchAll, pagination, setPagination, filters, setFilters, clearFilters } = useSelfAssessment();

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

  const handlePageChange = useCallback((page) => {
    setPagination({ currentPage: page });
  }, [setPagination]);

  const handlePageSizeChange = useCallback((size) => {
    setPagination({ pageSize: size, currentPage: 1 });
  }, [setPagination]);

  const handleView = (id) => {
    navigate(`/reviews/self-assessments/${id}`);
  };

  if (loading && !data.length) return <ReviewLoading size="lg" text="Loading self assessments..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchAll()} />;

  return (
    <div className="self-assessment-list">
      <div className="self-assessment-list-header">
        <div className="self-assessment-list-title-section">
          <h1 className="self-assessment-list-title">Self Assessments</h1>
          <span className="self-assessment-list-count">{pagination.totalItems} assessments</span>
        </div>
      </div>

      <div className="self-assessment-list-toolbar">
        <ReviewSearchBar
          placeholder="Search assessments..."
          onSearch={handleSearch}
          className="self-assessment-search"
        />
      </div>

      {data.length === 0 ? (
        <ReviewEmptyState
          title="No Self Assessments Found"
          description="No self assessments are available."
          icon="📝"
        />
      ) : (
        <>
          <div className="self-assessment-list-grid">
            {data.map((assessment) => (
              <div key={assessment.id} className="self-assessment-list-card" onClick={() => handleView(assessment.id)}>
                <div className="self-assessment-list-card-header">
                  <div className="self-assessment-list-card-user">
                    <div className="self-assessment-list-card-avatar">
                      {assessment.employee_name?.charAt(0) || 'U'}
                    </div>
                    <div className="self-assessment-list-card-user-info">
                      <span className="self-assessment-list-card-name">{assessment.employee_name}</span>
                      <span className="self-assessment-list-card-email">{assessment.employee_email}</span>
                    </div>
                  </div>
                  <ReviewStatusBadge status={assessment.status} />
                </div>

                <div className="self-assessment-list-card-info">
                  <span className="self-assessment-list-card-cycle">{assessment.review_cycle_name}</span>
                  <span className="self-assessment-list-card-date">
                    {assessment.submitted_at
                      ? `Submitted: ${new Date(assessment.submitted_at).toLocaleDateString()}`
                      : 'Not submitted'}
                  </span>
                </div>

                {assessment.is_late && !assessment.submitted_at && (
                  <div className="self-assessment-list-card-warning">
                    <AlertCircle size={14} />
                    Overdue
                  </div>
                )}

                <div className="self-assessment-list-card-footer">
                  <button
                    className="self-assessment-list-card-btn"
                    onClick={(e) => { e.stopPropagation(); handleView(assessment.id); }}
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

export default SelfAssessmentList;