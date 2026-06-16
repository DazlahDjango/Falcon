// src/pages/reviews/final-ratings/FinalRatingDetailPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { FinalRatingDetail } from '../../../components/reviews/final-ratings';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const FinalRatingDetailPage = () => {
  const navigate = useNavigate();
  const { canViewFinalRating } = useReviewsPermissions();

  if (!canViewFinalRating) {
    return (
      <div className="final-rating-detail-page">
        <div className="final-rating-detail-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view final rating details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="final-rating-detail-page">
      <div className="final-rating-detail-page-header">
        <button className="final-rating-detail-page-back" onClick={() => navigate('/reviews/final-ratings')}>
          <ArrowLeft size={20} />
          Back to Final Ratings
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Final Ratings', path: '/reviews/final-ratings' },
            { label: 'Details', path: '/reviews/final-ratings/:id', isActive: true },
          ]}
        />
      </div>

      <FinalRatingDetail />
    </div>
  );
};

export default FinalRatingDetailPage;