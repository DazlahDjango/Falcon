// src/pages/reviews/final-ratings/FinalRatingsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { FinalRatingList } from '../../../components/reviews/final-ratings';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const FinalRatingsPage = () => {
  const navigate = useNavigate();
  const { canViewFinalRating } = useReviewsPermissions();

  if (!canViewFinalRating) {
    return (
      <div className="final-ratings-page">
        <div className="final-ratings-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view final ratings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="final-ratings-page">
      <div className="final-ratings-page-header">
        <button className="final-ratings-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Final Ratings', path: '/reviews/final-ratings', isActive: true },
          ]}
        />
        <h1 className="final-ratings-page-title">
          <Star size={24} />
          Final Ratings
        </h1>
      </div>

      <FinalRatingList />
    </div>
  );
};

export default FinalRatingsPage;