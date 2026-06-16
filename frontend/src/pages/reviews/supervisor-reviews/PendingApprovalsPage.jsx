// src/pages/reviews/supervisor-reviews/PendingApprovalsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { PendingApprovals } from '../../../components/reviews/supervisor-reviews';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const PendingApprovalsPage = () => {
  const navigate = useNavigate();
  const { canApproveSupervisorReview, isAdmin } = useReviewsPermissions();

  if (!canApproveSupervisorReview && !isAdmin) {
    return (
      <div className="pending-approvals-page">
        <div className="pending-approvals-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view pending approvals.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-approvals-page">
      <div className="pending-approvals-page-header">
        <button className="pending-approvals-page-back" onClick={() => navigate('/reviews/supervisor-reviews')}>
          <ArrowLeft size={20} />
          Back to Reviews
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Supervisor Reviews', path: '/reviews/supervisor-reviews' },
            { label: 'Pending Approvals', path: '/reviews/supervisor-reviews/approvals', isActive: true },
          ]}
        />
        <h1 className="pending-approvals-page-title">
          <CheckCircle size={24} />
          Pending Approvals
        </h1>
      </div>

      <PendingApprovals />
    </div>
  );
};

export default PendingApprovalsPage;