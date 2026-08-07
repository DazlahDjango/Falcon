// src/pages/reviews/reports/CycleReportPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useReviewsPermissions, useCycles } from '../../../hooks/reviews';
import { CycleReport } from '../../../components/reviews/reports';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';
import '../pages.css';

const CycleReportPage = () => {
  const navigate = useNavigate();
  const { canViewReports } = useReviewsPermissions();
  const [selectedCycle, setSelectedCycle] = useState(null);

  const { data: cycles, fetchAll: fetchCycles, loading: cyclesLoading } = useCycles();

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  if (!canViewReports) {
    return (
      <div className="reviews-page">
        <div className="reviews-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view cycle reports.</p>
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
            { label: 'Cycle Report', path: '/reviews/reports/cycle', isActive: true },
          ]}
        />
        <h1 className="reviews-page-title flex items-center gap-2">
          <Calendar size={28} className="text-orange-500" />
          Cycle Performance Report
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
        <div className="reviews-page-section">
          <div className="reviews-page-section-content">
            <CycleReport cycleId={selectedCycle} />
          </div>
        </div>
      ) : (
        <div className="reviews-page-empty">
          <Calendar size={48} color="#d1d5db" className="mx-auto mb-4" />
          <h3>Select a Review Cycle</h3>
          <p>Please select a review cycle to view the report.</p>
        </div>
      )}
    </div>
  );
};

export default CycleReportPage;