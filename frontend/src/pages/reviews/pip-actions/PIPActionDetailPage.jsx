// src/pages/reviews/pip-actions/PIPActionDetailPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { PIPActionDetail } from '../../../components/reviews/pip-actions';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const PIPActionDetailPage = () => {
  const navigate = useNavigate();
  const { canViewPIPs } = useReviewsPermissions();

  if (!canViewPIPs) {
    return (
      <div className="pip-action-detail-page">
        <div className="pip-action-detail-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view PIP action details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pip-action-detail-page">
      <div className="pip-action-detail-page-header">
        <button className="pip-action-detail-page-back" onClick={() => navigate('/reviews/pip-actions')}>
          <ArrowLeft size={20} />
          Back to PIP Actions
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'PIP Actions', path: '/reviews/pip-actions' },
            { label: 'Details', path: '/reviews/pip-actions/:id', isActive: true },
          ]}
        />
      </div>

      <PIPActionDetail />
    </div>
  );
};

export default PIPActionDetailPage;