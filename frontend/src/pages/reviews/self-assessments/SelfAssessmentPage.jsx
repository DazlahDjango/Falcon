// src/pages/reviews/self-assessments/SelfAssessmentPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { SelfAssessmentForm } from '../../../components/reviews/self-assessments';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const SelfAssessmentPage = () => {
  const navigate = useNavigate();
  const { canViewSelfAssessment } = useReviewsPermissions();

  if (!canViewSelfAssessment) {
    return (
      <div className="self-assessment-page">
        <div className="self-assessment-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to access self assessments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="self-assessment-page">
      <div className="self-assessment-page-header">
        <button className="self-assessment-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Self Assessment', path: '/reviews/self-assessment', isActive: true },
          ]}
        />
        <h1 className="self-assessment-page-title">
          <FileText size={24} />
          Self Assessment
        </h1>
      </div>

      <SelfAssessmentForm />
    </div>
  );
};

export default SelfAssessmentPage;