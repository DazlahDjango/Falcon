// src/pages/reviews/reports/CalibrationReportPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gavel } from 'lucide-react';
import { useReviewsPermissions, useCalibration } from '../../../hooks/reviews';
import { CalibrationReport } from '../../../components/reviews/reports';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';
import '../pages.css';

const CalibrationReportPage = () => {
  const navigate = useNavigate();
  const { canViewReports, isAdmin, isExecutive } = useReviewsPermissions();
  const [selectedSession, setSelectedSession] = useState(null);

  const { sessionData: sessions, fetchSessions, sessionLoading: sessionsLoading } = useCalibration();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  if (!canViewReports && !isAdmin && !isExecutive) {
    return (
      <div className="reviews-page">
        <div className="reviews-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view calibration reports.</p>
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
            { label: 'Calibration Report', path: '/reviews/reports/calibration', isActive: true },
          ]}
        />
        <h1 className="reviews-page-title flex items-center gap-2">
          <Gavel size={28} className="text-cyan-500" />
          Calibration Report
        </h1>
      </div>

      <div className="reviews-page-filters">
        <div className="reviews-page-filter-group">
          <label className="reviews-page-filter-label">Select Calibration Session</label>
          <select
            className="reviews-page-filter-select"
            value={selectedSession || ''}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            <option value="">Select session...</option>
            {sessionsLoading ? (
              <option disabled>Loading sessions...</option>
            ) : (
              sessions && sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name} ({session.status})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {selectedSession ? (
        <div className="reviews-page-section">
          <div className="reviews-page-section-content">
            <CalibrationReport sessionId={selectedSession} />
          </div>
        </div>
      ) : (
        <div className="reviews-page-empty">
          <Gavel size={48} color="#d1d5db" className="mx-auto mb-4" />
          <h3>Select a Calibration Session</h3>
          <p>Please select a calibration session to view the report.</p>
        </div>
      )}
    </div>
  );
};

export default CalibrationReportPage;