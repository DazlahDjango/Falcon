// src/components/reviews/feedback/requests/OverdueRequests.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, Eye, Mail, User, Calendar, AlertCircle } from 'lucide-react';
import { useFeedback } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewEmptyState } from '../../common';

const OverdueRequests = () => {
  const navigate = useNavigate();
  const { overdueRequests, requestLoading, fetchOverdue } = useFeedback();

  useEffect(() => {
    fetchOverdue();
  }, [fetchOverdue]);

  const handleView = (id) => {
    navigate(`/reviews/feedback/requests/${id}`);
  };

  if (requestLoading) return <ReviewLoading size="md" text="Loading overdue requests..." />;

  if (overdueRequests.length === 0) {
    return (
      <ReviewEmptyState
        title="No Overdue Requests"
        description="All feedback requests are on track."
        icon="✅"
      />
    );
  }

  return (
    <div className="overdue-requests">
      <div className="overdue-requests-header">
        <h3 className="overdue-requests-title">
          <AlertCircle size={18} />
          Overdue Requests ({overdueRequests.length})
        </h3>
      </div>
      <div className="overdue-requests-list">
        {overdueRequests.map((request) => (
          <div key={request.id} className="overdue-request-item" onClick={() => handleView(request.id)}>
            <div className="overdue-request-item-icon">
              <XCircle size={20} color="#ef4444" />
            </div>
            <div className="overdue-request-item-content">
              <div className="overdue-request-item-header">
                <span className="overdue-request-item-subject">{request.subject_name}</span>
                <span className="overdue-request-item-reviewer">
                  <User size={12} />
                  {request.reviewer_name}
                </span>
              </div>
              <div className="overdue-request-item-meta">
                <span className="overdue-request-item-cycle">
                  <Calendar size={12} />
                  {request.review_cycle_name}
                </span>
                <span className="overdue-request-item-type">{request.reviewer_type_display}</span>
                <span className="overdue-request-item-days">
                  {Math.ceil((new Date() - new Date(request.due_date)) / (1000 * 60 * 60 * 24))} days overdue
                </span>
                {request.is_required && (
                  <span className="overdue-request-item-required">Required</span>
                )}
              </div>
            </div>
            <div className="overdue-request-item-actions">
              <button
                className="overdue-request-item-btn"
                onClick={(e) => { e.stopPropagation(); handleView(request.id); }}
              >
                <Eye size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverdueRequests;