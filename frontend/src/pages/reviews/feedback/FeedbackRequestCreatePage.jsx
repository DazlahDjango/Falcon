// src/pages/reviews/feedback/FeedbackRequestCreatePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { FeedbackRequestCreate } from '../../../components/reviews/feedback';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const FeedbackRequestCreatePage = () => {
  const navigate = useNavigate();
  const { canCreateFeedbackRequest, isAdmin } = useReviewsPermissions();

  if (!canCreateFeedbackRequest && !isAdmin) {
    return (
      <div className="feedback-request-create-page">
        <div className="feedback-request-create-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to create feedback requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-request-create-page">
      <div className="feedback-request-create-page-header">
        <button className="feedback-request-create-page-back" onClick={() => navigate('/reviews/feedback/requests')}>
          <ArrowLeft size={20} />
          Back to Requests
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Feedback', path: '/reviews/feedback' },
            { label: 'Requests', path: '/reviews/feedback/requests' },
            { label: 'Create', path: '/reviews/feedback/requests/create', isActive: true },
          ]}
        />
        <h1 className="feedback-request-create-page-title">
          <Plus size={24} />
          Create Feedback Request
        </h1>
      </div>

      <FeedbackRequestCreate />
    </div>
  );
};

export default FeedbackRequestCreatePage;