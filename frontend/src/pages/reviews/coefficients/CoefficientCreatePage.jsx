// src/pages/reviews/coefficients/CoefficientCreatePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CoefficientCreate } from '../../../components/reviews/coefficients';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CoefficientCreatePage = () => {
  const navigate = useNavigate();
  const { canManageCoefficients, isAdmin } = useReviewsPermissions();

  if (!canManageCoefficients && !isAdmin) {
    return (
      <div className="coefficient-create-page">
        <div className="coefficient-create-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to create coefficients.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="coefficient-create-page">
      <div className="coefficient-create-page-header">
        <button className="coefficient-create-page-back" onClick={() => navigate('/reviews/coefficients')}>
          <ArrowLeft size={20} />
          Back to Coefficients
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Coefficients', path: '/reviews/coefficients' },
            { label: 'Create', path: '/reviews/coefficients/create', isActive: true },
          ]}
        />
        <h1 className="coefficient-create-page-title">
          <Plus size={24} />
          Create Coefficient
        </h1>
      </div>

      <CoefficientCreate />
    </div>
  );
};

export default CoefficientCreatePage;