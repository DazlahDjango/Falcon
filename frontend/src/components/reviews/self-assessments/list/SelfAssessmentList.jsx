// src/components/reviews/self-assessments/list/SelfAssessmentList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useSelfAssessment } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar, ReviewStatusBadge } from '../../common';
import SelfAssessmentFilters from './SelfAssessmentFilters';

const SelfAssessmentList = ({ isTeamView = false }) => {
  const navigate = useNavigate();
  const { data, loading, error, fetchAll, pagination, setPagination, filters, setFilters, clearFilters } = useSelfAssessment();

  useEffect(() => {
    fetchAll({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      ...(isTeamView ? { is_team: true } : {}),
      ...filters,
    });
  }, [pagination.currentPage, pagination.pageSize, filters, isTeamView]);

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

  const handleStartSupervisorReview = (assessment) => {
    const empId = assessment.employee_id || (typeof assessment.employee === 'object' ? assessment.employee?.id : assessment.employee);
    if (empId) {
      navigate(`/reviews/supervisor-reviews/${empId}/form`);
    } else {
      navigate('/reviews/supervisor-reviews/queue');
    }
  };

  if (loading && !data.length) return <ReviewLoading size="lg" text="Loading self assessments..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchAll()} />;

  return (
    <div className="self-assessment-list">
      <div className="self-assessment-list-header" style={{ marginBottom: '16px' }}>
        <div className="self-assessment-list-title-section">
          <span className="self-assessment-list-count" style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
            {pagination.totalItems || data.length} {isTeamView ? 'Team Submissions' : 'Total Records'}
          </span>
        </div>
      </div>

      <div className="self-assessment-list-toolbar" style={{ marginBottom: '20px' }}>
        <ReviewSearchBar
          placeholder={isTeamView ? "Search team members by name or email..." : "Search all records by employee, department, cycle..."}
          onSearch={handleSearch}
          className="self-assessment-search"
        />
      </div>

      {data.length === 0 ? (
        <ReviewEmptyState
          title={isTeamView ? "No Team Assessments Found" : "No Self Assessments Found"}
          description={isTeamView ? "Your team members have not created any self assessments yet." : "No self assessment records match the current criteria."}
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
                      : 'Draft / In Progress'}
                  </span>
                </div>

                {assessment.is_late && !assessment.submitted_at && (
                  <div className="self-assessment-list-card-warning">
                    <AlertCircle size={14} />
                    Overdue
                  </div>
                )}

                <div className="self-assessment-list-card-footer" style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <button
                    type="button"
                    className="self-assessment-list-card-btn"
                    onClick={(e) => { e.stopPropagation(); handleView(assessment.id); }}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
                  >
                    <Eye size={15} />
                    View
                  </button>
                  <button
                    type="button"
                    className="self-assessment-list-card-btn"
                    onClick={(e) => { e.stopPropagation(); handleStartSupervisorReview(assessment); }}
                    style={{ flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                    title="Start Manager Appraisal for this employee"
                  >
                    <CheckCircle size={15} />
                    Start Review
                  </button>
                  {assessment.status !== 'submitted' && (
                    <button
                      type="button"
                      className="self-assessment-list-card-btn"
                      onClick={(e) => { e.stopPropagation(); alert(`Reminder notification sent to ${assessment.employee_name || 'employee'}!`); }}
                      style={{ background: '#f8fafc', color: '#d97706', border: '1px solid #fde68a', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Nudge staff to complete submission"
                    >
                      <Clock size={15} />
                    </button>
                  )}
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