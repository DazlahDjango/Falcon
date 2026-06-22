// src/pages/reviews/promotions/PromotionStatsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { PromotionStats } from '../../../components/reviews/promotions';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const PromotionStatsPage = () => {
  const navigate = useNavigate();
  const { canViewPromotions, isAdmin, isExecutive } = useReviewsPermissions();

  if (!canViewPromotions && !isAdmin && !isExecutive) {
    return (
      <div className="promotion-stats-page">
        <div className="promotion-stats-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view promotion statistics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="promotion-stats-page">
      <div className="promotion-stats-page-header">
        <button className="promotion-stats-page-back" onClick={() => navigate('/reviews/promotions')}>
          <ArrowLeft size={20} />
          Back to Promotions
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Promotions', path: '/reviews/promotions' },
            { label: 'Statistics', path: '/reviews/promotions/stats', isActive: true },
          ]}
        />
        <h1 className="promotion-stats-page-title">
          <BarChart3 size={24} />
          Promotion Statistics
        </h1>
      </div>

      <PromotionStats />
    </div>
  );
};

export default PromotionStatsPage;