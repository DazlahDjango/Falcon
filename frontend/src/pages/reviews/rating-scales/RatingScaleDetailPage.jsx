// src/pages/reviews/rating-scales/RatingScaleDetailPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { RatingScaleDetail } from '../../../components/reviews/rating-scales';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const RatingScaleDetailPage = () => {
  const navigate = useNavigate();
  const { canViewRatingScales } = useReviewsPermissions();

  if (!canViewRatingScales) {
    return (
      <div className="rating-scale-detail-page">
        <div className="rating-scale-detail-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view rating scale details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-scale-detail-page">
      <div className="rating-scale-detail-page-header">
        <button className="rating-scale-detail-page-back" onClick={() => navigate('/reviews/rating-scales')}>
          <ArrowLeft size={20} />
          Back to Rating Scales
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Rating Scales', path: '/reviews/rating-scales' },
            { label: 'Details', path: '/reviews/rating-scales/:id', isActive: true },
          ]}
        />
      </div>

      <RatingScaleDetail />
    </div>
  );
};

export default RatingScaleDetailPage;