// src/components/reviews/calibration/adjustments/CalibrationAdjustmentList.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus, User, Calendar } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';

const CalibrationAdjustmentList = ({ adjustments = [] }) => {
  if (adjustments.length === 0) {
    return (
      <div className="calibration-adjustment-list-empty">
        No adjustments made yet
      </div>
    );
  }

  const getGapIcon = (gap) => {
    if (gap === 0) return <Minus size={14} color="#6b7280" />;
    if (gap > 0) return <TrendingUp size={14} color="#22c55e" />;
    return <TrendingDown size={14} color="#ef4444" />;
  };

  const getGapColor = (gap) => {
    if (gap === 0) return '#6b7280';
    if (gap > 0) return '#22c55e';
    return '#ef4444';
  };

  return (
    <div className="calibration-adjustment-list">
      <div className="calibration-adjustment-list-header">
        <h3 className="calibration-adjustment-list-title">Adjustments ({adjustments.length})</h3>
      </div>
      <div className="calibration-adjustment-list-items">
        {adjustments.map((adjustment) => (
          <div key={adjustment.id} className="calibration-adjustment-item">
            <div className="calibration-adjustment-item-header">
              <div className="calibration-adjustment-item-employee">
                <User size={16} />
                <span>{adjustment.employee_name || 'Employee'}</span>
              </div>
              <div className="calibration-adjustment-item-status">
                <ReviewStatusBadge status={adjustment.status || 'calibrated'} size="sm" />
              </div>
            </div>
            <div className="calibration-adjustment-item-scores">
              <span className="calibration-adjustment-item-before">
                {adjustment.before_score}%
              </span>
              <span className="calibration-adjustment-item-arrow">→</span>
              <span className="calibration-adjustment-item-after" style={{ color: getGapColor(adjustment.adjustment_amount) }}>
                {adjustment.after_score}%
              </span>
              <span className="calibration-adjustment-item-gap" style={{ color: getGapColor(adjustment.adjustment_amount) }}>
                {getGapIcon(adjustment.adjustment_amount)}
                {adjustment.adjustment_amount > 0 ? '+' : ''}{adjustment.adjustment_amount?.toFixed(1)}%
              </span>
            </div>
            {adjustment.adjustment_reason && (
              <p className="calibration-adjustment-item-reason">{adjustment.adjustment_reason}</p>
            )}
            <div className="calibration-adjustment-item-footer">
              <span className="calibration-adjustment-item-adjusted-by">
                By {adjustment.adjusted_by_name || 'Unknown'}
              </span>
              <span className="calibration-adjustment-item-date">
                <Calendar size={12} />
                {new Date(adjustment.adjusted_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalibrationAdjustmentList;