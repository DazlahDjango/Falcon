// src/pages/reviews/final-ratings/RatingDistributionPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { RatingDistribution } from '../../../components/reviews/final-ratings';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const RatingDistributionPage = () => {
  const navigate = useNavigate();
  const { canViewFinalRating } = useReviewsPermissions();

  if (!canViewFinalRating) {
    return (
      <div className="rating-distribution-page">
        <div className="rating-distribution-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view rating distribution.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-distribution-page">
      <div className="rating-distribution-page-header">
        <button className="rating-distribution-page-back" onClick={() => navigate('/reviews/final-ratings')}>
          <ArrowLeft size={20} />
          Back to Final Ratings
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Final Ratings', path: '/reviews/final-ratings' },
            { label: 'Distribution', path: '/reviews/final-ratings/distribution', isActive: true },
          ]}
        />
        <h1 className="rating-distribution-page-title">
          <BarChart3 size={24} />
          Rating Distribution
        </h1>
      </div>

      <RatingDistribution />
    </div>
  );
};

export default RatingDistributionPage;