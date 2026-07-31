import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar } from 'lucide-react';
import { useReviewsPermissions, useCycles } from '../../../hooks/reviews';
import { FinalRatingStats } from '../../../components/reviews/final-ratings';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const FinalRatingStatsPage = () => {
  const navigate = useNavigate();
  const { canViewFinalRating, isAdmin, isExecutive } = useReviewsPermissions();
  const { data: cycles, fetchAll: fetchCycles, activeCycle, getActive } = useCycles();
  const [selectedCycle, setSelectedCycle] = useState(null);

  useEffect(() => {
    fetchCycles();
    getActive();
  }, [fetchCycles, getActive]);

  useEffect(() => {
    if (activeCycle && !selectedCycle) {
      setSelectedCycle(activeCycle.id);
    } else if (cycles.length > 0 && !selectedCycle) {
      setSelectedCycle(cycles[0].id);
    }
  }, [activeCycle, cycles, selectedCycle]);

  if (!canViewFinalRating && !isAdmin && !isExecutive) {
    return (
      <div className="final-rating-stats-page">
        <div className="final-rating-stats-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view final rating statistics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="final-rating-stats-page">
      <div className="final-rating-stats-page-header">
        <button className="final-rating-stats-page-back" onClick={() => navigate('/reviews/final-ratings')}>
          <ArrowLeft size={20} />
          Back to Final Ratings
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Final Ratings', path: '/reviews/final-ratings' },
            { label: 'Statistics', path: '/reviews/final-ratings/stats', isActive: true },
          ]}
        />
        <h1 className="final-rating-stats-page-title">
          <TrendingUp size={24} />
          Final Rating Statistics
        </h1>
      </div>

      <div className="reviews-page-filters">
        <div className="reviews-page-filter-group">
          <label className="reviews-page-filter-label">Select Review Cycle</label>
          <select
            className="reviews-page-filter-select"
            value={selectedCycle || ''}
            onChange={(e) => setSelectedCycle(e.target.value)}
          >
            <option value="">Select cycle...</option>
            {cycles.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name} ({cycle.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCycle ? (
        <FinalRatingStats cycleId={selectedCycle} />
      ) : (
        <div className="final-rating-stats-page-empty">
          <TrendingUp size={48} color="#d1d5db" />
          <h3>Select a Review Cycle</h3>
          <p>Please select a review cycle to view statistics.</p>
        </div>
      )}
    </div>
  );
};

export default FinalRatingStatsPage;