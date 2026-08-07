// src/pages/reviews/reports/ReportExportPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { ReportExport } from '../../../components/reviews/reports';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';
import '../pages.css';

const ReportExportPage = () => {
  const navigate = useNavigate();
  const { canExportReports } = useReviewsPermissions();

  if (!canExportReports) {
    return (
      <div className="reviews-page">
        <div className="reviews-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to export reports.</p>
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
            { label: 'Export', path: '/reviews/reports/export', isActive: true },
          ]}
        />
        <h1 className="reviews-page-title flex items-center gap-2">
          <Download size={28} className="text-green-600" />
          Export Reports
        </h1>
      </div>

      <div className="reviews-page-section">
        <div className="reviews-page-section-content">
          <ReportExport />
        </div>
      </div>
    </div>
  );
};

export default ReportExportPage;