// src/pages/reviews/reports/CalibrationReportPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gavel, Calendar } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CalibrationReport } from '../../../components/reviews/reports';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CalibrationReportPage = () => {
  const navigate = useNavigate();
  const { canViewReports, isAdmin, isExecutive } = useReviewsPermissions();
  const [selectedCycle, setSelectedCycle] = useState(null);

  if (!canViewReports && !isAdmin && !isExecutive) {
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
        <button className="calibration-report-page-back" onClick={() => navigate('/reviews/reports')}>
          <ArrowLeft size={20} />
          Back to Reports
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Reports', path: '/reviews/reports' },
            { label: 'Calibration Report', path: '/reviews/reports/calibration', isActive: true },
          ]}
        />
        <h1 className="calibration-report-page-title">Calibration Report</h1>
      </div>

      <div className="calibration-report-page-filters">
        <div className="calibration-report-page-filter-group">
          <label className="calibration-report-page-filter-label">Select Review Cycle</label>
          <select
            className="calibration-report-page-filter-select"
            value={selectedCycle || ''}
            onChange={(e) => setSelectedCycle(e.target.value)}
          >
            <option value="">Select cycle...</option>
            {/* Cycle options would be populated from API */}
          </select>
        </div>
      </div>

      {selectedCycle ? (
        <CalibrationReport />
      ) : (
        <div className="calibration-report-page-empty">
          <Gavel size={48} color="#d1d5db" />
          <h3>Select a Review Cycle</h3>
          <p>Please select a review cycle to view the calibration report.</p>
        </div>
      )}
    </div>
  );
};

export default CalibrationReportPage;