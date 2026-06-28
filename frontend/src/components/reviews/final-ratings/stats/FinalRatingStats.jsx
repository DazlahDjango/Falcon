// src/components/reviews/final-ratings/stats/FinalRatingStats.jsx
import React, { useState, useEffect } from 'react';
import { useFinalRating } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import ScoreStatistics from './ScoreStatistics';

const FinalRatingStats = ({ cycleId }) => {
  const { stats, loading, error, getStats } = useFinalRating();

  useEffect(() => {
    if (cycleId) {
      getStats(cycleId);
    }
  }, [cycleId, getStats]);

  if (loading) return <ReviewLoading size="md" text="Loading statistics..." />;
  if (error) return <ReviewError error={error} onRetry={() => getStats(cycleId)} />;
  if (!stats) return null;

  return (
    <div className="final-rating-stats">
      <h3 className="final-rating-stats-title">Statistics</h3>
      <div className="final-rating-stats-grid">
        <div className="final-rating-stats-item">
          <span className="final-rating-stats-value">{stats.total || 0}</span>
          <span className="final-rating-stats-label">Total Ratings</span>
        </div>
        <div className="final-rating-stats-item">
          <span className="final-rating-stats-value">
            {stats.average_score !== null ? `${stats.average_score}%` : '—'}
          </span>
          <span className="final-rating-stats-label">Average Score</span>
        </div>
        <div className="final-rating-stats-item">
          <span className="final-rating-stats-value">
            {stats.min_score !== null ? `${stats.min_score}%` : '—'}
          </span>
          <span className="final-rating-stats-label">Min Score</span>
        </div>
        <div className="final-rating-stats-item">
          <span className="final-rating-stats-value">
            {stats.max_score !== null ? `${stats.max_score}%` : '—'}
          </span>
          <span className="final-rating-stats-label">Max Score</span>
        </div>
        <div className="final-rating-stats-item">
          <span className="final-rating-stats-value">{stats.promotion_count || 0}</span>
          <span className="final-rating-stats-label">Promotions</span>
        </div>
        <div className="final-rating-stats-item">
          <span className="final-rating-stats-value">{stats.pip_count || 0}</span>
          <span className="final-rating-stats-label">PIPs</span>
        </div>
      </div>

      {stats.distribution && Object.keys(stats.distribution).length > 0 && (
        <ScoreStatistics distribution={stats.distribution} />
      )}
    </div>
  );
};

export default FinalRatingStats;