// src/components/reviews/feedback/summaries/FeedbackSummary.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, RefreshCw, User, Calendar, Users, Star, FileText } from 'lucide-react';
import { useFeedback } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../../common';
import FeedbackSummaryView from './FeedbackSummaryView';
import FeedbackSummaryShare from './FeedbackSummaryShare';
import FeedbackSummaryCharts from './FeedbackSummaryCharts';

const FeedbackSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedSummary, 
    mySummary,
    summaryLoading, 
    summaryError, 
    fetchSummary, 
    fetchMySummary,
    regenerateSummary, 
    canManage 
  } = useFeedback();

  useEffect(() => {
    if (id) {
      fetchSummary(id);
    } else {
      fetchMySummary();
    }
  }, [id, fetchSummary, fetchMySummary]);

  const handleRefresh = () => {
    if (id) {
      fetchSummary(id);
    } else {
      fetchMySummary();
    }
  };

  const handleRegenerate = async () => {
    if (id) {
      await regenerateSummary(id);
      fetchSummary(id);
    }
  };

  if (summaryLoading) return <ReviewLoading size="lg" text="Loading feedback summary..." />;
  if (summaryError) return <ReviewError error={summaryError} onRetry={() => (id ? fetchSummary(id) : fetchMySummary())} />;

  const activeSummary = id ? selectedSummary : (mySummary || selectedSummary);

  if (!activeSummary) {
    return (
      <div className="feedback-summary-empty-container" style={{ padding: '3rem 1.5rem', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
        <FileText size={44} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
          No Feedback Summary Available Yet
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
          Your 360° feedback summary will be compiled here once all requested reviews for the appraisal cycle are submitted and shared.
        </p>
      </div>
    );
  }

  const summary = activeSummary;

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
              <FeedbackSummaryShare summary={summary} />
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
                {summary.subject_name}
              </span>
              <span className="feedback-summary-cycle">
                <Calendar size={16} />
                {summary.review_cycle_name}
              </span>
              <span className="feedback-summary-count">
                <Users size={16} />
                {summary.total_responses} responses
              </span>
              {summary.is_shared_with_subject && (
                <span className="feedback-summary-shared">
                  <Share2 size={14} />
                  Shared with Employee
                </span>
              )}
            </div>
          </div>
          <div className="feedback-summary-rating">
            <div className="feedback-summary-rating-value">
              {summary.overall_avg_rating ? summary.overall_avg_rating.toFixed(1) : '—'}
            </div>
            <div className="feedback-summary-rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  fill={summary.overall_avg_rating >= star ? '#f59e0b' : 'none'}
                  color={summary.overall_avg_rating >= star ? '#f59e0b' : '#d1d5db'}
                />
              ))}
            </div>
            <span className="feedback-summary-rating-label">Overall Average</span>
          </div>
        </div>

        <div className="feedback-summary-grid">
          <div className="feedback-summary-main">
            <FeedbackSummaryView summary={summary} />
          </div>
          <div className="feedback-summary-sidebar">
            <FeedbackSummaryCharts summary={summary} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSummary;