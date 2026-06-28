// src/pages/reviews/pips/PIPDetailPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { PIPDetail } from '../../../components/reviews/pips';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const PIPDetailPage = () => {
  const navigate = useNavigate();
  const { canViewPIPs } = useReviewsPermissions();

  if (!canViewPIPs) {
    return (
      <div className="pip-detail-page">
        <div className="pip-detail-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view PIP details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pip-detail-page">
      <div className="pip-detail-page-header">
        <button className="pip-detail-page-back" onClick={() => navigate('/reviews/pips')}>
          <ArrowLeft size={20} />
          Back to PIPs
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'PIPs', path: '/reviews/pips' },
            { label: 'Details', path: '/reviews/pips/:id', isActive: true },
          ]}
        />
      </div>

      <PIPDetail />
    </div>
  );
};

export default PIPDetailPage;