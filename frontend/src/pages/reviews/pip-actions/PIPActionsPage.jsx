// src/pages/reviews/pip-actions/PIPActionsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, List } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { PIPActionList } from '../../../components/reviews/pip-actions';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const PIPActionsPage = () => {
  const navigate = useNavigate();
  const { canViewPIPs } = useReviewsPermissions();

  if (!canViewPIPs) {
    return (
      <div className="pip-actions-page">
        <div className="pip-actions-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view PIP actions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pip-actions-page">
      <div className="pip-actions-page-header">
        <button className="pip-actions-page-back" onClick={() => navigate('/reviews/pips')}>
          <ArrowLeft size={20} />
          Back to PIPs
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'PIP Actions', path: '/reviews/pip-actions', isActive: true },
          ]}
        />
        <h1 className="pip-actions-page-title">
          <List size={24} />
          PIP Actions
        </h1>
      </div>

      <PIPActionList />
    </div>
  );
};

export default PIPActionsPage;