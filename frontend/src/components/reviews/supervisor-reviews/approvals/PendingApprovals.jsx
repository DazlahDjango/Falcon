// src/components/reviews/supervisor-reviews/approvals/PendingApprovals.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Eye, User, Calendar, Filter, Search } from 'lucide-react';
import { useSupervisorReview } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar, ReviewStatusBadge } from '../../common';
import ApprovalActions from './ApprovalActions';

const PendingApprovals = () => {
  const navigate = useNavigate();
  const { pendingApprovals, loading, error, fetchPendingApprovals, approve, reject, canManage } = useSupervisorReview();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleView = (id) => {
    navigate(`/reviews/supervisor-reviews/${id}`);
  };

  const handleApprove = async (id, comments) => {
    await approve(id, comments);
    fetchPendingApprovals();
    setShowActions(false);
    setSelectedReview(null);
  };

  const handleReject = async (id, reason) => {
    await reject(id, reason);
    fetchPendingApprovals();
    setShowActions(false);
    setSelectedReview(null);
  };

  const handleRequestChanges = async (id, feedback) => {
    await requestChanges(id, feedback);
    fetchPendingApprovals();
    setShowActions(false);
    setSelectedReview(null);
  };

  const handleActionClick = (review) => {
    setSelectedReview(review);
    setShowActions(true);
  };

  if (loading) return <ReviewLoading size="lg" text="Loading pending approvals..." />;
  if (error) return <ReviewError error={error} onRetry={fetchPendingApprovals} />;

  const approvalsList = Array.isArray(pendingApprovals) ? pendingApprovals : (pendingApprovals?.results || []);

  const filteredApprovals = approvalsList.filter((review) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      review.employee_name?.toLowerCase().includes(search) ||
      review.employee_email?.toLowerCase().includes(search) ||
      review.review_cycle_name?.toLowerCase().includes(search) ||
      review.supervisor_name?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="pending-approvals">
      <div className="pending-approvals-header">
        <div className="pending-approvals-title-section">
          <h1 className="pending-approvals-title">Pending Approvals</h1>
          <span className="pending-approvals-count">{filteredApprovals.length} pending</span>
        </div>
      </div>

      <div className="pending-approvals-toolbar">
        <ReviewSearchBar
          placeholder="Search approvals..."
          onSearch={handleSearch}
          className="pending-approvals-search"
        />
      </div>

      {filteredApprovals.length === 0 ? (
        <ReviewEmptyState
          title="No Pending Approvals"
          description={searchTerm ? 'No approvals match your search.' : 'All reviews have been approved.'}
          icon="✅"
        />
      ) : (
        <>
          <div className="pending-approvals-list">
            {filteredApprovals.map((review) => (
              <div key={review.id} className="pending-approvals-item">
                <div className="pending-approvals-item-left">
                  <div className="pending-approvals-item-avatar">
                    {review.employee_name?.charAt(0) || 'E'}
                  </div>
                  <div className="pending-approvals-item-info">
                    <div className="pending-approvals-item-name">{review.employee_name}</div>
                    <div className="pending-approvals-item-email">{review.employee_email}</div>
                    <div className="pending-approvals-item-meta">
                      <span className="pending-approvals-item-supervisor">
                        <User size={12} />
                        {review.supervisor_name}
                      </span>
                      <span className="pending-approvals-item-cycle">
                        <Calendar size={12} />
                        {review.review_cycle_name}
                      </span>
                      <span className="pending-approvals-item-status">
                        <ReviewStatusBadge status={review.status} size="sm" />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pending-approvals-item-right">
                  <button
                    className="pending-approvals-item-btn view"
                    onClick={() => handleView(review.id)}
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="pending-approvals-item-btn approve"
                    onClick={() => handleActionClick(review)}
                    title="Approve/Reject"
                  >
                    <CheckCircle size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showActions && selectedReview && (
        <ApprovalActions
          review={selectedReview}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestChanges={handleRequestChanges}
          onClose={() => {
            setShowActions(false);
            setSelectedReview(null);
          }}
        />
      )}
    </div>
  );
};

export default PendingApprovals;