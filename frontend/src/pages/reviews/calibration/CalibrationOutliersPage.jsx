// src/pages/reviews/calibration/CalibrationOutliersPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useReviewsPermissions, useCycles, useCalibration } from '../../../hooks/reviews';
import { CalibrationOutliers } from '../../../components/reviews/calibration';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';
import '../pages.css';

const CalibrationOutliersPage = () => {
  const navigate = useNavigate();
  const { canViewCalibration, isAdmin, isExecutive } = useReviewsPermissions();
  const [selectedCycle, setSelectedCycle] = useState(null);

  const { data: cycles, fetchAll: fetchCycles, loading: cyclesLoading } = useCycles();
  const { outliers, getOutliers, sessionLoading: outliersLoading } = useCalibration();

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  useEffect(() => {
    if (selectedCycle) {
      getOutliers(selectedCycle);
    }
  }, [selectedCycle, getOutliers]);

  if (!canViewCalibration && !isAdmin && !isExecutive) {
    return (
      <div className="reviews-page">
        <div className="reviews-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view calibration outliers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <div className="reviews-page-header">
        <button className="reviews-page-back" onClick={() => navigate('/reviews/calibration')}>
          <ArrowLeft size={20} />
          Back to Calibration
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Calibration', path: '/reviews/calibration' },
            { label: 'Outliers', path: '/reviews/calibration/outliers', isActive: true },
          ]}
        />
        <h1 className="reviews-page-title flex items-center gap-2">
          <AlertCircle size={24} className="text-red-500" />
          Calibration Outliers
        </h1>
      </div>

      <div className="reviews-page-filters">
        <div className="reviews-page-filter-group">
          <label className="reviews-page-filter-label">Select Review Cycle</label>
          <select
            className="reviews-page-filter-select"
            value={selectedCycle || ''}
            onChange={(e) => setSelectedCycle(e.target.value)}
          >
            <option value="">Select cycle...</option>
            {cyclesLoading ? (
              <option disabled>Loading cycles...</option>
            ) : (
              cycles && cycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {selectedCycle ? (
        outliersLoading ? (
          <div className="reviews-page-empty">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4">Analyzing calibration outliers...</p>
          </div>
        ) : (
          <div className="reviews-page-section">
            <div className="reviews-page-section-content">
              <CalibrationOutliers outliers={outliers} />
            </div>
          </div>
        )
      ) : (
        <div className="reviews-page-empty">
          <AlertCircle size={48} color="#d1d5db" className="mx-auto mb-4" />
          <h3>Select a Review Cycle</h3>
          <p>Please select a review cycle to view calibration outliers.</p>
        </div>
      )}
    </div>
  );
};

export default CalibrationOutliersPage;