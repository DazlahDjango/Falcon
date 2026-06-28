// src/components/reviews/final-ratings/distribution/RatingDistribution.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Download, BarChart3, PieChart, Grid } from 'lucide-react';
import { useFinalRating } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState } from '../../common';
import RatingDistributionChart from './RatingDistributionChart';
import RatingDistributionTable from './RatingDistributionTable';

const RatingDistribution = () => {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { distribution, loading, error, getDistribution, exportRatings, canManage } = useFinalRating();
  const [viewMode, setViewMode] = useState('chart');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (cycleId) {
      getDistribution(cycleId);
    }
  }, [cycleId, getDistribution]);

  const handleRefresh = () => {
    if (cycleId) {
      getDistribution(cycleId);
    }
  };

  const handleExport = async (format = 'csv') => {
    setIsExporting(true);
    try {
      await exportRatings(cycleId, format);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <ReviewLoading size="lg" text="Loading rating distribution..." />;
  if (error) return <ReviewError error={error} onRetry={handleRefresh} />;
  if (!distribution) return null;

  const total = distribution.total_ratings || 0;

  return (
    <div className="rating-distribution">
      <div className="rating-distribution-header">
        <button className="rating-distribution-back" onClick={() => navigate('/reviews/final-ratings')}>
          <ArrowLeft size={20} />
          Back to Final Ratings
        </button>
        <div className="rating-distribution-title-section">
          <h1 className="rating-distribution-title">Rating Distribution</h1>
          <span className="rating-distribution-cycle">{distribution.cycle_name}</span>
          <span className="rating-distribution-total">{total} ratings</span>
        </div>
        <div className="rating-distribution-actions">
          <button className="rating-distribution-refresh" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
          <div className="rating-distribution-view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'chart' ? 'active' : ''}`}
              onClick={() => setViewMode('chart')}
              aria-label="Chart view"
            >
              <BarChart3 size={18} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              aria-label="Table view"
            >
              <Grid size={18} />
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => handleExport('csv')} disabled={isExporting || total === 0}>
            <Download size={18} />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      <div className="rating-distribution-content">
        {total === 0 ? (
          <ReviewEmptyState
            title="No Ratings Available"
            description="There are no ratings to display for this cycle."
            icon="📊"
          />
        ) : (
          <>
            {viewMode === 'chart' ? (
              <RatingDistributionChart distribution={distribution.distribution} total={total} />
            ) : (
              <RatingDistributionTable distribution={distribution.distribution} total={total} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RatingDistribution;