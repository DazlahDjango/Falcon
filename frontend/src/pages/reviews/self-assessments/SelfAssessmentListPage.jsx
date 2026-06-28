// src/pages/reviews/self-assessments/SelfAssessmentListPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, List } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { SelfAssessmentList } from '../../../components/reviews/self-assessments';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const SelfAssessmentListPage = () => {
  const navigate = useNavigate();
  const { canViewSelfAssessment, isAdmin } = useReviewsPermissions();

  if (!canViewSelfAssessment && !isAdmin) {
    return (
      <div className="self-assessment-list-page">
        <div className="self-assessment-list-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view self assessments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="self-assessment-list-page">
      <div className="self-assessment-list-page-header">
        <button className="self-assessment-list-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Self Assessments', path: '/reviews/self-assessments', isActive: true },
          ]}
        />
        <h1 className="self-assessment-list-page-title">
          <List size={24} />
          Self Assessments
        </h1>
      </div>

      <SelfAssessmentList />
    </div>
  );
};

export default SelfAssessmentListPage;