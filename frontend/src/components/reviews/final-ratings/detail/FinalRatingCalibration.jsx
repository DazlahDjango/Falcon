// src/components/reviews/final-ratings/detail/FinalRatingCalibration.jsx
import React, { useState } from 'react';
import { Scale, Save, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useFinalRating } from '../../../../hooks/reviews';
import { ReviewConfirmDialog } from '../../common';

const FinalRatingCalibration = ({ rating, onCalibrate }) => {
  const { calibrate, recalibrate, canManage } = useFinalRating();
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  const [calibrationData, setCalibrationData] = useState({
    adjusted_score: rating.final_score || 0,
    reason: '',
  });
  const [showConfirm, setShowConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const canCalibrate = canManage && (rating.status === 'pending' || rating.status === 'calibrated');

  const handleCalibrate = async () => {
    if (!calibrationData.reason) {
      alert('Please provide a reason for calibration');
      return;
    }
    setIsLoading(true);
    try {
      await calibrate(rating.id, calibrationData.adjusted_score, calibrationData.reason);
      setShowCalibration(false);
      onCalibrate();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalibrate = async () => {
    setIsLoading(true);
    try {
      await recalibrate(rating.id);
      onCalibrate();
    } finally {
      setIsLoading(false);
    }
  };

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

  const adjustment = rating.calibration_adjustment;
  const hasAdjustment = adjustment !== null && adjustment !== undefined;

  return (
    <div className="final-rating-calibration">
      <div className="final-rating-calibration-header">
        <h3 className="final-rating-calibration-title">Calibration</h3>
        {canCalibrate && !showCalibration && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setShowCalibration(true)}
          >
            <Scale size={16} />
            Calibrate
          </button>
        )}
      </div>

      {hasAdjustment && (
        <div className="final-rating-calibration-info">
          <div className="final-rating-calibration-adjustment">
            <span className="final-rating-calibration-adjustment-label">Adjustment</span>
            <span
              className="final-rating-calibration-adjustment-value"
              style={{ color: getGapColor(adjustment) }}
            >
              {getGapIcon(adjustment)}
              {adjustment > 0 ? '+' : ''}{adjustment.toFixed(1)}%
            </span>
          </div>
          {rating.calibration_adjustment_reason && (
            <div className="final-rating-calibration-reason">
              <span className="final-rating-calibration-reason-label">Reason</span>
              <p className="final-rating-calibration-reason-text">
                {rating.calibration_adjustment_reason}
              </p>
            </div>
          )}
          {canCalibrate && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setShowConfirm({
                  title: 'Recalibrate Rating',
                  message: `Are you sure you want to remove the calibration adjustment and reset this rating to pending?`,
                  variant: 'warning',
                  action: handleRecalibrate,
                });
              }}
              disabled={isLoading}
            >
              <RefreshCw size={14} />
              Reset Calibration
            </button>
          )}
        </div>
      )}

      {showCalibration && (
        <div className="final-rating-calibration-form">
          <div className="final-rating-calibration-form-group">
            <label className="final-rating-calibration-form-label">Adjusted Score</label>
            <input
              type="number"
              className="final-rating-calibration-form-input"
              value={calibrationData.adjusted_score}
              onChange={(e) => setCalibrationData({
                ...calibrationData,
                adjusted_score: Number(e.target.value),
              })}
              min={0}
              max={100}
              step={0.5}
            />
            <span className="final-rating-calibration-form-hint">
              Original: {rating.final_score}%
            </span>
          </div>

          <div className="final-rating-calibration-form-group">
            <label className="final-rating-calibration-form-label">Reason *</label>
            <textarea
              className="final-rating-calibration-form-textarea"
              value={calibrationData.reason}
              onChange={(e) => setCalibrationData({
                ...calibrationData,
                reason: e.target.value,
              })}
              placeholder="Explain the reason for calibration..."
              rows={3}
            />
          </div>

          <div className="final-rating-calibration-form-actions">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowCalibration(false)}
            >
              <X size={16} />
              Cancel
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setShowConfirm({
                  title: 'Apply Calibration',
                  message: `Are you sure you want to calibrate this rating to ${calibrationData.adjusted_score}%?`,
                  variant: 'primary',
                  action: handleCalibrate,
                });
              }}
              disabled={isLoading || !calibrationData.reason}
            >
              <Save size={16} />
              Apply Calibration
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <ReviewConfirmDialog
          isOpen={true}
          onClose={() => setShowConfirm(null)}
          onConfirm={() => {
            const action = showConfirm.action;
            setShowConfirm(null);
            action();
          }}
          title={showConfirm.title}
          message={showConfirm.message}
          variant={showConfirm.variant}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default FinalRatingCalibration;