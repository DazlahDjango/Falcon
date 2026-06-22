// src/pages/reviews/supervisor-reviews/SupervisorReviewListPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, List } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { SupervisorReviewList } from '../../../components/reviews/supervisor-reviews';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const SupervisorReviewListPage = () => {
  const navigate = useNavigate();
  const { canViewSupervisorReview, isSupervisor, isAdmin } = useReviewsPermissions();

  if (!canViewSupervisorReview && !isSupervisor && !isAdmin) {
    return (
      <div className="supervisor-review-list-page">
        <div className="supervisor-review-list-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view supervisor reviews.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supervisor-review-list-page">
      <div className="supervisor-review-list-page-header">
        <button className="supervisor-review-list-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Supervisor Reviews', path: '/reviews/supervisor-reviews', isActive: true },
          ]}
        />
        <h1 className="supervisor-review-list-page-title">
          <List size={24} />
          All Supervisor Reviews
        </h1>
      </div>

      <SupervisorReviewList />
    </div>
  );
};

export default SupervisorReviewListPage;