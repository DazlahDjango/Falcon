// src/components/reviews/feedback/requests/PendingRequests.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, Mail, User, Calendar, Edit3 } from 'lucide-react';
import { useFeedback } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewEmptyState } from '../../common';

const PendingRequests = () => {
  const navigate = useNavigate();
  const { pendingRequests, requestLoading, fetchPending } = useFeedback();

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleView = (id) => {
    navigate(`/reviews/feedback/requests/${id}`);
  };

  if (requestLoading) return <ReviewLoading size="md" text="Loading pending requests..." />;

  if (pendingRequests.length === 0) {
    return (
      <ReviewEmptyState
        title="No Pending Requests"
        description="All feedback requests have been completed."
        icon="✅"
      />
    );
  }

  return (
    <div className="pending-requests">
      <div className="pending-requests-header">
        <h3 className="pending-requests-title">
          <Clock size={18} />
          Pending Requests ({pendingRequests.length})
        </h3>
      </div>
      <div className="pending-requests-list">
        {pendingRequests.map((request) => (
          <div key={request.id} className="pending-request-item" onClick={() => handleView(request.id)}>
            <div className="pending-request-item-icon">
              <Mail size={20} />
            </div>
            <div className="pending-request-item-content">
              <div className="pending-request-item-header">
                <span className="pending-request-item-subject">{request.subject_name}</span>
                <span className="pending-request-item-reviewer">
                  <User size={12} />
                  {request.reviewer_name}
                </span>
              </div>
              <div className="pending-request-item-meta">
                <span className="pending-request-item-cycle">
                  <Calendar size={12} />
                  {request.review_cycle_name}
                </span>
                <span className="pending-request-item-type">{request.reviewer_type_display}</span>
                {request.is_required && (
                  <span className="pending-request-item-required">Required</span>
                )}
                {request.is_overdue && (
                  <span className="pending-request-item-overdue">⚠️ Overdue</span>
                )}
              </div>
            </div>
            <div className="pending-request-item-actions" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                className="pending-request-item-btn"
                onClick={(e) => { e.stopPropagation(); handleView(request.id); }}
                title="View Request"
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
              >
                <Eye size={15} color="#475569" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigate(`/reviews/feedback/respond/${request.id}`); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
              >
                <Edit3 size={13} /> Provide Feedback
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingRequests;