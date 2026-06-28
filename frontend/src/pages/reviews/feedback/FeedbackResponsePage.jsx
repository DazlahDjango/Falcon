// src/pages/reviews/feedback/FeedbackResponsePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { FeedbackResponseForm } from '../../../components/reviews/feedback';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const FeedbackResponsePage = () => {
  const navigate = useNavigate();
  const { canCreateComment } = useReviewsPermissions();

  if (!canCreateComment) {
    return (
      <div className="feedback-response-page">
        <div className="feedback-response-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to submit feedback responses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-response-page">
      <div className="feedback-response-page-header">
        <button className="feedback-response-page-back" onClick={() => navigate('/reviews/feedback/requests')}>
          <ArrowLeft size={20} />
          Back to Requests
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Feedback', path: '/reviews/feedback' },
            { label: 'Response', path: '/reviews/feedback/respond', isActive: true },
          ]}
        />
        <h1 className="feedback-response-page-title">
          <Send size={24} />
          Submit Feedback
        </h1>
      </div>

      <FeedbackResponseForm />
    </div>
  );
};

export default FeedbackResponsePage;