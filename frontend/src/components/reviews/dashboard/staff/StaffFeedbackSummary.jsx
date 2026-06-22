// src/components/reviews/dashboard/staff/StaffFeedbackSummary.jsx
import React from 'react';
import { Users, MessageSquare, Clock, CheckCircle } from 'lucide-react';

const StaffFeedbackSummary = ({ summary = [] }) => {
  if (!summary || summary.length === 0) {
    return (
      <div className="staff-feedback-summary">
        <h3 className="staff-feedback-summary-title">
          <MessageSquare size={18} />
          Feedback Requests
        </h3>
        <div className="staff-feedback-summary-empty">
          <p>No pending feedback requests</p>
        </div>
      </div>
    );
  }

  const pendingCount = summary.filter(r => r.status === 'pending').length;

  return (
    <div className="staff-feedback-summary">
      <h3 className="staff-feedback-summary-title">
        <MessageSquare size={18} />
        Feedback Requests
      </h3>
      <div className="staff-feedback-summary-stats">
        <div className="staff-feedback-summary-stat">
          <span className="staff-feedback-summary-stat-value">{summary.length}</span>
          <span className="staff-feedback-summary-stat-label">Total</span>
        </div>
        <div className="staff-feedback-summary-stat">
          <span className="staff-feedback-summary-stat-value" style={{ color: '#f59e0b' }}>
            {pendingCount}
          </span>
          <span className="staff-feedback-summary-stat-label">Pending</span>
        </div>
        <div className="staff-feedback-summary-stat">
          <span className="staff-feedback-summary-stat-value" style={{ color: '#22c55e' }}>
            {summary.length - pendingCount}
          </span>
          <span className="staff-feedback-summary-stat-label">Completed</span>
        </div>
      </div>
      <div className="staff-feedback-summary-list">
        {summary.slice(0, 3).map((request, index) => (
          <div key={index} className="staff-feedback-summary-item">
            <span className="staff-feedback-summary-item-reviewer">
              {request.reviewer}
            </span>
            <span className="staff-feedback-summary-item-type">
              {request.reviewer_type}
            </span>
            <span className="staff-feedback-summary-item-status">
              <ReviewStatusBadge status={request.status} size="sm" />
            </span>
          </div>
        ))}
        {summary.length > 3 && (
          <div className="staff-feedback-summary-more">
            +{summary.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffFeedbackSummary;