// src/pages/reviews/feedback/FeedbackRequestsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { FeedbackRequestList } from '../../../components/reviews/feedback';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const FeedbackRequestsPage = () => {
  const navigate = useNavigate();
  const { canViewFeedback } = useReviewsPermissions();

  if (!canViewFeedback) {
    return (
      <div className="feedback-requests-page">
        <div className="feedback-requests-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view feedback requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-requests-page">
      <div className="feedback-requests-page-header">
        <button className="feedback-requests-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Feedback', path: '/reviews/feedback' },
            { label: 'Requests', path: '/reviews/feedback/requests', isActive: true },
          ]}
        />
        <h1 className="feedback-requests-page-title">
          <MessageSquare size={24} />
          Feedback Requests
        </h1>
      </div>

      <FeedbackRequestList />
    </div>
  );
};

export default FeedbackRequestsPage;