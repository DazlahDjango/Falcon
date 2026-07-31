import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { useReviewsPermissions, useCycles } from '../../../hooks/reviews';
import { RatingDistribution } from '../../../components/reviews/final-ratings';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const RatingDistributionPage = () => {
  const navigate = useNavigate();
  const { canViewFinalRating } = useReviewsPermissions();
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

  if (!canViewFinalRating) {
    return (
      <div className="rating-distribution-page">
        <div className="rating-distribution-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view rating distribution.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-distribution-page">
      <div className="rating-distribution-page-header">
        <button className="rating-distribution-page-back" onClick={() => navigate('/reviews/final-ratings')}>
          <ArrowLeft size={20} />
          Back to Final Ratings
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Final Ratings', path: '/reviews/final-ratings' },
            { label: 'Distribution', path: '/reviews/final-ratings/distribution', isActive: true },
          ]}
        />
        <h1 className="rating-distribution-page-title">
          <BarChart3 size={24} />
          Rating Distribution
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

      <RatingDistribution cycleId={selectedCycle} />
    </div>
  );
};

export default RatingDistributionPage;