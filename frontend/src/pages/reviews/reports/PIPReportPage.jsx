// src/pages/reviews/reports/PIPReportPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { PIPReport } from '../../../components/reviews/reports';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';
import '../pages.css';

const PIPReportPage = () => {
  const navigate = useNavigate();
  const { canViewReports, isAdmin, isExecutive } = useReviewsPermissions();

  if (!canViewReports && !isAdmin && !isExecutive) {
    return (
      <div className="reviews-page">
        <div className="reviews-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view PIP reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <div className="reviews-page-header">
        <button className="reviews-page-back" onClick={() => navigate('/reviews/reports')}>
          <ArrowLeft size={20} />
          Back to Reports
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Reports', path: '/reviews/reports' },
            { label: 'PIP Report', path: '/reviews/reports/pip', isActive: true },
          ]}
        />
        <h1 className="reviews-page-title flex items-center gap-2">
          <AlertTriangle size={28} className="text-red-500" />
          PIP Performance Report
        </h1>
      </div>

      <div className="reviews-page-section">
        <div className="reviews-page-section-content">
          <PIPReport />
        </div>
      </div>
    </div>
  );
};

export default PIPReportPage;