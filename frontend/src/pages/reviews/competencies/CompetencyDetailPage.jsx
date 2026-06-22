// src/pages/reviews/competencies/CompetencyDetailPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CompetencyDetail } from '../../../components/reviews/competencies';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CompetencyDetailPage = () => {
  const navigate = useNavigate();
  const { canViewCompetencies } = useReviewsPermissions();

  if (!canViewCompetencies) {
    return (
      <div className="competency-detail-page">
        <div className="competency-detail-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view competency details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="competency-detail-page">
      <div className="competency-detail-page-header">
        <button className="competency-detail-page-back" onClick={() => navigate('/reviews/competencies')}>
          <ArrowLeft size={20} />
          Back to Competencies
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Competencies', path: '/reviews/competencies' },
            { label: 'Details', path: '/reviews/competencies/:id', isActive: true },
          ]}
        />
      </div>

      <CompetencyDetail />
    </div>
  );
};

export default CompetencyDetailPage;