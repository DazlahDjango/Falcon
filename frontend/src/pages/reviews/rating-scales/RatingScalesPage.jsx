// src/pages/reviews/rating-scales/RatingScalesPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { RatingScaleList } from '../../../components/reviews/rating-scales';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const RatingScalesPage = () => {
  const navigate = useNavigate();
  const { canViewRatingScales } = useReviewsPermissions();

  if (!canViewRatingScales) {
    return (
      <div className="rating-scales-page">
        <div className="rating-scales-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view rating scales.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-scales-page">
      <div className="rating-scales-page-header">
        <button className="rating-scales-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Rating Scales', path: '/reviews/rating-scales', isActive: true },
          ]}
        />
        <h1 className="rating-scales-page-title">
          <Scale size={24} />
          Rating Scales
        </h1>
      </div>

      <RatingScaleList />
    </div>
  );
};

export default RatingScalesPage;