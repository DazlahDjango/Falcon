// src/pages/reviews/templates/TemplateDetailPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { TemplateDetail } from '../../../components/reviews/templates';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const TemplateDetailPage = () => {
  const navigate = useNavigate();
  const { canViewTemplates, isAdmin } = useReviewsPermissions();

  if (!canViewTemplates && !isAdmin) {
    return (
      <div className="template-detail-page">
        <div className="template-detail-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view template details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="template-detail-page">
      <div className="template-detail-page-header">
        <button className="template-detail-page-back" onClick={() => navigate('/reviews/templates')}>
          <ArrowLeft size={20} />
          Back to Templates
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Templates', path: '/reviews/templates' },
            { label: 'Details', path: '/reviews/templates/:id', isActive: true },
          ]}
        />
      </div>

      <TemplateDetail />
    </div>
  );
};

export default TemplateDetailPage;