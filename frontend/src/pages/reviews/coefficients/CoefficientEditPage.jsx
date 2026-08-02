// src/pages/reviews/coefficients/CoefficientEditPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import CoefficientEdit from '../../../components/reviews/coefficients/edit/CoefficientEdit';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CoefficientEditPage = () => {
  const navigate = useNavigate();
  const { canManageCoefficients, isAdmin } = useReviewsPermissions();

  if (!canManageCoefficients && !isAdmin) {
    return (
      <div className="coefficient-create-page">
        <div className="coefficient-create-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to edit coefficients.</p>
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
            { label: 'Edit', path: '/reviews/coefficients', isActive: true },
          ]}
        />
        <h1 className="coefficient-create-page-title">
          <Edit size={24} />
          Edit Coefficient
        </h1>
      </div>

      <CoefficientEdit />
    </div>
  );
};

export default CoefficientEditPage;
