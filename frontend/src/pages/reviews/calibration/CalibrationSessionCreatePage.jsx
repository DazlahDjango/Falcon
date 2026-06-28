// src/pages/reviews/calibration/CalibrationSessionCreatePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CalibrationSessionCreate } from '../../../components/reviews/calibration';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CalibrationSessionCreatePage = () => {
  const navigate = useNavigate();
  const { canManageCalibration, isAdmin } = useReviewsPermissions();

  if (!canManageCalibration && !isAdmin) {
    return (
      <div className="calibration-session-create-page">
        <div className="calibration-session-create-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to create calibration sessions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calibration-session-create-page">
      <div className="calibration-session-create-page-header">
        <button className="calibration-session-create-page-back" onClick={() => navigate('/reviews/calibration/sessions')}>
          <ArrowLeft size={20} />
          Back to Sessions
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Calibration', path: '/reviews/calibration' },
            { label: 'Sessions', path: '/reviews/calibration/sessions' },
            { label: 'Create', path: '/reviews/calibration/sessions/create', isActive: true },
          ]}
        />
        <h1 className="calibration-session-create-page-title">
          <Plus size={24} />
          Create Calibration Session
        </h1>
      </div>

      <CalibrationSessionCreate />
    </div>
  );
};

export default CalibrationSessionCreatePage;