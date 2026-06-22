// src/pages/reviews/competencies/CompetencyCreatePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CompetencyCreate } from '../../../components/reviews/competencies';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CompetencyCreatePage = () => {
  const navigate = useNavigate();
  const { canManageCompetencies, isAdmin } = useReviewsPermissions();

  if (!canManageCompetencies && !isAdmin) {
    return (
      <div className="competency-create-page">
        <div className="competency-create-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to create competencies.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="competency-create-page">
      <div className="competency-create-page-header">
        <button className="competency-create-page-back" onClick={() => navigate('/reviews/competencies')}>
          <ArrowLeft size={20} />
          Back to Competencies
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Competencies', path: '/reviews/competencies' },
            { label: 'Create', path: '/reviews/competencies/create', isActive: true },
          ]}
        />
        <h1 className="competency-create-page-title">
          <Plus size={24} />
          Create Competency
        </h1>
      </div>

      <CompetencyCreate />
    </div>
  );
};

export default CompetencyCreatePage;