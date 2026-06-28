// src/components/reviews/calibration/detail/CalibrationRatingList.jsx
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectAllCalibrationRatings } from '../../../../store/reviews/selectors';
import { useCalibration } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewStatusBadge } from '../../common';
import { TrendingUp, TrendingDown, Minus, User } from 'lucide-react';

const CalibrationRatingList = ({ sessionId }) => {
  const { fetchRatingsForSession, ratingLoading } = useCalibration();
  const ratings = useSelector(selectAllCalibrationRatings);

  useEffect(() => {
    if (sessionId) {
      fetchRatingsForSession(sessionId);
    }
  }, [sessionId, fetchRatingsForSession]);

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

  if (ratingLoading) return <ReviewLoading size="sm" text="Loading ratings..." />;

  if (!ratings || ratings.length === 0) {
    return (
      <div className="calibration-rating-list">
        <h3 className="calibration-rating-list-title">Rating Adjustments</h3>
        <div className="calibration-rating-list-empty">No rating adjustments yet</div>
      </div>
    );
  }

  return (
    <div className="calibration-rating-list">
      <h3 className="calibration-rating-list-title">
        Rating Adjustments ({ratings.length})
      </h3>
      <div className="calibration-rating-list-items">
        {ratings.map((rating, index) => (
          <div key={rating.id || index} className="calibration-rating-item">
            <div className="calibration-rating-item-header">
              <div className="calibration-rating-item-employee">
                <User size={16} />
                <span>{rating.employee_name || 'Employee'}</span>
              </div>
              <span className="calibration-rating-item-adjustment" style={{ color: getGapColor(rating.adjustment_amount) }}>
                {getGapIcon(rating.adjustment_amount)}
                {rating.adjustment_amount > 0 ? '+' : ''}{rating.adjustment_amount?.toFixed(1)}%
              </span>
            </div>
            <div className="calibration-rating-item-scores">
              <span className="calibration-rating-item-before">
                Before: {rating.before_score}%
              </span>
              <span className="calibration-rating-item-after">
                After: {rating.after_score}%
              </span>
            </div>
            {rating.adjustment_reason && (
              <p className="calibration-rating-item-reason">{rating.adjustment_reason}</p>
            )}
            <div className="calibration-rating-item-footer">
              <span className="calibration-rating-item-adjusted-by">
                Adjusted by {rating.adjusted_by_name || 'Unknown'}
              </span>
              <span className="calibration-rating-item-date">
                {new Date(rating.adjusted_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalibrationRatingList;