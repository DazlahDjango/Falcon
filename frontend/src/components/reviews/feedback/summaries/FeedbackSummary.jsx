// src/components/reviews/feedback/summaries/FeedbackSummary.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, RefreshCw, User, Calendar, Users, Star } from 'lucide-react';
import { useFeedback } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../../common';
import FeedbackSummaryView from './FeedbackSummaryView';
import FeedbackSummaryShare from './FeedbackSummaryShare';
import FeedbackSummaryCharts from './FeedbackSummaryCharts';

const FeedbackSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedSummary, summaryLoading, summaryError, fetchSummary, regenerateSummary, canManage } = useFeedback();

  useEffect(() => {
    if (id) {
      fetchSummary(id);
    }
  }, [id, fetchSummary]);

  const handleRefresh = () => {
    if (id) {
      fetchSummary(id);
    }
  };

  const handleRegenerate = async () => {
    if (id) {
      await regenerateSummary(id);
      fetchSummary(id);
    }
  };

  if (summaryLoading) return <ReviewLoading size="lg" text="Loading feedback summary..." />;
  if (summaryError) return <ReviewError error={summaryError} onRetry={() => fetchSummary(id)} />;
  if (!selectedSummary) return null;

  return (
    <div className="feedback-summary">
      <div className="feedback-summary-header">
        <button className="feedback-summary-back" onClick={() => navigate('/reviews/feedback/summaries')}>
          <ArrowLeft size={20} />
          Back to Summaries
        </button>
        <div className="feedback-summary-actions">
          <button className="feedback-summary-refresh" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
          {canManage && (
            <>
              <button className="btn btn-outline" onClick={handleRegenerate}>
                <RefreshCw size={18} />
                Regenerate
              </button>
              <FeedbackSummaryShare summary={selectedSummary} />
            </>
          )}
        </div>
      </div>

      <div className="feedback-summary-content">
        <div className="feedback-summary-top">
          <div className="feedback-summary-title-section">
            <h1 className="feedback-summary-title">Feedback Summary</h1>
            <div className="feedback-summary-meta">
              <span className="feedback-summary-subject">
                <User size={16} />
                {selectedSummary.subject_name}
              </span>
              <span className="feedback-summary-cycle">
                <Calendar size={16} />
                {selectedSummary.review_cycle_name}
              </span>
              <span className="feedback-summary-count">
                <Users size={16} />
                {selectedSummary.total_responses} responses
              </span>
              {selectedSummary.is_shared_with_subject && (
                <span className="feedback-summary-shared">
                  <Share2 size={14} />
                  Shared with Employee
                </span>
              )}
            </div>
          </div>
          <div className="feedback-summary-rating">
            <div className="feedback-summary-rating-value">
              {selectedSummary.overall_avg_rating ? selectedSummary.overall_avg_rating.toFixed(1) : '—'}
            </div>
            <div className="feedback-summary-rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  fill={selectedSummary.overall_avg_rating >= star ? '#f59e0b' : 'none'}
                  color={selectedSummary.overall_avg_rating >= star ? '#f59e0b' : '#d1d5db'}
                />
              ))}
            </div>
            <span className="feedback-summary-rating-label">Overall Average</span>
          </div>
        </div>

        <div className="feedback-summary-grid">
          <div className="feedback-summary-main">
            <FeedbackSummaryView summary={selectedSummary} />
          </div>
          <div className="feedback-summary-sidebar">
            <FeedbackSummaryCharts summary={selectedSummary} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSummary;