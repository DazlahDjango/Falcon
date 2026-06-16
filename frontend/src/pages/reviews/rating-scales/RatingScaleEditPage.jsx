// src/pages/reviews/rating-scales/RatingScaleEditPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { RatingScaleEdit } from '../../../components/reviews/rating-scales';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const RatingScaleEditPage = () => {
  const navigate = useNavigate();
  const { canManageRatingScales, isAdmin } = useReviewsPermissions();

  if (!canManageRatingScales && !isAdmin) {
    return (
      <div className="rating-scale-edit-page">
        <div className="rating-scale-edit-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to edit rating scales.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-scale-edit-page">
      <div className="rating-scale-edit-page-header">
        <button className="rating-scale-edit-page-back" onClick={() => navigate('/reviews/rating-scales')}>
          <ArrowLeft size={20} />
          Back to Rating Scales
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Rating Scales', path: '/reviews/rating-scales' },
            { label: 'Edit', path: '/reviews/rating-scales/:id/edit', isActive: true },
          ]}
        />
        <h1 className="rating-scale-edit-page-title">
          <Edit size={24} />
          Edit Rating Scale
        </h1>
      </div>

      <RatingScaleEdit />
    </div>
  );
};

export default RatingScaleEditPage;