// src/pages/reviews/promotions/PromotionCreatePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { PromotionCreate } from '../../../components/reviews/promotions';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const PromotionCreatePage = () => {
  const navigate = useNavigate();
  const { canManagePromotions, isAdmin } = useReviewsPermissions();

  if (!canManagePromotions && !isAdmin) {
    return (
      <div className="promotion-create-page">
        <div className="promotion-create-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to create promotions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="promotion-create-page">
      <div className="promotion-create-page-header">
        <button className="promotion-create-page-back" onClick={() => navigate('/reviews/promotions')}>
          <ArrowLeft size={20} />
          Back to Promotions
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Promotions', path: '/reviews/promotions' },
            { label: 'Create', path: '/reviews/promotions/create', isActive: true },
          ]}
        />
        <h1 className="promotion-create-page-title">
          <Plus size={24} />
          Create Promotion
        </h1>
      </div>

      <PromotionCreate />
    </div>
  );
};

export default PromotionCreatePage;