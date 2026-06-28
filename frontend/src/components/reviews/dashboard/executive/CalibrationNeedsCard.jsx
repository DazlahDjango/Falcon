// src/components/reviews/dashboard/executive/CalibrationNeedsCard.jsx
import React from 'react';
import { Gavel, AlertCircle, Users, TrendingUp } from 'lucide-react';

const CalibrationNeedsCard = ({ needs }) => {
  if (!needs) return null;

  return (
    <div className="calibration-needs-card">
      <h3 className="calibration-needs-card-title">
        <Gavel size={18} />
        Calibration Needs
      </h3>
      <div className="calibration-needs-card-stats">
        <div className="calibration-needs-card-stat">
          <span className="calibration-needs-card-value" style={{ color: '#ef4444' }}>
            {needs.outliers_count || 0}
          </span>
          <span className="calibration-needs-card-label">Outliers</span>
        </div>
        <div className="calibration-needs-card-stat">
          <span className="calibration-needs-card-value" style={{ color: '#f59e0b' }}>
            {needs.inconsistent_managers_count || 0}
          </span>
          <span className="calibration-needs-card-label">Inconsistent Managers</span>
        </div>
      </div>
      {needs.recommendations && (
        <div className="calibration-needs-card-recommendations">
          <span className="calibration-needs-card-recommendations-label">Recommendations</span>
          <div className="calibration-needs-card-recommendation">
            <span className="calibration-needs-card-recommendation-priority">High Priority</span>
            <span className="calibration-needs-card-recommendation-count">
              {needs.recommendations.high_priority?.length || 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalibrationNeedsCard;