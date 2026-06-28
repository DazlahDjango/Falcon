// src/pages/reviews/calibration/CalibrationSessionEditPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CalibrationSessionEdit } from '../../../components/reviews/calibration';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CalibrationSessionEditPage = () => {
  const navigate = useNavigate();
  const { canManageCalibration, isAdmin } = useReviewsPermissions();

  if (!canManageCalibration && !isAdmin) {
    return (
      <div className="calibration-session-edit-page">
        <div className="calibration-session-edit-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to edit calibration sessions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calibration-session-edit-page">
      <div className="calibration-session-edit-page-header">
        <button className="calibration-session-edit-page-back" onClick={() => navigate('/reviews/calibration/sessions')}>
          <ArrowLeft size={20} />
          Back to Sessions
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Calibration', path: '/reviews/calibration' },
            { label: 'Sessions', path: '/reviews/calibration/sessions' },
            { label: 'Edit', path: '/reviews/calibration/sessions/:id/edit', isActive: true },
          ]}
        />
        <h1 className="calibration-session-edit-page-title">
          <Edit size={24} />
          Edit Calibration Session
        </h1>
      </div>

      <CalibrationSessionEdit />
    </div>
  );
};

export default CalibrationSessionEditPage;