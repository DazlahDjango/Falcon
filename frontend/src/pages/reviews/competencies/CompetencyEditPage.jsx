// src/pages/reviews/competencies/CompetencyEditPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CompetencyEdit } from '../../../components/reviews/competencies';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CompetencyEditPage = () => {
  const navigate = useNavigate();
  const { canManageCompetencies, isAdmin } = useReviewsPermissions();

  if (!canManageCompetencies && !isAdmin) {
    return (
      <div className="competency-edit-page">
        <div className="competency-edit-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to edit competencies.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="competency-edit-page">
      <div className="competency-edit-page-header">
        <button className="competency-edit-page-back" onClick={() => navigate('/reviews/competencies')}>
          <ArrowLeft size={20} />
          Back to Competencies
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Competencies', path: '/reviews/competencies' },
            { label: 'Edit', path: '/reviews/competencies/:id/edit', isActive: true },
          ]}
        />
        <h1 className="competency-edit-page-title">
          <Edit size={24} />
          Edit Competency
        </h1>
      </div>

      <CompetencyEdit />
    </div>
  );
};

export default CompetencyEditPage;