// src/pages/reviews/reports/CycleReportPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CycleReport } from '../../../components/reviews/reports';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CycleReportPage = () => {
  const navigate = useNavigate();
  const { canViewReports } = useReviewsPermissions();
  const [selectedCycle, setSelectedCycle] = useState(null);

  if (!canViewReports) {
    return (
      <div className="cycle-report-page">
        <div className="cycle-report-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view cycle reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cycle-report-page">
      <div className="cycle-report-page-header">
        <button className="cycle-report-page-back" onClick={() => navigate('/reviews/reports')}>
          <ArrowLeft size={20} />
          Back to Reports
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Reports', path: '/reviews/reports' },
            { label: 'Cycle Report', path: '/reviews/reports/cycle', isActive: true },
          ]}
        />
        <h1 className="cycle-report-page-title">Cycle Performance Report</h1>
      </div>

      <div className="cycle-report-page-filters">
        <div className="cycle-report-page-filter-group">
          <label className="cycle-report-page-filter-label">Select Review Cycle</label>
          <select
            className="cycle-report-page-filter-select"
            value={selectedCycle || ''}
            onChange={(e) => setSelectedCycle(e.target.value)}
          >
            <option value="">Select cycle...</option>
            {/* Cycle options would be populated from API */}
          </select>
        </div>
      </div>

      {selectedCycle ? (
        <CycleReport />
      ) : (
        <div className="cycle-report-page-empty">
          <Calendar size={48} color="#d1d5db" />
          <h3>Select a Review Cycle</h3>
          <p>Please select a review cycle to view the report.</p>
        </div>
      )}
    </div>
  );
};

export default CycleReportPage;