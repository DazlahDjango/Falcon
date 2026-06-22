// src/pages/reviews/feedback/FeedbackSummaryPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { FeedbackSummary } from '../../../components/reviews/feedback';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const FeedbackSummaryPage = () => {
  const navigate = useNavigate();
  const { canViewFeedback } = useReviewsPermissions();

  if (!canViewFeedback) {
    return (
      <div className="feedback-summary-page">
        <div className="feedback-summary-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view feedback summaries.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-summary-page">
      <div className="feedback-summary-page-header">
        <button className="feedback-summary-page-back" onClick={() => navigate('/reviews/feedback/requests')}>
          <ArrowLeft size={20} />
          Back to Requests
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Feedback', path: '/reviews/feedback' },
            { label: 'Summary', path: '/reviews/feedback/summary', isActive: true },
          ]}
        />
        <h1 className="feedback-summary-page-title">
          <FileText size={24} />
          Feedback Summary
        </h1>
      </div>

      <FeedbackSummary />
    </div>
  );
};

export default FeedbackSummaryPage;