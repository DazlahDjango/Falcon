// src/components/reviews/dashboard/admin/CalibrationOverview.jsx
import React from 'react';
import { Gavel, Calendar, Users, CheckCircle } from 'lucide-react';

const CalibrationOverview = ({ overview }) => {
  if (!overview) return null;

  return (
    <div className="calibration-overview">
      <h3 className="calibration-overview-title">
        <Gavel size={18} />
        Calibration Oversight
      </h3>
      <div className="calibration-overview-stats">
        <div className="calibration-overview-stat">
          <span className="calibration-overview-value" style={{ color: '#3b82f6' }}>
            {overview.total_sessions || 0}
          </span>
          <span className="calibration-overview-label">Total Sessions</span>
        </div>
        <div className="calibration-overview-stat">
          <span className="calibration-overview-value" style={{ color: '#22c55e' }}>
            {overview.completed_this_month || 0}
          </span>
          <span className="calibration-overview-label">Completed (MTD)</span>
        </div>
        <div className="calibration-overview-stat">
          <span className="calibration-overview-value" style={{ color: '#f59e0b' }}>
            {overview.upcoming || 0}
          </span>
          <span className="calibration-overview-label">Upcoming</span>
        </div>
      </div>
    </div>
  );
};

export default CalibrationOverview;