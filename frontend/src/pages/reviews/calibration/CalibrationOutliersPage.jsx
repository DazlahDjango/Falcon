// src/pages/reviews/calibration/CalibrationOutliersPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Calendar } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CalibrationOutliers } from '../../../components/reviews/calibration';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CalibrationOutliersPage = () => {
  const navigate = useNavigate();
  const { canViewCalibration, isAdmin, isExecutive } = useReviewsPermissions();
  const [selectedCycle, setSelectedCycle] = useState(null);

  if (!canViewCalibration && !isAdmin && !isExecutive) {
    return (
      <div className="calibration-outliers-page">
        <div className="calibration-outliers-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view calibration outliers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calibration-outliers-page">
      <div className="calibration-outliers-page-header">
        <button className="calibration-outliers-page-back" onClick={() => navigate('/reviews/calibration')}>
          <ArrowLeft size={20} />
          Back to Calibration
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Calibration', path: '/reviews/calibration' },
            { label: 'Outliers', path: '/reviews/calibration/outliers', isActive: true },
          ]}
        />
        <h1 className="calibration-outliers-page-title">
          <AlertCircle size={24} />
          Calibration Outliers
        </h1>
      </div>

      <div className="calibration-outliers-page-filters">
        <div className="calibration-outliers-page-filter-group">
          <label className="calibration-outliers-page-filter-label">Select Review Cycle</label>
          <select
            className="calibration-outliers-page-filter-select"
            value={selectedCycle || ''}
            onChange={(e) => setSelectedCycle(e.target.value)}
          >
            <option value="">Select cycle...</option>
            {/* Cycle options would be populated from API */}
          </select>
        </div>
      </div>

      {selectedCycle ? (
        <CalibrationOutliers />
      ) : (
        <div className="calibration-outliers-page-empty">
          <AlertCircle size={48} color="#d1d5db" />
          <h3>Select a Review Cycle</h3>
          <p>Please select a review cycle to view calibration outliers.</p>
        </div>
      )}
    </div>
  );
};

export default CalibrationOutliersPage;