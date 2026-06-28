// src/pages/reviews/rating-scales/RatingScaleCreatePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { RatingScaleCreate } from '../../../components/reviews/rating-scales';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const RatingScaleCreatePage = () => {
  const navigate = useNavigate();
  const { canManageRatingScales, isAdmin } = useReviewsPermissions();

  if (!canManageRatingScales && !isAdmin) {
    return (
      <div className="rating-scale-create-page">
        <div className="rating-scale-create-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to create rating scales.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-scale-create-page">
      <div className="rating-scale-create-page-header">
        <button className="rating-scale-create-page-back" onClick={() => navigate('/reviews/rating-scales')}>
          <ArrowLeft size={20} />
          Back to Rating Scales
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Rating Scales', path: '/reviews/rating-scales' },
            { label: 'Create', path: '/reviews/rating-scales/create', isActive: true },
          ]}
        />
        <h1 className="rating-scale-create-page-title">
          <Plus size={24} />
          Create Rating Scale
        </h1>
      </div>

      <RatingScaleCreate />
    </div>
  );
};

export default RatingScaleCreatePage;