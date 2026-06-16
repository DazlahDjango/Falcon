// src/pages/reviews/cycles/CycleDetailPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CycleDetail } from '../../../components/reviews/cycles';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CycleDetailPage = () => {
  const navigate = useNavigate();
  const { canViewCycles } = useReviewsPermissions();

  if (!canViewCycles) {
    return (
      <div className="cycle-detail-page">
        <div className="cycle-detail-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view cycle details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cycle-detail-page">
      <div className="cycle-detail-page-header">
        <button className="cycle-detail-page-back" onClick={() => navigate('/reviews/cycles')}>
          <ArrowLeft size={20} />
          Back to Cycles
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Review Cycles', path: '/reviews/cycles' },
            { label: 'Details', path: '/reviews/cycles/:id', isActive: true },
          ]}
        />
      </div>

      <CycleDetail />
    </div>
  );
};

export default CycleDetailPage;