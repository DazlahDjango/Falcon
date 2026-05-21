// frontend/src/pages/dashboard/StaffDashboard/SubmissionHistory.jsx

import React, { useState } from 'react';
import { DashboardCard } from '../../../components/dashboard/common';

export const SubmissionHistory = ({ data, loading, onRefresh }) => {
  const [expandedId, setExpandedId] = useState(null);
  const submissions = data || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge approved">✓ Approved</span>;
      case 'rejected':
        return <span className="badge rejected">✗ Rejected</span>;
      case 'pending':
        return <span className="badge pending">⏳ Pending</span>;
      default:
        return <span className="badge draft">📝 Draft</span>;
    }
  };

  return (
    <DashboardCard 
      title="Submission History" 
      loading={loading}
      onRefresh={onRefresh}
    >
      <div className="submissions-list">
        {submissions.length === 0 ? (
          <div className="empty-state">
            <p>No submissions yet</p>
          </div>
        ) : (
          submissions.map((submission) => (
            <div key={submission.id} className="submission-item">
              <div className="submission-header">
                <div className="submission-kpi">{submission.kpi_name}</div>
                {getStatusBadge(submission.status)}
              </div>
              
              <div className="submission-details">
                <span>Value: {submission.actual_value}</span>
                <span>Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
              </div>
              
              {submission.comments && (
                <div className="submission-comments">
                  💬 {submission.comments}
                </div>
              )}
              
              {submission.feedback && (
                <div className="submission-feedback">
                  📋 Feedback: {submission.feedback}
                </div>
              )}
              
              <button 
                className="expand-btn"
                onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
              >
                {expandedId === submission.id ? 'Show less' : 'Show more'}
              </button>
              
              {expandedId === submission.id && (
                <div className="submission-expanded">
                  <div className="submission-timeline">
                    <div className="timeline-step">
                      <span className="step-icon">📝</span>
                      <span>Submitted: {new Date(submission.submitted_at).toLocaleString()}</span>
                    </div>
                    {submission.approved_at && (
                      <div className="timeline-step">
                        <span className="step-icon">✓</span>
                        <span>Approved: {new Date(submission.approved_at).toLocaleString()}</span>
                      </div>
                    )}
                    {submission.rejected_at && (
                      <div className="timeline-step">
                        <span className="step-icon">✗</span>
                        <span>Rejected: {new Date(submission.rejected_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </DashboardCard>
  );
};

export default SubmissionHistory;