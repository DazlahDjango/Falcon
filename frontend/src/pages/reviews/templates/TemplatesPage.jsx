// src/pages/reviews/templates/TemplatesPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { TemplateList } from '../../../components/reviews/templates';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const TemplatesPage = () => {
  const navigate = useNavigate();
  const { canViewTemplates, isAdmin } = useReviewsPermissions();

  if (!canViewTemplates && !isAdmin) {
    return (
      <div className="templates-page">
        <div className="templates-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view templates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="templates-page">
      <div className="templates-page-header">
        <button className="templates-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Templates', path: '/reviews/templates', isActive: true },
          ]}
        />
        <h1 className="templates-page-title">
          <FileText size={24} />
          Review Templates
        </h1>
      </div>

      <TemplateList />
    </div>
  );
};

export default TemplatesPage;