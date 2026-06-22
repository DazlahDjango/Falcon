// src/pages/reviews/promotions/PromotionDetailPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { PromotionDetail } from '../../../components/reviews/promotions';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const PromotionDetailPage = () => {
  const navigate = useNavigate();
  const { canViewPromotions, isAdmin, isExecutive } = useReviewsPermissions();

  if (!canViewPromotions && !isAdmin && !isExecutive) {
    return (
      <div className="promotion-detail-page">
        <div className="promotion-detail-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view promotion details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="promotion-detail-page">
      <div className="promotion-detail-page-header">
        <button className="promotion-detail-page-back" onClick={() => navigate('/reviews/promotions')}>
          <ArrowLeft size={20} />
          Back to Promotions
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Promotions', path: '/reviews/promotions' },
            { label: 'Details', path: '/reviews/promotions/:id', isActive: true },
          ]}
        />
      </div>

      <PromotionDetail />
    </div>
  );
};

export default PromotionDetailPage;