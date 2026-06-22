// src/pages/reviews/calibration/CalibrationReportPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CalibrationReport } from '../../../components/reviews/calibration';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CalibrationReportPage = () => {
  const navigate = useNavigate();
  const { canViewCalibration, isAdmin, isExecutive } = useReviewsPermissions();

  if (!canViewCalibration && !isAdmin && !isExecutive) {
    return (
      <div className="calibration-report-page">
        <div className="calibration-report-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view calibration reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calibration-report-page">
      <div className="calibration-report-page-header">
        <button className="calibration-report-page-back" onClick={() => navigate('/reviews/calibration/sessions')}>
          <ArrowLeft size={20} />
          Back to Sessions
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Calibration', path: '/reviews/calibration' },
            { label: 'Report', path: '/reviews/calibration/report', isActive: true },
          ]}
        />
        <h1 className="calibration-report-page-title">
          <FileText size={24} />
          Calibration Report
        </h1>
      </div>

      <CalibrationReport />
    </div>
  );
};

export default CalibrationReportPage;