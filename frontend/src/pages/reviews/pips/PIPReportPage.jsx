// src/pages/reviews/pips/PIPReportPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { PIPReport } from '../../../components/reviews/pips';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const PIPReportPage = () => {
  const navigate = useNavigate();
  const { canViewPIPs, isAdmin, isExecutive } = useReviewsPermissions();

  if (!canViewPIPs && !isAdmin && !isExecutive) {
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
        <button className="pip-report-page-back" onClick={() => navigate('/reviews/pips')}>
          <ArrowLeft size={20} />
          Back to PIPs
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'PIPs', path: '/reviews/pips' },
            { label: 'Report', path: '/reviews/pips/report', isActive: true },
          ]}
        />
        <h1 className="pip-report-page-title">
          <FileText size={24} />
          PIP Report
        </h1>
      </div>

      <PIPReport />
    </div>
  );
};

export default PIPReportPage;