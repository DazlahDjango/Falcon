// src/components/reviews/feedback/requests/FeedbackRequestList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useFeedback } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar, ReviewStatusBadge } from '../../common';
import FeedbackRequestFilters from './FeedbackRequestFilters';
import PendingRequests from './PendingRequests';
import OverdueRequests from './OverdueRequests';

const FeedbackRequestList = () => {
  const navigate = useNavigate();
  const { requestData, requestLoading, requestError, fetchRequests, pagination, setPagination, filters, setFilters, clearFilters, canManage } = useFeedback();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      ...filters,
    });
  }, [pagination.currentPage, pagination.pageSize, filters]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setFilters({ search: term });
  }, [setFilters]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters({ [key]: value });
  }, [setFilters]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    setSearchTerm('');
  }, [clearFilters]);

  const handlePageChange = useCallback((page) => {
    setPagination({ currentPage: page });
  }, [setPagination]);

  const handlePageSizeChange = useCallback((size) => {
    setPagination({ pageSize: size, currentPage: 1 });
  }, [setPagination]);

  const handleCreate = () => {
    navigate('/reviews/feedback/requests/create');
  };

  const handleView = (id) => {
    navigate(`/reviews/feedback/requests/${id}`);
  };

  if (requestLoading && !requestData.length) return <ReviewLoading size="lg" text="Loading feedback requests..." />;
  if (requestError) return <ReviewError error={requestError} onRetry={() => fetchRequests()} />;

  const filteredData = requestData.filter((item) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.subject_name?.toLowerCase().includes(search) ||
      item.reviewer_name?.toLowerCase().includes(search) ||
      item.review_cycle_name?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="feedback-request-list">
      <div className="feedback-request-list-header">
        <div className="feedback-request-list-title-section">
          <h1 className="feedback-request-list-title">Feedback Requests</h1>
          <span className="feedback-request-list-count">{pagination.totalItems} requests</span>
        </div>
        <div className="feedback-request-list-actions">
          {canManage && (
            <button className="btn btn-primary" onClick={handleCreate}>
              <Plus size={18} />
              New Request
            </button>
          )}
        </div>
      </div>

      <div className="feedback-request-list-tabs">
        <button
          className={`feedback-request-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Requests
        </button>
        <button
          className={`feedback-request-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Clock size={14} />
          Pending
        </button>
        <button
          className={`feedback-request-tab ${activeTab === 'overdue' ? 'active' : ''}`}
          onClick={() => setActiveTab('overdue')}
        >
          <XCircle size={14} />
          Overdue
        </button>
      </div>

      <div className="feedback-request-list-toolbar">
        <ReviewSearchBar
          placeholder="Search requests..."
          onSearch={handleSearch}
          className="feedback-request-search"
        />
        <FeedbackRequestFilters
          onFilterChange={handleFilterChange}
          onClearAll={handleClearFilters}
        />
      </div>

      {activeTab === 'pending' ? (
        <PendingRequests />
      ) : activeTab === 'overdue' ? (
        <OverdueRequests />
      ) : (
        <>
          {filteredData.length === 0 ? (
            <ReviewEmptyState
              title="No Feedback Requests Found"
              description="Create a feedback request to start collecting 360 feedback."
              icon="📨"
              actionLabel="Create Request"
              onAction={handleCreate}
            />
          ) : (
            <>
              <div className="feedback-request-list-grid">
                {filteredData.map((request) => (
                  <div key={request.id} className="feedback-request-card" onClick={() => handleView(request.id)}>
                    <div className="feedback-request-card-header">
                      <div className="feedback-request-card-users">
                        <div className="feedback-request-card-subject">
                          <span className="feedback-request-card-label">Subject</span>
                          <span className="feedback-request-card-name">{request.subject_name}</span>
                        </div>
                        <div className="feedback-request-card-reviewer">
                          <span className="feedback-request-card-label">Reviewer</span>
                          <span className="feedback-request-card-name">{request.reviewer_name}</span>
                        </div>
                      </div>
                      <ReviewStatusBadge status={request.status} />
                    </div>

                    <div className="feedback-request-card-info">
                      <span className="feedback-request-card-cycle">{request.review_cycle_name}</span>
                      <span className="feedback-request-card-type">{request.reviewer_type_display}</span>
                      {request.is_overdue && !request.has_response && (
                        <span className="feedback-request-card-overdue">
                          <XCircle size={12} />
                          Overdue
                        </span>
                      )}
                      {request.has_response && (
                        <span className="feedback-request-card-responded">
                          <CheckCircle size={12} />
                          Responded
                        </span>
                      )}
                    </div>

                    <div className="feedback-request-card-footer">
                      <span className="feedback-request-card-date">
                        Due: {new Date(request.due_date).toLocaleDateString()}
                      </span>
                      <button
                        className="feedback-request-card-btn"
                        onClick={(e) => { e.stopPropagation(); handleView(request.id); }}
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
        </>
      )}
    </div>
  );
};

export default FeedbackRequestList;