// src/pages/reviews/promotions/PromotionsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { PromotionList } from '../../../components/reviews/promotions';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const PromotionsPage = () => {
  const navigate = useNavigate();
  const { canViewPromotions, isAdmin, isExecutive } = useReviewsPermissions();

  if (!canViewPromotions && !isAdmin && !isExecutive) {
    return (
      <div className="promotions-page">
        <div className="promotions-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view promotions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="promotions-page">
      <div className="promotions-page-header">
        <button className="promotions-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Promotions', path: '/reviews/promotions', isActive: true },
          ]}
        />
        <h1 className="promotions-page-title">
          <TrendingUp size={24} />
          Promotions
        </h1>
      </div>

      <PromotionList />
    </div>
  );
};

export default PromotionsPage;