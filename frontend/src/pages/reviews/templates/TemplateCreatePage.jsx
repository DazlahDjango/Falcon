// src/pages/reviews/templates/TemplateCreatePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { TemplateCreate } from '../../../components/reviews/templates';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const TemplateCreatePage = () => {
  const navigate = useNavigate();
  const { canManageTemplates, isAdmin } = useReviewsPermissions();

  if (!canManageTemplates && !isAdmin) {
    return (
      <div className="template-create-page">
        <div className="template-create-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to create templates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="template-create-page">
      <div className="template-create-page-header">
        <button className="template-create-page-back" onClick={() => navigate('/reviews/templates')}>
          <ArrowLeft size={20} />
          Back to Templates
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Templates', path: '/reviews/templates' },
            { label: 'Create', path: '/reviews/templates/create', isActive: true },
          ]}
        />
        <h1 className="template-create-page-title">
          <Plus size={24} />
          Create Template
        </h1>
      </div>

      <TemplateCreate />
    </div>
  );
};

export default TemplateCreatePage;