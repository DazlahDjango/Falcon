// src/components/reviews/final-ratings/distribution/RatingDistributionChart.jsx
import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const RatingDistributionChart = ({ distribution = [], total = 0 }) => {
  if (!distribution || distribution.length === 0) {
    return (
      <div className="rating-distribution-chart-empty">
        <p>No distribution data available</p>
      </div>
    );
  }

  const sortedDistribution = [...distribution].sort((a, b) => b.percentage - a.percentage);

  const getColor = (label) => {
    const colors = {
      'Outstanding': '#22c55e',
      'Exceeds Expectations': '#8bc34a',
      'Meets Expectations': '#f59e0b',
      'Needs Improvement': '#f97316',
      'Poor': '#ef4444',
    };
    return colors[label] || '#6b7280';
  };

  const getTrendIcon = (percentage) => {
    if (percentage >= 70) return <TrendingUp size={14} color="#22c55e" />;
    if (percentage >= 40) return <Minus size={14} color="#f59e0b" />;
    return <TrendingDown size={14} color="#ef4444" />;
  };

  return (
    <div className="rating-distribution-chart">
      <div className="rating-distribution-chart-header">
        <h3 className="rating-distribution-chart-title">
          <BarChart3 size={18} />
          Distribution Overview
        </h3>
        <span className="rating-distribution-chart-total">Total: {total} ratings</span>
      </div>

      <div className="rating-distribution-chart-bars">
        {sortedDistribution.map((item, index) => (
          <div key={index} className="rating-distribution-chart-bar-group">
            <div className="rating-distribution-chart-bar-info">
              <span className="rating-distribution-chart-bar-label">{item.rating_label}</span>
              <span className="rating-distribution-chart-bar-count">
                {item.count} ({item.percentage}%)
                {getTrendIcon(item.percentage)}
              </span>
            </div>
            <div className="rating-distribution-chart-bar-track">
              <div
                className="rating-distribution-chart-bar-fill"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color || getColor(item.rating_label),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="rating-distribution-chart-summary">
        <div className="rating-distribution-chart-summary-item">
          <span className="rating-distribution-chart-summary-label">Top Rating</span>
          <span className="rating-distribution-chart-summary-value">
            {sortedDistribution[0]?.rating_label || '—'}
          </span>
        </div>
        <div className="rating-distribution-chart-summary-item">
          <span className="rating-distribution-chart-summary-label">Most Common</span>
          <span className="rating-distribution-chart-summary-value">
            {sortedDistribution[0]?.count || 0} ({sortedDistribution[0]?.percentage || 0}%)
          </span>
        </div>
        <div className="rating-distribution-chart-summary-item">
          <span className="rating-distribution-chart-summary-label">Diversity</span>
          <span className="rating-distribution-chart-summary-value">
            {distribution.length} levels
          </span>
        </div>
      </div>
    </div>
  );
};

export default RatingDistributionChart;