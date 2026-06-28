// src/pages/reviews/coefficients/CoefficientsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CoefficientList } from '../../../components/reviews/coefficients';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CoefficientsPage = () => {
  const navigate = useNavigate();
  const { canViewCoefficients, isAdmin } = useReviewsPermissions();

  if (!canViewCoefficients && !isAdmin) {
    return (
      <div className="coefficients-page">
        <div className="coefficients-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view coefficients.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="coefficients-page">
      <div className="coefficients-page-header">
        <button className="coefficients-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Coefficients', path: '/reviews/coefficients', isActive: true },
          ]}
        />
        <h1 className="coefficients-page-title">
          <Calculator size={24} />
          Coefficients
        </h1>
      </div>

      <CoefficientList />
    </div>
  );
};

export default CoefficientsPage;