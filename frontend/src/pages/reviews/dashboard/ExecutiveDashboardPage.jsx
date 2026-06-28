// src/pages/reviews/dashboard/ExecutiveDashboardPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { ExecutiveDashboard } from '../../../components/reviews/dashboard';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const ExecutiveDashboardPage = () => {
  const navigate = useNavigate();
  const { canViewExecutiveDashboard, isExecutive, isAdmin } = useReviewsPermissions();

  if (!canViewExecutiveDashboard && !isExecutive && !isAdmin) {
    return (
      <div className="executive-dashboard-page">
        <div className="executive-dashboard-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view the executive dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="executive-dashboard-page">
      <div className="executive-dashboard-page-header">
        <button className="executive-dashboard-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Reviews
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Dashboard', path: '/reviews/dashboard/executive', isActive: true },
          ]}
        />
        <h1 className="executive-dashboard-page-title">
          <TrendingUp size={24} />
          Executive Dashboard
        </h1>
      </div>

      <ExecutiveDashboard />
    </div>
  );
};

export default ExecutiveDashboardPage;