// src/pages/reviews/self-assessments/SelfAssessmentViewPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { SelfAssessmentDetail } from '../../../components/reviews/self-assessments';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const SelfAssessmentViewPage = () => {
  const navigate = useNavigate();
  const { canViewSelfAssessment } = useReviewsPermissions();

  if (!canViewSelfAssessment) {
    return (
      <div className="self-assessment-view-page">
        <div className="self-assessment-view-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view self assessments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="self-assessment-view-page">
      <div className="self-assessment-view-page-header">
        <button className="self-assessment-view-page-back" onClick={() => navigate('/reviews/self-assessment')}>
          <ArrowLeft size={20} />
          Back to Self Assessment
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Self Assessment', path: '/reviews/self-assessment' },
            { label: 'View', path: '/reviews/self-assessment/view', isActive: true },
          ]}
        />
        <h1 className="self-assessment-view-page-title">
          <Eye size={24} />
          View Self Assessment
        </h1>
      </div>

      <SelfAssessmentDetail />
    </div>
  );
};

export default SelfAssessmentViewPage;