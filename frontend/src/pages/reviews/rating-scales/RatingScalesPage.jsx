// src/pages/reviews/rating-scales/RatingScalesPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { RatingScaleList } from '../../../components/reviews/rating-scales';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';
import '../pages.css';

const RatingScalesPage = () => {
  const navigate = useNavigate();
  const { canViewRatingScales } = useReviewsPermissions();

  if (!canViewRatingScales) {
    return (
      <div className="reviews-page">
        <div className="reviews-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view rating scales.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <div className="reviews-page-header">
        <button className="reviews-page-back" onClick={() => navigate('/reviews/settings')}>
          <ArrowLeft size={20} />
          Back to Settings
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Rating Scales', path: '/reviews/rating-scales', isActive: true },
          ]}
        />
        <h1 className="reviews-page-title flex items-center gap-2">
          <Scale size={28} className="text-blue-600" />
          Rating Scales
        </h1>
      </div>

      <div className="reviews-page-section">
        <div className="reviews-page-section-content">
          <RatingScaleList />
        </div>
      </div>
    </div>
  );
};

export default RatingScalesPage;