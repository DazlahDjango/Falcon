// src/pages/reviews/reports/PIPReportPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { PIPReport } from '../../../components/reviews/reports';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const PIPReportPage = () => {
  const navigate = useNavigate();
  const { canViewReports, isAdmin, isExecutive } = useReviewsPermissions();

  if (!canViewReports && !isAdmin && !isExecutive) {
    return (
      <div className="pip-report-page">
        <div className="pip-report-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view PIP reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pip-report-page">
      <div className="pip-report-page-header">
        <button className="pip-report-page-back" onClick={() => navigate('/reviews/reports')}>
          <ArrowLeft size={20} />
          Back to Reports
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Reports', path: '/reviews/reports' },
            { label: 'PIP Report', path: '/reviews/reports/pip', isActive: true },
          ]}
        />
        <h1 className="pip-report-page-title">PIP Performance Report</h1>
      </div>

      <PIPReport />
    </div>
  );
};

export default PIPReportPage;