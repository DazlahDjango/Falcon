// src/components/reviews/final-ratings/detail/FinalRatingDetail.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, RefreshCw, User, Calendar } from 'lucide-react';
import { useFinalRating } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge, ReviewScoreGauge } from '../../common';
import FinalRatingScoreBreakdown from './FinalRatingScoreBreakdown';
import FinalRatingActions from './FinalRatingActions';
import FinalRatingCalibration from './FinalRatingCalibration';

const FinalRatingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, recalculate, getStats, canManage } = useFinalRating();

  useEffect(() => {
    if (id) {
      fetchOne(id);
    }
  }, [id, fetchOne]);

  const handleRefresh = () => {
    if (id) {
      fetchOne(id);
    }
  };

  const handleRecalculate = async () => {
    if (id) {
      await recalculate(id);
      fetchOne(id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <ReviewLoading size="lg" text="Loading final rating..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(id)} />;
  if (!selected) return null;

  return (
    <div className="final-rating-detail">
      <div className="final-rating-detail-header">
        <button className="final-rating-detail-back" onClick={() => navigate('/reviews/final-ratings')}>
          <ArrowLeft size={20} />
          Back to Final Ratings
        </button>
        <div className="final-rating-detail-actions">
          <button className="final-rating-detail-refresh" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={18} />
            Print
          </button>
          {canManage && (
            <button className="btn btn-primary" onClick={handleRecalculate}>
              <RefreshCw size={18} />
              Recalculate
            </button>
          )}
        </div>
      </div>

      <div className="final-rating-detail-content">
        <div className="final-rating-detail-top">
          <div className="final-rating-detail-title-section">
            <div>
              <h1 className="final-rating-detail-title">Final Rating</h1>
              <div className="final-rating-detail-subtitle">
                <span className="final-rating-detail-employee">
                  <User size={16} />
                  {selected.employee_name}
                </span>
                <span className="final-rating-detail-cycle">
                  <Calendar size={16} />
                  {selected.review_cycle_name}
                </span>
              </div>
            </div>
            <div className="final-rating-detail-badges">
              <ReviewStatusBadge status={selected.status} size="lg" />
            </div>
          </div>

          <div className="final-rating-detail-score-summary">
            <div className="final-rating-detail-score-gauge">
              <ReviewScoreGauge
                score={selected.final_score || 0}
                label="Final Score"
                size="lg"
              />
            </div>
            <div className="final-rating-detail-score-info">
              <div className="final-rating-detail-score-label">
                {selected.final_rating_label || 'Not Rated'}
              </div>
              <div className="final-rating-detail-score-value">
                {selected.final_score !== null ? `${selected.final_score}%` : '—'}
              </div>
            </div>
          </div>
        </div>

        <div className="final-rating-detail-grid">
          <FinalRatingScoreBreakdown rating={selected} />
          <div className="final-rating-detail-sidebar">
            <FinalRatingActions rating={selected} onAction={handleRefresh} />
            <FinalRatingCalibration rating={selected} onCalibrate={handleRefresh} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalRatingDetail;