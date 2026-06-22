// src/pages/reviews/reports/ReportExportPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { ReportExport } from '../../../components/reviews/reports';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const ReportExportPage = () => {
  const navigate = useNavigate();
  const { canExportReports } = useReviewsPermissions();

  if (!canExportReports) {
    return (
      <div className="report-export-page">
        <div className="report-export-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to export reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-export-page">
      <div className="report-export-page-header">
        <button className="report-export-page-back" onClick={() => navigate('/reviews/reports')}>
          <ArrowLeft size={20} />
          Back to Reports
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Reports', path: '/reviews/reports' },
            { label: 'Export', path: '/reviews/reports/export', isActive: true },
          ]}
        />
        <h1 className="report-export-page-title">Export Reports</h1>
      </div>

      <ReportExport />
    </div>
  );
};

export default ReportExportPage;