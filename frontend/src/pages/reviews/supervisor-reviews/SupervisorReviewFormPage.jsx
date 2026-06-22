// src/pages/reviews/supervisor-reviews/SupervisorReviewFormPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { SupervisorReviewForm } from '../../../components/reviews/supervisor-reviews';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const SupervisorReviewFormPage = () => {
  const navigate = useNavigate();
  const { canCreateSupervisorReview, isSupervisor, isAdmin } = useReviewsPermissions();

  if (!canCreateSupervisorReview && !isSupervisor && !isAdmin) {
    return (
      <div className="supervisor-review-form-page">
        <div className="supervisor-review-form-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to create supervisor reviews.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supervisor-review-form-page">
      <div className="supervisor-review-form-page-header">
        <button className="supervisor-review-form-page-back" onClick={() => navigate('/reviews/supervisor-reviews/queue')}>
          <ArrowLeft size={20} />
          Back to Queue
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Supervisor Reviews', path: '/reviews/supervisor-reviews' },
            { label: 'Queue', path: '/reviews/supervisor-reviews/queue' },
            { label: 'Form', path: '/reviews/supervisor-reviews/form', isActive: true },
          ]}
        />
        <h1 className="supervisor-review-form-page-title">
          <FileText size={24} />
          Supervisor Review
        </h1>
      </div>

      <SupervisorReviewForm />
    </div>
  );
};

export default SupervisorReviewFormPage;