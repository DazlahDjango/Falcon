// src/pages/reviews/templates/TemplateEditPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { TemplateEdit } from '../../../components/reviews/templates';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const TemplateEditPage = () => {
  const navigate = useNavigate();
  const { canManageTemplates, isAdmin } = useReviewsPermissions();

  if (!canManageTemplates && !isAdmin) {
    return (
      <div className="template-edit-page">
        <div className="template-edit-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to edit templates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="template-edit-page">
      <div className="template-edit-page-header">
        <button className="template-edit-page-back" onClick={() => navigate('/reviews/templates')}>
          <ArrowLeft size={20} />
          Back to Templates
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Templates', path: '/reviews/templates' },
            { label: 'Edit', path: '/reviews/templates/:id/edit', isActive: true },
          ]}
        />
        <h1 className="template-edit-page-title">
          <Edit size={24} />
          Edit Template
        </h1>
      </div>

      <TemplateEdit />
    </div>
  );
};

export default TemplateEditPage;