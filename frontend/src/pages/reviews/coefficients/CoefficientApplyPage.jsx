// src/pages/reviews/coefficients/CoefficientApplyPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CoefficientApply } from '../../../components/reviews/coefficients';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CoefficientApplyPage = () => {
  const navigate = useNavigate();
  const { canViewCoefficients } = useReviewsPermissions();

  return (
    <div className="coefficient-apply-page">
      <div className="coefficient-apply-page-header">
        <button className="coefficient-apply-page-back" onClick={() => navigate('/reviews/coefficients')}>
          <ArrowLeft size={20} />
          Back to Coefficients
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Coefficients', path: '/reviews/coefficients' },
            { label: 'Apply', path: '/reviews/coefficients/apply', isActive: true },
          ]}
        />
        <h1 className="coefficient-apply-page-title">
          <Calculator size={24} />
          Apply Coefficient
        </h1>
      </div>

      <CoefficientApply />
    </div>
  );
};

export default CoefficientApplyPage;