// src/components/reviews/calibration/analytics/CalibrationOutliers.jsx
import React from 'react';
import { AlertTriangle, User, Building, TrendingUp, TrendingDown } from 'lucide-react';

const CalibrationOutliers = ({ outliers }) => {
  if (!outliers || outliers.length === 0) {
    return (
      <div className="calibration-outliers-empty">
        <AlertTriangle size={24} />
        <p>No outliers detected in this session.</p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="calibration-outliers">
      <h3 className="calibration-outliers-title">
        <AlertTriangle size={18} />
        Outliers ({outliers.length})
      </h3>
      <div className="calibration-outliers-list">
        {outliers.map((outlier, index) => (
          <div key={index} className="calibration-outlier-item">
            <div className="calibration-outlier-item-header">
              <div className="calibration-outlier-item-employee">
                <User size={16} />
                <span>{outlier.employee}</span>
              </div>
              <div className="calibration-outlier-item-score" style={{ color: getScoreColor(outlier.score) }}>
                {outlier.score}%
              </div>
            </div>
            <div className="calibration-outlier-item-details">
              <span className="calibration-outlier-item-department">
                <Building size={12} />
                {outlier.department}
              </span>
              <span className="calibration-outlier-item-manager">
                Manager: {outlier.manager}
              </span>
            </div>
            <div className="calibration-outlier-item-reasons">
              {outlier.reasons.map((reason, i) => (
                <span key={i} className="calibration-outlier-item-reason">
                  <AlertTriangle size={12} />
                  {reason}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalibrationOutliers;