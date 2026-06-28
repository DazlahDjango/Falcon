// src/pages/reviews/supervisor-reviews/SupervisorReviewDetailPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { SupervisorReviewDetail } from '../../../components/reviews/supervisor-reviews';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const SupervisorReviewDetailPage = () => {
  const navigate = useNavigate();
  const { canViewSupervisorReview, isSupervisor, isAdmin } = useReviewsPermissions();

  if (!canViewSupervisorReview && !isSupervisor && !isAdmin) {
    return (
      <div className="supervisor-review-detail-page">
        <div className="supervisor-review-detail-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view supervisor review details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supervisor-review-detail-page">
      <div className="supervisor-review-detail-page-header">
        <button className="supervisor-review-detail-page-back" onClick={() => navigate('/reviews/supervisor-reviews')}>
          <ArrowLeft size={20} />
          Back to Reviews
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Supervisor Reviews', path: '/reviews/supervisor-reviews' },
            { label: 'Details', path: '/reviews/supervisor-reviews/:id', isActive: true },
          ]}
        />
      </div>

      <SupervisorReviewDetail />
    </div>
  );
};

export default SupervisorReviewDetailPage;