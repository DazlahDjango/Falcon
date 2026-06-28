// src/pages/reviews/supervisor-reviews/ReviewQueuePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { ReviewQueue } from '../../../components/reviews/supervisor-reviews';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const ReviewQueuePage = () => {
  const navigate = useNavigate();
  const { canViewSupervisorDashboard, isSupervisor, isAdmin } = useReviewsPermissions();

  if (!canViewSupervisorDashboard && !isSupervisor && !isAdmin) {
    return (
      <div className="review-queue-page">
        <div className="review-queue-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view the review queue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-queue-page">
      <div className="review-queue-page-header">
        <button className="review-queue-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Supervisor Reviews', path: '/reviews/supervisor-reviews' },
            { label: 'Queue', path: '/reviews/supervisor-reviews/queue', isActive: true },
          ]}
        />
        <h1 className="review-queue-page-title">
          <Clock size={24} />
          Review Queue
        </h1>
      </div>

      <ReviewQueue />
    </div>
  );
};

export default ReviewQueuePage;