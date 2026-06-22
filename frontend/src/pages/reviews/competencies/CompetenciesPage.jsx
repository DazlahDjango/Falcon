// src/pages/reviews/competencies/CompetenciesPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CompetencyList } from '../../../components/reviews/competencies';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CompetenciesPage = () => {
  const navigate = useNavigate();
  const { canViewCompetencies } = useReviewsPermissions();

  if (!canViewCompetencies) {
    return (
      <div className="competencies-page">
        <div className="competencies-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view competencies.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="competencies-page">
      <div className="competencies-page-header">
        <button className="competencies-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Competencies', path: '/reviews/competencies', isActive: true },
          ]}
        />
        <h1 className="competencies-page-title">
          <Target size={24} />
          Competencies
        </h1>
      </div>

      <CompetencyList />
    </div>
  );
};

export default CompetenciesPage;