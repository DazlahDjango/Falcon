// src/pages/reviews/calibration/CalibrationSessionsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gavel } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CalibrationSessionList } from '../../../components/reviews/calibration';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CalibrationSessionsPage = () => {
  const navigate = useNavigate();
  const { canViewCalibration, isAdmin, isExecutive } = useReviewsPermissions();

  if (!canViewCalibration && !isAdmin && !isExecutive) {
    return (
      <div className="calibration-sessions-page">
        <div className="calibration-sessions-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view calibration sessions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calibration-sessions-page">
      <div className="calibration-sessions-page-header">
        <button className="calibration-sessions-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Calibration', path: '/reviews/calibration' },
            { label: 'Sessions', path: '/reviews/calibration/sessions', isActive: true },
          ]}
        />
        <h1 className="calibration-sessions-page-title">
          <Gavel size={24} />
          Calibration Sessions
        </h1>
      </div>

      <CalibrationSessionList />
    </div>
  );
};

export default CalibrationSessionsPage;