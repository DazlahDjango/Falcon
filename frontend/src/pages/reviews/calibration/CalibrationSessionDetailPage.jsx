// src/pages/reviews/calibration/CalibrationSessionDetailPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CalibrationSessionDetail } from '../../../components/reviews/calibration';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CalibrationSessionDetailPage = () => {
  const navigate = useNavigate();
  const { canViewCalibration, isAdmin, isExecutive } = useReviewsPermissions();

  if (!canViewCalibration && !isAdmin && !isExecutive) {
    return (
      <div className="calibration-session-detail-page">
        <div className="calibration-session-detail-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view calibration session details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calibration-session-detail-page">
      <div className="calibration-session-detail-page-header">
        <button className="calibration-session-detail-page-back" onClick={() => navigate('/reviews/calibration/sessions')}>
          <ArrowLeft size={20} />
          Back to Sessions
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Calibration', path: '/reviews/calibration' },
            { label: 'Sessions', path: '/reviews/calibration/sessions' },
            { label: 'Session Details', path: '/reviews/calibration/sessions/:id', isActive: true },
          ]}
        />
      </div>

      <CalibrationSessionDetail />
    </div>
  );
};

export default CalibrationSessionDetailPage;