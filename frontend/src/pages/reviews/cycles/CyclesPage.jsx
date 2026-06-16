// src/pages/reviews/cycles/CyclesPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CycleList } from '../../../components/reviews/cycles';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CyclesPage = () => {
  const navigate = useNavigate();
  const { canViewCycles } = useReviewsPermissions();

  if (!canViewCycles) {
    return (
      <div className="cycles-page">
        <div className="cycles-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view review cycles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cycles-page">
      <div className="cycles-page-header">
        <button className="cycles-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Review Cycles', path: '/reviews/cycles', isActive: true },
          ]}
        />
        <h1 className="cycles-page-title">
          <RefreshCw size={24} />
          Review Cycles
        </h1>
      </div>

      <CycleList />
    </div>
  );
};

export default CyclesPage;